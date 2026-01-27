import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { Signal, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
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
        RouterModule.forRoot([]),
        ButtonModule,
        InputTextModule,
        PasswordModule,
        RippleModule,
        IconFieldModule,
        InputIconModule,
        InputGroupModule,
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
      .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize login form with default admin credentials', () => {
    expect(component.loginForm.email().value()).toBe('admin@sigrap.com');
    expect(component.loginForm.password().value()).toBe('Admin123*');
  });

  it('should have required validation for email field', () => {
    component.loginForm.email().value.set('');
    expect(component.loginForm.email().invalid()).toBe(true);
    expect(
      component.loginForm
        .email()
        .errors()
        .some((e) => e.kind === 'required'),
    ).toBe(true);

    component.loginForm.email().value.set('test@example.com');
    expect(component.loginForm.email().valid()).toBe(true);
  });

  it('should validate email format', () => {
    component.loginForm.email().value.set('invalid-email');
    expect(component.loginForm.email().invalid()).toBe(true);
    expect(
      component.loginForm
        .email()
        .errors()
        .some((e) => e.kind === 'email'),
    ).toBe(true);

    component.loginForm.email().value.set('test@example.com');
    expect(component.loginForm.email().valid()).toBe(true);
  });

  it('should have required validation for password field', () => {
    component.loginForm.password().value.set('');
    expect(component.loginForm.password().invalid()).toBe(true);
    expect(
      component.loginForm
        .password()
        .errors()
        .some((e) => e.kind === 'required'),
    ).toBe(true);

    component.loginForm.password().value.set('password123');
    expect(component.loginForm.password().valid()).toBe(true);
  });

  it('should show validation message when email is invalid and touched', () => {
    component.loginForm.email().value.set('');
    component.loginForm.email().markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain(
      'Email is required',
    );
  });

  it('should show validation message when email format is invalid and touched', () => {
    component.loginForm.email().value.set('invalid-email');
    component.loginForm.email().markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain(
      'Enter a valid email',
    );
  });

  it('should show validation message when password is empty and touched', () => {
    component.loginForm.password().value.set('');
    component.loginForm.password().markAsTouched();
    fixture.detectChanges();

    const errorMessage = fixture.debugElement.query(By.css('.text-red-500'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain(
      'Password is required',
    );
  });

  describe('Form validation', () => {
    it('should mark all form controls as touched when form is invalid and button is clicked', () => {
      component.loginForm.email().value.set('');
      component.loginForm.password().value.set('');
      fixture.detectChanges();

      const loginButton = fixture.debugElement.query(
        By.css('button[type="submit"]'),
      );
      loginButton.nativeElement.click();

      expect(component.loginForm.email().touched()).toBe(true);
      expect(component.loginForm.password().touched()).toBe(true);
    });

    it('should call login method of AuthStore when form is valid and button is clicked', () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      component.loginForm.email().value.set(credentials.email);
      component.loginForm.password().value.set(credentials.password);
      fixture.detectChanges();

      const loginButton = fixture.debugElement.query(
        By.css('button[type="submit"]'),
      );
      loginButton.nativeElement.click();

      expect(authStoreMock.login).toHaveBeenCalledWith(credentials);
    });

    it('should disable login button when loading', () => {
      authStoreMock.loading.set(true);
      fixture.detectChanges();

      const loginButton = fixture.debugElement.query(
        By.css('button[type="submit"]'),
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
