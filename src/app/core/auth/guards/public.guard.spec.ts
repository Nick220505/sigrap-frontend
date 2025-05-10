import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';

import { AuthStore } from '../stores/auth.store';
import { publicGuard } from './public.guard';

describe('publicGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => publicGuard(...guardParameters));

  let mockAuthStore: jasmine.SpyObj<{ loggedIn: () => boolean }>;
  let router: jasmine.SpyObj<Router>;
  let dummyRoute: ActivatedRouteSnapshot;
  let dummyState: RouterStateSnapshot;

  beforeEach(() => {
    mockAuthStore = jasmine.createSpyObj('AuthStore', ['loggedIn']);
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

  it('should redirect to home when user is already logged in', () => {
    mockAuthStore.loggedIn.and.returnValue(true);
    const mockUrlTree = {} as UrlTree;
    router.createUrlTree.and.returnValue(mockUrlTree);

    const result = executeGuard(dummyRoute, dummyState);

    expect(result).toBe(mockUrlTree);
    expect(mockAuthStore.loggedIn).toHaveBeenCalled();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('should allow access to public routes when user is not logged in', () => {
    mockAuthStore.loggedIn.and.returnValue(false);

    const result = executeGuard(dummyRoute, dummyState);

    expect(result).toBe(true);
    expect(mockAuthStore.loggedIn).toHaveBeenCalled();
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
});
