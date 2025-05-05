import { NgClass } from '@angular/common';
import { Signal, WritableSignal, signal } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';

import { FloatingConfiguratorComponent } from '@core/layout/components/topbar/floating-configurator/floating-configurator.component';
import { AuthStore } from '../../stores/auth.store';
import { RegisterComponent } from './register.component';

class MockAuthStore {
  register = jasmine.createSpy('register');
  loading: Signal<boolean> = signal(false);
}

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authStoreMock: MockAuthStore;

  beforeEach(async () => {
    authStoreMock = new MockAuthStore();

    await TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        ButtonModule,
        InputTextModule,
        PasswordModule,
        RippleModule,
        IconFieldModule,
        InputIconModule,
        DividerModule,
        NgClass,
        ToastModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: AuthStore, useValue: authStoreMock },
        MessageService,
      ],
    })
      .overrideComponent(FloatingConfiguratorComponent, {
        set: {
          template: '',
          imports: [],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize register form with empty values', () => {
    expect(component.registerForm.get('name')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  describe('Name field validation', () => {
    it('should have required validation for name field', () => {
      const nameControl = component.registerForm.get('name');

      nameControl?.setValue('');
      expect(nameControl?.valid).toBeFalsy();
      expect(nameControl?.hasError('required')).toBeTruthy();

      nameControl?.setValue('John Doe');
      expect(nameControl?.valid).toBeTruthy();
    });

    it('should show validation message when name is empty and touched', () => {
      const nameControl = component.registerForm.get('name');

      nameControl?.setValue('');
      nameControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'El nombre es obligatorio',
      );
    });
  });

  describe('Email field validation', () => {
    it('should have required validation for email field', () => {
      const emailControl = component.registerForm.get('email');

      emailControl?.setValue('');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.hasError('required')).toBeTruthy();

      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');

      emailControl?.setValue('invalid-email');
      expect(emailControl?.valid).toBeFalsy();
      expect(emailControl?.hasError('email')).toBeTruthy();

      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBeTruthy();
    });

    it('should show validation message when email is empty and touched', () => {
      const emailControl = component.registerForm.get('email');

      emailControl?.setValue('');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'El correo electrónico es obligatorio',
      );
    });

    it('should show validation message when email format is invalid and touched', () => {
      const emailControl = component.registerForm.get('email');

      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Ingrese un correo electrónico válido',
      );
    });
  });

  describe('Password field validation', () => {
    it('should have required validation for password field', () => {
      const passwordControl = component.registerForm.get('password');

      passwordControl?.setValue('');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('required')).toBeTruthy();
    });

    it('should validate password pattern', () => {
      const passwordControl = component.registerForm.get('password');

      passwordControl?.setValue('password');
      expect(passwordControl?.valid).toBeFalsy();
      expect(passwordControl?.hasError('pattern')).toBeTruthy();

      passwordControl?.setValue('Password');
      expect(passwordControl?.valid).toBeFalsy();

      passwordControl?.setValue('Password1');
      expect(passwordControl?.valid).toBeFalsy();

      passwordControl?.setValue('Password1!');
      expect(passwordControl?.valid).toBeTruthy();
    });

    it('should show validation message when password is empty and touched', () => {
      const passwordControl = component.registerForm.get('password');

      passwordControl?.setValue('');
      passwordControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'La contraseña es obligatoria',
      );
    });

    it('should show validation message when password pattern is invalid and touched', () => {
      const passwordControl = component.registerForm.get('password');

      passwordControl?.setValue('password');
      passwordControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'La contraseña debe cumplir todos los requisitos',
      );
    });
  });

  describe('Password strength indicators', () => {
    it('should update password strength indicators when password changes', () => {
      const passwordControl = component.registerForm.get('password');

      expect(component.hasMinLength()).toBeFalsy();
      expect(component.hasLowercase()).toBeFalsy();
      expect(component.hasUppercase()).toBeFalsy();
      expect(component.hasNumber()).toBeFalsy();
      expect(component.hasSpecialChar()).toBeFalsy();

      passwordControl?.setValue('abcdefgh');
      expect(component.hasMinLength()).toBeTruthy();
      expect(component.hasLowercase()).toBeTruthy();
      expect(component.hasUppercase()).toBeFalsy();
      expect(component.hasNumber()).toBeFalsy();
      expect(component.hasSpecialChar()).toBeFalsy();

      passwordControl?.setValue('Abcdefgh');
      expect(component.hasMinLength()).toBeTruthy();
      expect(component.hasLowercase()).toBeTruthy();
      expect(component.hasUppercase()).toBeTruthy();
      expect(component.hasNumber()).toBeFalsy();
      expect(component.hasSpecialChar()).toBeFalsy();

      passwordControl?.setValue('Abcdefg1');
      expect(component.hasMinLength()).toBeTruthy();
      expect(component.hasLowercase()).toBeTruthy();
      expect(component.hasUppercase()).toBeTruthy();
      expect(component.hasNumber()).toBeTruthy();
      expect(component.hasSpecialChar()).toBeFalsy();

      passwordControl?.setValue('Abcdef1!');
      expect(component.hasMinLength()).toBeTruthy();
      expect(component.hasLowercase()).toBeTruthy();
      expect(component.hasUppercase()).toBeTruthy();
      expect(component.hasNumber()).toBeTruthy();
      expect(component.hasSpecialChar()).toBeTruthy();
    });
  });

  describe('Confirm Password validation', () => {
    it('should have required validation for confirm password field', () => {
      const confirmPasswordControl =
        component.registerForm.get('confirmPassword');

      confirmPasswordControl?.setValue('');
      expect(confirmPasswordControl?.valid).toBeFalsy();
      expect(confirmPasswordControl?.hasError('required')).toBeTruthy();

      confirmPasswordControl?.setValue('Password1!');
      expect(confirmPasswordControl?.valid).toBeTruthy();
    });

    it('should validate that passwords match', () => {
      const passwordControl = component.registerForm.get('password');
      const confirmPasswordControl =
        component.registerForm.get('confirmPassword');

      passwordControl?.setValue('Password1!');
      confirmPasswordControl?.setValue('DifferentPassword1!');
      fixture.detectChanges();

      expect(component.registerForm.hasError('passwordMismatch')).toBeTruthy();

      confirmPasswordControl?.setValue('Password1!');
      fixture.detectChanges();

      expect(component.registerForm.hasError('passwordMismatch')).toBeFalsy();
    });

    it('should show validation message when confirm password is empty and touched', () => {
      const confirmPasswordControl =
        component.registerForm.get('confirmPassword');

      confirmPasswordControl?.setValue('');
      confirmPasswordControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Debe confirmar la contraseña',
      );
    });

    it('should show validation message when passwords do not match', () => {
      const passwordControl = component.registerForm.get('password');
      const confirmPasswordControl =
        component.registerForm.get('confirmPassword');

      passwordControl?.setValue('Password1!');
      confirmPasswordControl?.setValue('DifferentPassword1!');
      confirmPasswordControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(
        By.css('.text-red-500'),
      );
      const passwordMismatchMessage = errorMessages.find((el) =>
        el.nativeElement.textContent.includes('Las contraseñas no coinciden'),
      );

      expect(passwordMismatchMessage).toBeTruthy();
    });
  });

  describe('Form submission', () => {
    it('should call register method of AuthStore when form is valid and button is clicked', fakeAsync(() => {
      component.registerForm.setValue({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
      });
      fixture.detectChanges();

      const registerButton = fixture.debugElement.query(By.css('p-button'));
      expect(registerButton).toBeTruthy();

      component.register();
      tick();
      fixture.detectChanges();

      expect(authStoreMock.register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password1!',
      });
    }));

    it('should mark all form controls as touched when form is invalid and button is clicked', fakeAsync(() => {
      expect(component.registerForm.valid).toBeFalsy();

      expect(component.registerForm.get('name')?.touched).toBeFalsy();
      expect(component.registerForm.get('email')?.touched).toBeFalsy();
      expect(component.registerForm.get('password')?.touched).toBeFalsy();
      expect(
        component.registerForm.get('confirmPassword')?.touched,
      ).toBeFalsy();

      if (component.registerForm.valid) {
        component.register();
      } else {
        component.registerForm.markAllAsTouched();
      }

      tick();
      fixture.detectChanges();

      expect(component.registerForm.get('name')?.touched).toBeTruthy();
      expect(component.registerForm.get('email')?.touched).toBeTruthy();
      expect(component.registerForm.get('password')?.touched).toBeTruthy();
      expect(
        component.registerForm.get('confirmPassword')?.touched,
      ).toBeTruthy();
      expect(authStoreMock.register).not.toHaveBeenCalled();
    }));
  });

  describe('UI elements', () => {
    it('should display register button in loading state when AuthStore is loading', () => {
      (authStoreMock.loading as WritableSignal<boolean>).set(true);
      fixture.detectChanges();

      const registerButton = fixture.debugElement.query(By.css('p-button'));
      expect(registerButton.componentInstance.loading).toBeTrue();
    });

    it('should contain link to login page', () => {
      const loginLink = fixture.debugElement.query(
        By.css('a[routerLink="/iniciar-sesion"]'),
      );
      expect(loginLink).toBeTruthy();
      expect(loginLink.nativeElement.textContent.trim()).toBe('Inicia sesión');
    });
  });
});
