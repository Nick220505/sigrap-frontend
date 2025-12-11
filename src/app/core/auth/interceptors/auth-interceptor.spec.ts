import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthStore } from '../stores/auth-store';
import { authInterceptor } from './auth-interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authStore: {
    getToken: Mock;
    logout: Mock;
  };
  let router: { navigate: Mock };
  let messageService: { add: Mock };

  beforeEach(() => {
    authStore = {
      getToken: vi.fn().mockName('AuthStore.getToken'),
      logout: vi.fn().mockName('AuthStore.logout'),
    };
    router = {
      navigate: vi.fn().mockName('Router.navigate'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: authStore },
        { provide: Router, useValue: router },
        { provide: MessageService, useValue: messageService },
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add an Authorization header with token', () => {
    authStore.getToken.mockReturnValue('test-token');

    httpClient.get('/api/test').subscribe();

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBe(true);
    expect(httpRequest.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );
  });

  it('should not add an Authorization header if no token is available', () => {
    authStore.getToken.mockReturnValue(null);

    httpClient.get('/api/test').subscribe();

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBe(false);
  });

  it('should handle successful responses correctly with token', () => {
    authStore.getToken.mockReturnValue('test-token');
    const mockResponse = { data: 'test data' };

    httpClient.get('/api/test').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBe(true);
    httpRequest.flush(mockResponse);
    expect(authStore.logout).not.toHaveBeenCalled();
  });

  it('should handle successful responses correctly without token', () => {
    authStore.getToken.mockReturnValue(null);
    const mockResponse = { data: 'test data' };

    httpClient.get('/api/test').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBe(false);
    httpRequest.flush(mockResponse);
    expect(authStore.logout).not.toHaveBeenCalled();
  });

  it('should handle unauthorized response and logout', () => {
    authStore.getToken.mockReturnValue('test-token');

    let completed = false;
    let receivedError = false;

    httpClient.get('/api/test').subscribe({
      next: () => {
        receivedError = true;
      },
      error: () => {
        receivedError = true;
      },
      complete: () => {
        completed = true;
      },
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(completed).toBe(true);
    expect(receivedError).toBe(false);
    expect(authStore.logout).toHaveBeenCalled();
  });

  it('should pass through other error responses', () => {
    authStore.getToken.mockReturnValue('test-token');

    let capturedError: HttpErrorResponse | null = null;

    httpClient.get('/api/test').subscribe({
      next: () => {
        // no-op
      },
      error: (error: HttpErrorResponse) => {
        capturedError = error;
      },
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Server Error', {
      status: 500,
      statusText: 'Server Error',
    });

    expect(capturedError).not.toBeNull();
    expect(capturedError!.status).toBe(500);
    expect(authStore.logout).not.toHaveBeenCalled();
  });

  it('should pass through network errors', () => {
    authStore.getToken.mockReturnValue('test-token');

    let capturedError: HttpErrorResponse | null = null;

    httpClient.get('/api/test').subscribe({
      next: () => {
        // no-op
      },
      error: (error: HttpErrorResponse) => {
        capturedError = error;
      },
    });

    const httpRequest = httpMock.expectOne('/api/test');
    const mockError = new ProgressEvent('error');
    httpRequest.error(mockError);

    expect(capturedError).not.toBeNull();
    expect(capturedError!.status).toBe(0);
    expect(authStore.logout).not.toHaveBeenCalled();
  });

  it('should work with different HTTP methods (POST)', () => {
    authStore.getToken.mockReturnValue('test-token');
    const postData = { name: 'Test' };
    const mockResponse = { id: 1, name: 'Test' };

    httpClient.post('/api/test', postData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.headers.has('Authorization')).toBe(true);
    expect(httpRequest.request.body).toEqual(postData);
    httpRequest.flush(mockResponse);
  });

  it('should work with empty response bodies', () => {
    authStore.getToken.mockReturnValue('test-token');

    httpClient.delete('/api/test/1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const httpRequest = httpMock.expectOne('/api/test/1');
    expect(httpRequest.request.method).toBe('DELETE');
    expect(httpRequest.request.headers.has('Authorization')).toBe(true);
    httpRequest.flush(null, { status: 204, statusText: 'No Content' });
  });
});
