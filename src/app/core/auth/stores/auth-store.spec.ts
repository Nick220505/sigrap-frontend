import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { HttpStatusCode, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { AuthStore } from './auth-store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let authService: {
    login: Mock;
    register: Mock;
  };
  let router: { navigate: Mock };
  let messageService: { add: Mock };
  let httpMock: HttpTestingController;
  let localStorageMock: Storage;

  const createLocalStorageMock = (): Storage => {
    const data = new Map<string, string>();
    return {
      get length() {
        return data.size;
      },
      clear() {
        data.clear();
      },
      getItem(key: string) {
        return data.has(key) ? data.get(key)! : null;
      },
      key(index: number) {
        return Array.from(data.keys())[index] ?? null;
      },
      removeItem(key: string) {
        data.delete(key);
      },
      setItem(key: string, value: string) {
        data.set(key, value);
      },
    } as unknown as Storage;
  };

  const mockResponse = {
    token: 'test-token',
    email: 'test@example.com',
    name: 'Test User',
    lastLogin: new Date().toISOString(),
    role: 'ADMINISTRATOR',
  };

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorageMock);

    const routerSpy = {
      navigate: vi.fn().mockName('Router.navigate'),
    };
    const messageServiceSpy = {
      add: vi.fn().mockName('MessageService.add'),
    };
    const authServiceSpy = {
      login: vi.fn().mockName('AuthService.login'),
      register: vi.fn().mockName('AuthService.register'),
    };

    authServiceSpy.login.mockReturnValue(of(mockResponse));
    authServiceSpy.register.mockReturnValue(of(mockResponse));

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
    router = routerSpy;
    messageService = messageServiceSpy;
    authService = authServiceSpy;
  });

  afterEach(() => {
    httpMock.verify();
    localStorageMock.clear();
    TestBed.resetTestingModule();
    vi.unstubAllGlobals();
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
      expect(store.loggedIn()).toBe(true);
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
      authService.login.mockReturnValue(
        throwError(() => new Error('Failed to login')),
      );

      store.login(credentials);

      expect(store.error()).toBe('An error occurred. Please try again later.');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred. Please try again later.',
      });
    });

    it('should handle 401 Unauthorized status with appropriate message', () => {
      const httpError = {
        status: HttpStatusCode.Unauthorized,
      };
      authService.login.mockReturnValue(throwError(() => httpError));

      store.login(credentials);

      expect(store.error()).toBe('Invalid credentials');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid credentials',
      });
    });

    it('should handle 403 Forbidden status with appropriate message', () => {
      const httpError = {
        status: HttpStatusCode.Forbidden,
      };
      authService.login.mockReturnValue(throwError(() => httpError));

      store.login(credentials);

      expect(store.error()).toBe('Invalid credentials');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid credentials',
      });
    });

    it('should handle error with "Invalid credentials" message', () => {
      const error = {
        error: { message: 'Invalid credentials' },
      };
      authService.login.mockReturnValue(throwError(() => error));

      store.login(credentials);

      expect(store.error()).toBe('Invalid credentials');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid credentials',
      });
    });

    it('should handle other error messages', () => {
      const error = {
        error: { message: 'Other error' },
      };
      authService.login.mockReturnValue(throwError(() => error));

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
      expect(store.loading()).toBe(false);
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
      expect(store.loggedIn()).toBe(true);
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
      authService.register.mockReturnValue(
        throwError(() => new Error('Failed to register')),
      );

      store.register(registerData);

      expect(store.error()).toBe('An error occurred. Please try again later.');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'An error occurred. Please try again later.',
      });
    });

    it('should handle conflict status (409) with email exists message', () => {
      const httpError = {
        status: HttpStatusCode.Conflict,
      };
      authService.register.mockReturnValue(throwError(() => httpError));

      store.register(registerData);

      expect(store.error()).toBe('Email is already registered');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Email is already registered',
      });
    });

    it('should handle error with "Email already exists" message', () => {
      const error = {
        error: { message: 'Email already exists' },
      };
      authService.register.mockReturnValue(throwError(() => error));

      store.register(registerData);

      expect(store.error()).toBe('Email is already registered');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Email is already registered',
      });
    });

    it('should handle custom error messages during registration', () => {
      const error = {
        error: { message: 'Custom error message' },
      };
      authService.register.mockReturnValue(throwError(() => error));

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
      expect(store.loading()).toBe(false);
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
      expect(store.loggedIn()).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
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
      expect(store.loggedIn()).toBe(true);
    });

    it('should not load state if localStorage data is invalid', () => {
      localStorage.setItem('auth_token', 'test-token');
      localStorage.setItem('user_data', 'invalid json');

      store.loadAuthStateFromStorage();

      expect(store.user()).toBeNull();
      expect(store.token()).toBeNull();
      expect(store.loggedIn()).toBe(false);
    });

    it('should not load state if localStorage is empty', () => {
      store.loadAuthStateFromStorage();

      expect(store.user()).toBeNull();
      expect(store.token()).toBeNull();
      expect(store.loggedIn()).toBe(false);
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
