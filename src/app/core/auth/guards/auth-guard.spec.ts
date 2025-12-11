import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AuthStore } from '../stores/auth-store';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let mockAuthStore: {
    loggedIn: Mock;
  };
  let router: { createUrlTree: Mock };
  let dummyRoute: ActivatedRouteSnapshot;
  let dummyState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthStore = {
      loggedIn: vi.fn().mockName('AuthStore.loggedIn'),
    };
    router = {
      createUrlTree: vi.fn().mockName('Router.createUrlTree'),
    };
    dummyRoute = {} as ActivatedRouteSnapshot;
    dummyState = { url: '/test' } as RouterStateSnapshot;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: mockAuthStore },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should allow access when user is logged in', () => {
    mockAuthStore.loggedIn.mockReturnValue(true);

    const result = executeGuard(dummyRoute, dummyState);

    expect(result).toBe(true);
    expect(mockAuthStore.loggedIn).toHaveBeenCalled();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    mockAuthStore.loggedIn.mockReturnValue(false);
    const mockUrlTree = {} as UrlTree;
    router.createUrlTree.mockReturnValue(mockUrlTree);

    const result = executeGuard(dummyRoute, dummyState);

    expect(result).toBe(mockUrlTree);
    expect(mockAuthStore.loggedIn).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
