import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';

import { FloatingConfigurator } from '@core/layout/components/topbar/floating-configurator/floating-configurator';
import { AuthStore } from '../../stores/auth-store';
import { Login } from './login';

interface MockAuthStore {
  login: Mock;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  loggedIn: Signal<boolean>;
  user: Signal<{
    email: string;
    name: string;
    lastLogin: string;
  } | null>;
}

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authStoreMock: MockAuthStore;

  beforeEach(async () => {
    authStoreMock = {
      login: vi.fn(),
      loading: signal(false),
      error: signal(null),
      loggedIn: signal(false),
      user: signal(null),
    };

    await TestBed.configureTestingModule({
      imports: [
        Login,
        ReactiveFormsModule,
        RouterModule.forRoot([]),
        ButtonModule,
        InputTextModule,
        PasswordModule,
        RippleModule,
        IconFieldModule,
        InputIconModule,
        InputGroupModule,
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
      .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with empty email and password', () => {
    expect(component.loginForm.get('email')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should have required validation for email field', () => {
    const emailControl = component.loginForm.get('email');

    emailControl?.setValue('');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.hasError('required')).toBeTruthy();

    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.loginForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();
    expect(emailControl?.hasError('email')).toBeTruthy();

    emailControl?.setValue('test@example.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should have required validation for password field', () => {
    const passwordControl = component.loginForm.get('password');

    passwordControl?.setValue('');
    expect(passwordControl?.valid).toBeFalsy();
    expect(passwordControl?.hasError('required')).toBeTruthy();

    passwordControl?.setValue('password123');
    expect(passwordControl?.valid).toBeTruthy();
  });

  it('should show validation message when email is invalid and touched', () => {
    const emailControl = component.loginForm.get('email');

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
    const emailControl = component.loginForm.get('email');

    emailControl?.setValue('invalid-email');
    emailControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain(
      'Enter a valid email',
    );
  });

  it('should show validation message when password is empty and touched', () => {
    const passwordControl = component.loginForm.get('password');

    passwordControl?.setValue('');
    passwordControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain(
      'Password is required',
    );
  });

  describe('Form validation', () => {
    it('should mark all form controls as touched when form is invalid and button is clicked', () => {
      const loginButton = fixture.debugElement.query(
        By.css('button[type="button"]'),
      );
      loginButton.nativeElement.click();

      expect(component.loginForm.get('email')?.touched).toBe(true);
      expect(component.loginForm.get('password')?.touched).toBe(true);
    });

    it('should call login method of AuthStore when form is valid and button is clicked', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      component.loginForm.patchValue(credentials);
      fixture.detectChanges();

      const loginButton = fixture.debugElement.query(
        By.css('button[type="button"]'),
      );
      loginButton.nativeElement.click();

      expect(authStoreMock.login).toHaveBeenCalledWith(credentials);
    });

    it('should disable login button when loading', () => {
      authStoreMock.loading.set(true);
      fixture.detectChanges();

      const loginButton = fixture.debugElement.query(
        By.css('button[type="button"]'),
      );
      expect(loginButton.nativeElement.disabled).toBe(true);
    });
  });

  it('should contain link to registration page', () => {
    const registrationLink = fixture.debugElement.query(
      By.css('a[routerLink="/register"]'),
    );
    expect(registrationLink).toBeTruthy();
    expect(registrationLink.nativeElement.textContent.trim()).toBe('Register');
  });
});
