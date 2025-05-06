import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
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

  beforeEach(() => {
    authStore = jasmine.createSpyObj('AuthStore', ['getToken', 'logout']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: authStore },
        { provide: Router, useValue: router },
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

  it('should redirect to login and logout on 401 Unauthorized response', () => {
    authStore.getToken.and.returnValue('test-token');

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 401 error'),
      error: (error) => {
        expect(error.status).toBe(401);
        expect(authStore.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/iniciar-sesion']);
      },
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Unauthorized', {
      status: 401,
      statusText: 'Unauthorized',
    });
  });

  it('should pass through 403 Forbidden response without logout', () => {
    authStore.getToken.and.returnValue('test-token');

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 403 error'),
      error: (error) => {
        expect(error.status).toBe(403);
        expect(authStore.logout).not.toHaveBeenCalled();
      },
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Forbidden', {
      status: 403,
      statusText: 'Forbidden',
    });
  });

  it('should pass through other error responses without logout', () => {
    authStore.getToken.and.returnValue('test-token');

    httpClient.get('/api/test').subscribe({
      next: () => fail('should have failed with 500 error'),
      error: (error) => {
        expect(error.status).toBe(500);
        expect(authStore.logout).not.toHaveBeenCalled();
      },
    });

    const httpRequest = httpMock.expectOne('/api/test');
    httpRequest.flush('Server Error', {
      status: 500,
      statusText: 'Server Error',
    });
  });
});
