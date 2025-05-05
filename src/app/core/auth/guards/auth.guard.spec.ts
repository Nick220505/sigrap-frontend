import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AuthStore } from '../stores/auth.store';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let mockAuthStore: jasmine.SpyObj<{ isLoggedIn: () => boolean }>;
  let router: jasmine.SpyObj<Router>;
  let dummyRoute: ActivatedRouteSnapshot;
  let dummyState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthStore = jasmine.createSpyObj('AuthStore', ['isLoggedIn']);
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
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
    mockAuthStore.isLoggedIn.and.returnValue(true);

    const result = executeGuard(dummyRoute, dummyState);

    expect(result).toBe(true);
    expect(mockAuthStore.isLoggedIn).toHaveBeenCalled();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    mockAuthStore.isLoggedIn.and.returnValue(false);
    const mockUrlTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(mockUrlTree);

    const result = executeGuard(dummyRoute, dummyState);

    expect(result).toBe(mockUrlTree);
    expect(mockAuthStore.isLoggedIn).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/iniciar-sesion']);
  });
});
