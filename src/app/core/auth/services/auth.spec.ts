import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiBaseUrlInterceptor } from '@core/api/api-base-url.interceptor';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import { environment } from '@env';

import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { AuthService } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: API_BASE_URL,
          useValue: environment.apiUrl,
        },
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should send a POST request to the login endpoint with credentials', () => {
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test User',
        lastLogin: new Date().toISOString(),
        role: 'ADMINISTRATOR',
      };

      service.login(credentials).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send a POST request to the register endpoint with user data', () => {
      const userData: RegisterRequest = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test User',
        lastLogin: new Date().toISOString(),
        role: 'ADMINISTRATOR',
      };

      service.register(userData).subscribe((response) => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockResponse);
    });
  });
});
