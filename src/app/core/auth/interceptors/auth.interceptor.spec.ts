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
import { AuthStore } from '../stores/auth.store';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authStore: jasmine.SpyObj<{
    getToken: () => string | null;
    logout: () => void;
  }>;
  let router: jasmine.SpyObj<Router>;
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    authStore = jasmine.createSpyObj('AuthStore', [
      'getToken',
      'logout',
    ]);
    router = jasmine.createSpyObj('Router', ['navigate']);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

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
    authStore.getToken.and.returnValue('test-token');

    httpClient.get('/api/test').subscribe();

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeTrue();
    expect(httpRequest.request.headers.get('Authorization')).toBe(
      'Bearer test-token',
    );
  });

  it('should not add an Authorization header if no token is available', () => {
    authStore.getToken.and.returnValue(null);

    httpClient.get('/api/test').subscribe();

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeFalse();
  });

  it('should handle successful responses correctly with token', () => {
    authStore.getToken.and.returnValue('test-token');
    const mockResponse = { data: 'test data' };

    httpClient.get('/api/test').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeTrue();
    httpRequest.flush(mockResponse);
    expect(authStore.logout).not.toHaveBeenCalled();
  });

  it('should handle successful responses correctly without token', () => {
    authStore.getToken.and.returnValue(null);
    const mockResponse = { data: 'test data' };

    httpClient.get('/api/test').subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.headers.has('Authorization')).toBeFalse();
    httpRequest.flush(mockResponse);
    expect(authStore.logout).not.toHaveBeenCalled();
  });

  it('should handle unauthorized response and logout', (done) => {
    authStore.getToken.and.returnValue('test-token');

    httpClient.get('/api/test').subscribe({
      next: () => done.fail('should not emit next'),
      error: () => done.fail('should not emit error'),
      complete: () => {
        expect(authStore.logout).toHaveBeenCalled();
        done();
      },
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });
  });

  it('should pass through other error responses', (done) => {
    authStore.getToken.and.returnValue('test-token');

    httpClient.get('/api/test').subscribe({
      next: () => done.fail('should not emit next'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(authStore.logout).not.toHaveBeenCalled();
        done();
      },
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Server Error', {
      status: 500,
      statusText: 'Server Error',
    });
  });

  it('should pass through network errors', (done) => {
    authStore.getToken.and.returnValue('test-token');

    httpClient.get('/api/test').subscribe({
      next: () => done.fail('should not emit next'),
      error: (error: HttpErrorResponse) => {
        expect(error instanceof HttpErrorResponse).toBeTrue();
        expect(error.status).toBe(0);
        expect(authStore.logout).not.toHaveBeenCalled();
        done();
      },
    });

    const httpRequest = httpMock.expectOne('/api/test');
    const mockError = new ProgressEvent('error');
    httpRequest.error(mockError);
  });

  it('should work with different HTTP methods (POST)', () => {
    authStore.getToken.and.returnValue('test-token');
    const postData = { name: 'Test' };
    const mockResponse = { id: 1, name: 'Test' };

    httpClient.post('/api/test', postData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const httpRequest = httpMock.expectOne('/api/test');
    expect(httpRequest.request.method).toBe('POST');
    expect(httpRequest.request.headers.has('Authorization')).toBeTrue();
    expect(httpRequest.request.body).toEqual(postData);
    httpRequest.flush(mockResponse);
  });

  it('should work with empty response bodies', () => {
    authStore.getToken.and.returnValue('test-token');

    httpClient.delete('/api/test/1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const httpRequest = httpMock.expectOne('/api/test/1');
    expect(httpRequest.request.method).toBe('DELETE');
    expect(httpRequest.request.headers.has('Authorization')).toBeTrue();
    httpRequest.flush(null, { status: 204, statusText: 'No Content' });
  });
});
