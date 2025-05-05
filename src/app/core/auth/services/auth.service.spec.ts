import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';

import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/auth`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
      // Arrange
      const credentials: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test User',
      };

      // Act
      service.login(credentials).subscribe((response) => {
        // Assert
        expect(response).toEqual(mockResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${baseUrl}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse);
    });
  });

  describe('register', () => {
    it('should send a POST request to the register endpoint with user data', () => {
      // Arrange
      const userData: RegisterRequest = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        token: 'test-token',
        email: 'test@example.com',
        name: 'Test User',
      };

      // Act
      service.register(userData).subscribe((response) => {
        // Assert
        expect(response).toEqual(mockResponse);
      });

      // Assert
      const req = httpMock.expectOne(`${baseUrl}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(userData);
      req.flush(mockResponse);
    });
  });
});
