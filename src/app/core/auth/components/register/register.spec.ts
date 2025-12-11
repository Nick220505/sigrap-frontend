import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { NgClass } from '@angular/common';
import { Signal, WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
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
import { PasswordField } from 'app/shared/components/password-field/password-field';
import { AuthStore } from '../../stores/auth-store';
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
        NoopAnimationsModule,
      ],
      providers: [
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
                [class.ng-dirty]="control().touched && control().invalid"
                [class.ng-invalid]="control().touched && control().invalid"
              />
              @if (control().touched && control().hasError('required')) {
                <small class="text-red-500">Password is required.</small>
              } @else if (control().touched && control().hasError('pattern')) {
                <small class="text-red-500">
                  Password must contain at least one uppercase, one lowercase,
                  a number and a special character.
                </small>
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
        'Name is required',
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
        'Email is required',
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
        'Enter a valid email',
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
        'Password is required',
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
        'Password must contain at least one uppercase, one lowercase, a number and a special character',
      );
    });
  });

  describe('Confirm Password validation', () => {
    it('should have required validation for confirm password field', () => {
      const confirmPasswordControl =
        component.registerForm.get('confirmPassword');

      confirmPasswordControl?.setValue('');
      expect(confirmPasswordControl?.valid).toBeFalsy();
      expect(confirmPasswordControl?.hasError('required')).toBeTruthy();
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
        'Password is required',
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

      const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Passwords do not match',
      );
    });
  });

  describe('Form validation', () => {
    it('should mark all form controls as touched when form is invalid and button is clicked', () => {
      const registerButton = fixture.debugElement.query(
        By.css('button[type="button"]'),
      );
      registerButton.nativeElement.click();

      expect(component.registerForm.get('name')?.touched).toBe(true);
      expect(component.registerForm.get('email')?.touched).toBe(true);
      expect(component.registerForm.get('password')?.touched).toBe(true);
      expect(component.registerForm.get('confirmPassword')?.touched).toBe(true);
    });

    it('should call register method of AuthStore when form is valid and button is clicked', () => {
      const userData = {
        name: 'John Doe',
        email: 'test@example.com',
        password: 'Password1!',
      };

      component.registerForm.patchValue({
        ...userData,
        confirmPassword: 'Password1!',
      });
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
