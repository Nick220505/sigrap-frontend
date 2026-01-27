import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { NgClass } from '@angular/common';
import { Signal, WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';

import { FloatingConfigurator } from '@core/layout/components/topbar/floating-configurator/floating-configurator';
import { PasswordField } from '@shared/components/password-field/password-field';
import { AuthStore } from '@core/auth/stores/auth-store';
import { Register } from './register';

interface MockAuthStore {
  register: Mock;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  loggedIn: Signal<boolean>;
  user: Signal<{
    email: string;
    name: string;
    lastLogin: string;
  } | null>;
}

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let authStoreMock: MockAuthStore;

  beforeEach(async () => {
    authStoreMock = {
      register: vi.fn(),
      loading: signal(false),
      error: signal(null),
      loggedIn: signal(false),
      user: signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [
        Register,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        ButtonModule,
        InputTextModule,
        PasswordModule,
        RippleModule,
        IconFieldModule,
        InputIconModule,
        InputGroupModule,
        InputGroupAddonModule,
        DividerModule,
        NgClass,
      ],
      providers: [
        providePrimeNG({
          theme: {
            preset: Aura,
            options: {
              darkModeSelector: '.app-dark',
              cssLayer: {
                name: 'primeng',
                order: 'theme, base, primeng',
              },
            },
          },
        }),
        { provide: AuthStore, useValue: authStoreMock },
        MessageService,
      ],
    })
      .overrideComponent(FloatingConfigurator, {
        set: {
          template: '',
          imports: [],
        },
      })
      .overrideComponent(PasswordField, {
        set: {
          template: `
            <div class="flex flex-col gap-2">
              <label [for]="id()" class="font-bold">{{ label() }}</label>
              <input
                [id]="id()"
                type="password"
                [formControl]="control()"
                [placeholder]="placeholder()"
              />
              @if (control().touched && control().hasError('required')) {
                <small class="text-red-500">Password is required.</small>
              } @else if (control().touched && control().hasError('pattern')) {
                <small class="text-red-500">Password must meet all requirements.</small>
              }
            </div>
          `,
          imports: [ReactiveFormsModule, NgClass],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize register form with empty values', () => {
    expect(component.registerForm().value()).toEqual({
      name: '',
      email: '',
    });
    expect(component.passwordControl.value).toBe('');
    expect(component.confirmPasswordControl.value).toBe('');
  });

  describe('Name field validation', () => {
    it('should have required validation for name field', () => {
      component.registerForm.name().value.set('');
      expect(component.registerForm.name().valid()).toBe(false);
      expect(
        component.registerForm
          .name()
          .errors()
          .some((e) => e.kind === 'required'),
      ).toBe(true);

      component.registerForm.name().value.set('John Doe');
      expect(component.registerForm.name().valid()).toBe(true);
    });

    it('should show validation message when name is empty and touched', () => {
      component.registerForm.name().value.set('');
      component.registerForm.name().markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Name is required',
      );
    });
  });

  describe('Email field validation', () => {
    it('should have required validation for email field', () => {
      component.registerForm.email().value.set('');
      expect(component.registerForm.email().valid()).toBe(false);
      expect(
        component.registerForm
          .email()
          .errors()
          .some((e) => e.kind === 'required'),
      ).toBe(true);

      component.registerForm.email().value.set('test@example.com');
      expect(component.registerForm.email().valid()).toBe(true);
    });

    it('should validate email format', () => {
      component.registerForm.email().value.set('invalid-email');
      expect(component.registerForm.email().valid()).toBe(false);

      component.registerForm.email().value.set('test@example.com');
      expect(component.registerForm.email().valid()).toBe(true);
    });

    it('should show validation message when email is empty and touched', () => {
      component.registerForm.email().value.set('');
      component.registerForm.email().markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Email is required',
      );
    });

    it('should show validation message when email format is invalid and touched', () => {
      component.registerForm.email().value.set('invalid-email');
      component.registerForm.email().markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Enter a valid email',
      );
    });
  });

  describe('Password field validation', () => {
    it('should have required validation for password field', () => {
      component.passwordControl.setValue('');
      component.passwordControl.updateValueAndValidity();
      expect(component.passwordControl.valid).toBe(false);
      expect(component.passwordControl.hasError('required')).toBe(true);
    });

    it('should validate password pattern', () => {
      component.passwordControl.setValue('password');
      component.passwordControl.updateValueAndValidity();
      expect(component.passwordControl.valid).toBe(false);
      expect(component.passwordControl.hasError('pattern')).toBe(true);

      component.passwordControl.setValue('Password');
      component.passwordControl.updateValueAndValidity();
      expect(component.passwordControl.valid).toBe(false);

      component.passwordControl.setValue('Password1');
      component.passwordControl.updateValueAndValidity();
      expect(component.passwordControl.valid).toBe(false);

      component.passwordControl.setValue('Password1!');
      component.passwordControl.updateValueAndValidity();
      expect(component.passwordControl.valid).toBe(true);
    });

    it('should show validation message when password is empty and touched', () => {
      component.passwordControl.setValue('');
      component.passwordControl.markAsTouched();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(
        By.css('.text-red-500'),
      );
      expect(
        errorMessages.some((m) =>
          (m.nativeElement.textContent as string).includes(
            'Password is required',
          ),
        ),
      ).toBe(true);
    });

    it('should show validation message when password pattern is invalid and touched', () => {
      component.passwordControl.setValue('password');
      component.passwordControl.markAsTouched();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(
        By.css('.text-red-500'),
      );
      expect(
        errorMessages.some((m) =>
          (m.nativeElement.textContent as string).includes(
            'Password must meet all requirements',
          ),
        ),
      ).toBe(true);
    });
  });

  describe('Confirm Password validation', () => {
    it('should have required validation for confirm password field', () => {
      component.confirmPasswordControl.setValue('');
      component.confirmPasswordControl.updateValueAndValidity();
      expect(component.confirmPasswordControl.valid).toBe(false);
      expect(component.confirmPasswordControl.hasError('required')).toBe(true);
    });

    it('should validate that passwords match', () => {
      component.passwordControl.setValue('Password1!');
      component.confirmPasswordControl.setValue('DifferentPassword1!');
      fixture.detectChanges();

      component.onSubmit();
      expect(
        component.confirmPasswordControl.hasError('passwordMismatch'),
      ).toBe(true);

      component.confirmPasswordControl.setValue('Password1!');
      fixture.detectChanges();

      component.onSubmit();
      expect(
        component.confirmPasswordControl.hasError('passwordMismatch'),
      ).toBe(false);
    });

    it('should show validation message when confirm password is empty and touched', () => {
      component.confirmPasswordControl.setValue('');
      component.confirmPasswordControl.markAsTouched();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(
        By.css('.text-red-500'),
      );
      expect(
        errorMessages.some((m) =>
          (m.nativeElement.textContent as string).includes(
            'Password is required',
          ),
        ),
      ).toBe(true);
    });

    it('should show validation message when passwords do not match', () => {
      component.passwordControl.setValue('Password1!');
      component.confirmPasswordControl.setValue('DifferentPassword1!');
      component.confirmPasswordControl.markAsTouched();
      fixture.detectChanges();

      component.onSubmit();
      fixture.detectChanges();

      const errorMessages = fixture.debugElement.queryAll(
        By.css('.text-red-500'),
      );
      expect(
        errorMessages.some((m) =>
          (m.nativeElement.textContent as string).includes(
            'Passwords do not match',
          ),
        ),
      ).toBe(true);
    });
  });

  describe('Form validation', () => {
    it('should mark all form controls as touched when form is invalid and button is clicked', () => {
      const registerButton = fixture.debugElement.query(
        By.css('button[type="button"]'),
      );
      registerButton.nativeElement.click();

      expect(component.registerForm.name().touched()).toBe(true);
      expect(component.registerForm.email().touched()).toBe(true);
      expect(component.passwordControl.touched).toBe(true);
      expect(component.confirmPasswordControl.touched).toBe(true);
    });

    it('should call register method of AuthStore when form is valid and button is clicked', () => {
      const userData = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'Password1!',
      };

      component.registerForm.name().value.set(userData.name);
      component.registerForm.email().value.set(userData.email);
      component.passwordControl.setValue(userData.password);
      component.confirmPasswordControl.setValue(userData.password);
      fixture.detectChanges();

      const registerButton = fixture.debugElement.query(
        By.css('button[type="button"]'),
      );
      registerButton.nativeElement.click();

      expect(authStoreMock.register).toHaveBeenCalledWith(userData);
    });

    it('should disable register button when loading', () => {
      authStoreMock.loading.set(true);
      fixture.detectChanges();

      const registerButton = fixture.debugElement.query(
        By.css('button[type="button"]'),
      );
      expect(registerButton.nativeElement.disabled).toBe(true);
    });
  });

  describe('UI elements', () => {
    it('should contain link to login page', () => {
      const loginLink = fixture.debugElement.query(
        By.css('a[routerLink="/login"]'),
      );
      expect(loginLink).toBeTruthy();
      expect(loginLink.nativeElement.textContent.trim()).toBe('Log in');
    });
  });
});
