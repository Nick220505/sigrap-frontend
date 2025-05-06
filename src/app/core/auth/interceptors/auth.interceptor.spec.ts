import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AuthStore } from '../stores/auth.store';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let interceptor: HttpInterceptorFn;
  let mockAuthStore: jasmine.SpyObj<{ getToken: () => string | null }>;
  let mockRequest: HttpRequest<unknown>;
  let mockHandler: jasmine.Spy<HttpHandlerFn>;

  beforeEach(() => {
    mockAuthStore = jasmine.createSpyObj('AuthStore', ['getToken']);
    mockRequest = new HttpRequest('GET', '/api/test');
    mockHandler = jasmine
      .createSpy()
      .and.returnValue(of({} as HttpEvent<unknown>));

    TestBed.configureTestingModule({
      providers: [{ provide: AuthStore, useValue: mockAuthStore }],
    });

    interceptor = (req, next) =>
      TestBed.runInInjectionContext(() => authInterceptor(req, next));
  });

  it('should add Authorization header when token is available', () => {
    const testToken = 'test-token';
    mockAuthStore.getToken.and.returnValue(testToken);

    interceptor(mockRequest, mockHandler);

    expect(mockHandler).toHaveBeenCalledTimes(1);
    const modifiedRequest = mockHandler.calls.mostRecent().args[0];
    expect(modifiedRequest.headers.has('Authorization')).toBeTrue();
    expect(modifiedRequest.headers.get('Authorization')).toBe(
      `Bearer ${testToken}`,
    );
    expect(mockAuthStore.getToken).toHaveBeenCalled();
  });

  it('should not modify the request when token is not available', () => {
    mockAuthStore.getToken.and.returnValue(null);

    interceptor(mockRequest, mockHandler);

    expect(mockHandler).toHaveBeenCalledTimes(1);
    const modifiedRequest = mockHandler.calls.mostRecent().args[0];
    expect(modifiedRequest.headers.has('Authorization')).toBeFalse();
    expect(mockAuthStore.getToken).toHaveBeenCalled();
    expect(modifiedRequest).toBe(mockRequest);
  });
});
