import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockResponse = {
    token: 'test-token',
    email: 'test@example.com',
    name: 'Test User',
    lastLogin: new Date().toISOString(),
    role: 'ADMINISTRATOR',
  };

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'register',
    ]);

    authServiceSpy.login.and.returnValue(of(mockResponse));
    authServiceSpy.register.and.returnValue(of(mockResponse));

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy },
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });

    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    messageService = TestBed.inject(
      MessageService,
    ) as jasmine.SpyObj<MessageService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('login', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should update state and navigate on successful login', () => {
      store.login(credentials);

      expect(authService.login).toHaveBeenCalledWith(credentials);
      expect(store.user()).toEqual({
        email: mockResponse.email,
        name: mockResponse.name,
        lastLogin: mockResponse.lastLogin,
        role: mockResponse.role,
      });
      expect(store.token()).toBe(mockResponse.token);
      expect(store.loggedIn()).toBeTrue();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(localStorage.getItem('auth_token')).toBe(mockResponse.token);
      expect(localStorage.getItem('user_data')).toBe(
        JSON.stringify({
          email: mockResponse.email,
          name: mockResponse.name,
          lastLogin: mockResponse.lastLogin,
          role: mockResponse.role,
        }),
      );
    });

    it('should handle error on login failure', () => {
      authService.login.and.returnValue(
        throwError(() => new Error('Failed to login')),
      );

      store.login(credentials);

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

    it('should handle 401 Unauthorized status with appropriate message', () => {
      const httpError = {
        status: HttpStatusCode.Unauthorized,
      };
      authService.login.and.returnValue(throwError(() => httpError));

      store.login(credentials);

      expect(store.error()).toBe('Credenciales inválidas');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Credenciales inválidas',
      });
    });

    it('should handle 403 Forbidden status with appropriate message', () => {
      const httpError = {
        status: HttpStatusCode.Forbidden,
      };
      authService.login.and.returnValue(throwError(() => httpError));

      store.login(credentials);

      expect(store.error()).toBe('Credenciales inválidas');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Credenciales inválidas',
      });
    });

    it('should handle error with "Invalid credentials" message', () => {
      const error = {
        error: { message: 'Invalid credentials' },
      };
      authService.login.and.returnValue(throwError(() => error));

      store.login(credentials);

      expect(store.error()).toBe('Credenciales inválidas');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Credenciales inválidas',
      });
    });

    it('should handle other error messages', () => {
      const error = {
        error: { message: 'Other error' },
      };
      authService.login.and.returnValue(throwError(() => error));

      store.login(credentials);

      expect(store.error()).toBe('Other error');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Other error',
      });
    });

    it('should set loading state during login', () => {
      store.login(credentials);
      expect(store.loading()).toBeFalse();
    });
  });

  describe('register', () => {
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    };

    it('should update state and navigate on successful registration', () => {
      store.register(registerData);

      expect(authService.register).toHaveBeenCalledWith(registerData);
      expect(store.user()).toEqual({
        email: mockResponse.email,
        name: mockResponse.name,
        lastLogin: mockResponse.lastLogin,
        role: mockResponse.role,
      });
      expect(store.token()).toBe(mockResponse.token);
      expect(store.loggedIn()).toBeTrue();
      expect(router.navigate).toHaveBeenCalledWith(['/']);
      expect(localStorage.getItem('auth_token')).toBe(mockResponse.token);
      expect(localStorage.getItem('user_data')).toBe(
        JSON.stringify({
          email: mockResponse.email,
          name: mockResponse.name,
          lastLogin: mockResponse.lastLogin,
          role: mockResponse.role,
        }),
      );
    });

    it('should handle error on registration failure', () => {
      authService.register.and.returnValue(
        throwError(() => new Error('Failed to register')),
      );

      store.register(registerData);

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

    it('should handle conflict status (409) with email exists message', () => {
      const httpError = {
        status: HttpStatusCode.Conflict,
      };
      authService.register.and.returnValue(throwError(() => httpError));

      store.register(registerData);

      expect(store.error()).toBe('El correo electrónico ya está registrado');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El correo electrónico ya está registrado',
      });
    });

    it('should handle error with "Email already exists" message', () => {
      const error = {
        error: { message: 'Email already exists' },
      };
      authService.register.and.returnValue(throwError(() => error));

      store.register(registerData);

      expect(store.error()).toBe('El correo electrónico ya está registrado');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El correo electrónico ya está registrado',
      });
    });

    it('should handle custom error messages during registration', () => {
      const error = {
        error: { message: 'Custom error message' },
      };
      authService.register.and.returnValue(throwError(() => error));

      store.register(registerData);

      expect(store.error()).toBe('Custom error message');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Custom error message',
      });
    });

    it('should set loading state during registration', () => {
      store.register(registerData);
      expect(store.loading()).toBeFalse();
    });
  });

  describe('logout', () => {
    it('should clear state and navigate to login page', () => {
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
        lastLogin: new Date().toISOString(),
        role: 'ADMINISTRATOR',
      };
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      store.logout();

      expect(store.user()).toBeNull();
      expect(store.token()).toBeNull();
      expect(store.loggedIn()).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/iniciar-sesion']);
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_data')).toBeNull();
    });
  });

  describe('loadAuthStateFromStorage', () => {
    it('should load state from localStorage if valid data exists', () => {
      const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
        lastLogin: new Date().toISOString(),
        role: 'ADMINISTRATOR',
      };
      const mockToken = 'test-token';
      localStorage.setItem('auth_token', mockToken);
      localStorage.setItem('user_data', JSON.stringify(mockUser));

      store.loadAuthStateFromStorage();

      expect(store.user()).toEqual(mockUser);
      expect(store.token()).toBe(mockToken);
      expect(store.loggedIn()).toBeTrue();
    });

    it('should not load state if localStorage data is invalid', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user_data', 'invalid json');

      store.loadAuthStateFromStorage();

      expect(store.user()).toBeNull();
      expect(store.token()).toBeNull();
      expect(store.loggedIn()).toBeFalse();
    });

    it('should not load state if localStorage is empty', () => {
      store.loadAuthStateFromStorage();

      expect(store.user()).toBeNull();
      expect(store.token()).toBeNull();
      expect(store.loggedIn()).toBeFalse();
    });
  });

  describe('getToken', () => {
    it('should return token from store if available', () => {
      store.login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(store.getToken()).toBe('test-token');
    });

    it('should return token from localStorage if store token is null', () => {
      localStorage.setItem('auth_token', 'storage-token');
      expect(store.getToken()).toBe('storage-token');
    });

    it('should return null if no token exists', () => {
      localStorage.removeItem('auth_token');
      expect(store.getToken()).toBeNull();
    });
  });
});
