import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree, } from '@angular/router';

import { AuthStore } from '../stores/auth.store';
import { publicGuard } from './public.guard';

describe('publicGuard', () => {
    const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => publicGuard(...guardParameters));

    let mockAuthStore: {
        loggedIn: Mock;
    };
    let router: { createUrlTree: Mock };
    let dummyRoute: ActivatedRouteSnapshot;
    let dummyState: RouterStateSnapshot;

    beforeEach(() => {
        mockAuthStore = {
            loggedIn: vi.fn().mockName("AuthStore.loggedIn")
        };
        router = {
            createUrlTree: vi.fn().mockName("Router.createUrlTree")
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

    it('should redirect to home when user is already logged in', () => {
        mockAuthStore.loggedIn.mockReturnValue(true);
        const mockUrlTree = {} as UrlTree;
        router.createUrlTree.mockReturnValue(mockUrlTree);

        const result = executeGuard(dummyRoute, dummyState);

        expect(result).toBe(mockUrlTree);
        expect(mockAuthStore.loggedIn).toHaveBeenCalled();
        expect(router.createUrlTree).toHaveBeenCalledWith(['/']);
    });

    it('should allow access to public routes when user is not logged in', () => {
        mockAuthStore.loggedIn.mockReturnValue(false);

        const result = executeGuard(dummyRoute, dummyState);

        expect(result).toBe(true);
        expect(mockAuthStore.loggedIn).toHaveBeenCalled();
        expect(router.createUrlTree).not.toHaveBeenCalled();
    });
});
