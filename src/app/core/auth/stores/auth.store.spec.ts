import {
  HttpErrorResponse,
  HttpStatusCode,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, of, throwError } from 'rxjs';
import { AuthResponse } from '../models/auth-response.model';
import { AuthService } from '../services/auth.service';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let authService: jasmine.SpyObj<AuthService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['login', 'register']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);
    router = jasmine.createSpyObj('Router', ['navigate', 'createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authService },
        { provide: MessageService, useValue: messageService },
        { provide: Router, useValue: router },
      ],
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have default state values', () => {
      expect(store.user()).toBeNull();
      expect(store.loggedIn()).toBeFalse();
      expect(store.token()).toBeNull();
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
    });
  });

  describe('login', () => {
    it('should set loading state to true when login starts', () => {
      const noop = (): void => undefined;
      const pendingObservable = new Observable<never>(noop);
      authService.login.and.returnValue(pendingObservable);

      store.login({ email: 'test@example.com', password: 'password123' });

      expect(store.loading()).toBeTrue();
      expect(store.error()).toBeNull();
    });

    it('should update state and navigate on successful login', () => {
      const mockResponse: AuthResponse = {
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.login.and.returnValue(of(mockResponse));

      store.login({ email: 'test@example.com', password: 'password123' });

      expect(store.user()).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(store.loggedIn()).toBeTrue();
      expect(store.token()).toBe('test-token');
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Inicio de sesión exitoso',
        detail: 'Bienvenido/a, Test User',
      });

      expect(localStorage.getItem('auth_token')).toBe('test-token');
      expect(localStorage.getItem('user_data')).toBe(
        JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
      );
    });

    it('should handle 401 error during login', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Invalid credentials' },
        status: HttpStatusCode.Unauthorized,
        statusText: 'Unauthorized',
      });

      authService.login.and.returnValue(throwError(() => errorResponse));

      store.login({ email: 'test@example.com', password: 'wrong' });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe('Credenciales inválidas');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Credenciales inválidas',
      });
    });

    it('should handle generic error during login', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error occurred' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      authService.login.and.returnValue(throwError(() => errorResponse));

      store.login({ email: 'test@example.com', password: 'password123' });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe('Server error occurred');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Server error occurred',
      });
    });

    it('should handle error with message "Invalid credentials" during login', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Invalid credentials' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      authService.login.and.returnValue(throwError(() => errorResponse));

      store.login({ email: 'test@example.com', password: 'password123' });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe('Credenciales inválidas');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Credenciales inválidas',
      });
    });

    it('should use default error message when no specific error is provided', () => {
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      authService.login.and.returnValue(throwError(() => errorResponse));

      store.login({ email: 'test@example.com', password: 'password123' });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe(
        'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.',
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.',
      });
    });
  });

  describe('register', () => {
    it('should set loading state to true when register starts', () => {
      const noop = (): void => undefined;
      const pendingObservable = new Observable<never>(noop);
      authService.register.and.returnValue(pendingObservable);

      store.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(store.loading()).toBeTrue();
      expect(store.error()).toBeNull();
    });

    it('should update state and navigate on successful registration', () => {
      const mockResponse: AuthResponse = {
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test User',
      };

      authService.register.and.returnValue(of(mockResponse));

      store.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(store.user()).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(store.loggedIn()).toBeTrue();
      expect(store.token()).toBe('test-token');
      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Registro exitoso',
        detail: 'Cuenta creada correctamente. Bienvenido/a, Test User!',
      });

      expect(localStorage.getItem('auth_token')).toBe('test-token');
      expect(localStorage.getItem('user_data')).toBe(
        JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
      );
    });

    it('should handle duplicate email error during registration', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Email already exists' },
        status: HttpStatusCode.Conflict,
        statusText: 'Conflict',
      });

      authService.register.and.returnValue(throwError(() => errorResponse));

      store.register({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe('El correo electrónico ya está registrado');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El correo electrónico ya está registrado',
      });
    });

    it('should handle "Email already exists" message with different status', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Email already exists' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      authService.register.and.returnValue(throwError(() => errorResponse));

      store.register({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe('El correo electrónico ya está registrado');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El correo electrónico ya está registrado',
      });
    });

    it('should handle generic error during registration', () => {
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error occurred' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      authService.register.and.returnValue(throwError(() => errorResponse));

      store.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe('Server error occurred');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Server error occurred',
      });
    });

    it('should use default error message when no specific error is provided during registration', () => {
      const errorResponse = new HttpErrorResponse({
        error: {},
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      authService.register.and.returnValue(throwError(() => errorResponse));

      store.register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe(
        'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.',
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail:
          'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.',
      });
    });
  });

  describe('logout', () => {
    it('should clear state and navigate to login page', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem(
        'user_data',
        JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
      );

      store.loadAuthStateFromStorage();

      expect(store.loggedIn()).toBeTrue();
      expect(store.token()).toBe('test-token');
      expect(store.user()).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });

      store.logout();

      expect(store.loggedIn()).toBeFalse();
      expect(store.token()).toBeNull();
      expect(store.user()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Sesión cerrada',
        detail: 'Ha cerrado sesión exitosamente',
      });
      expect(router.navigate).toHaveBeenCalledWith(['/iniciar-sesion']);
    });
  });

  describe('getToken', () => {
    it('should return token from state if available', () => {
      localStorage.setItem('auth_token', 'test-token');
      store.loadAuthStateFromStorage();

      const token = store.getToken();
      expect(token).toBe('test-token');
    });

    it('should return token from localStorage if not in state', () => {
      localStorage.setItem('auth_token', 'local-token');

      const token = store.getToken();
      expect(token).toBe('local-token');
    });

    it('should return null if no token is available', () => {
      const token = store.getToken();
      expect(token).toBeNull();
    });
  });

  describe('loadAuthStateFromStorage', () => {
    it('should load state from localStorage if valid data exists', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem(
        'user_data',
        JSON.stringify({ email: 'test@example.com', name: 'Test User' }),
      );

      store.loadAuthStateFromStorage();

      expect(store.loggedIn()).toBeTrue();
      expect(store.token()).toBe('test-token');
      expect(store.user()).toEqual({
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('should not update state if localStorage data is missing', () => {
      store.loadAuthStateFromStorage();

      expect(store.loggedIn()).toBeFalse();
      expect(store.token()).toBeNull();
      expect(store.user()).toBeNull();
    });

    it('should handle invalid JSON in localStorage and clear it', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user_data', 'invalid-json');

      store.loadAuthStateFromStorage();

      expect(store.loggedIn()).toBeFalse();
      expect(store.token()).toBeNull();
      expect(store.user()).toBeNull();
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });
});
