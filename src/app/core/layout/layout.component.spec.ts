import { beforeEach, describe, expect, it, vi } from "vitest";
import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { LayoutService } from './services/layout.service';

@Component({
    template: '',
})
class TestLayoutComponent {
    readonly layoutService = inject(LayoutService);

    containerClass: Record<string, boolean> = this.buildContainerClass();

    private buildContainerClass(): Record<string, boolean> {
        const config = this.layoutService.layoutConfig();
        const state = this.layoutService.layoutState();

        return {
            'layout-overlay': config.menuMode === 'overlay',
            'layout-static': config.menuMode === 'static',
            'layout-static-inactive': !!state.staticMenuDesktopInactive && config.menuMode === 'static',
            'layout-overlay-active': !!state.overlayMenuActive,
            'layout-mobile-active': !!state.staticMenuMobileActive,
        };
    }

    hideMenu() {
        this.layoutService.layoutState.update((prev) => ({
            ...prev,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            menuHoverActive: false,
        }));
    }

    blockBodyScroll(): void {
        document.body.classList.add('blocked-scroll');
    }

    unblockBodyScroll(): void {
        document.body.classList.remove('blocked-scroll');
    }
}

class MockLayoutService {
    layoutConfig = signal({
        menuMode: 'static',
        themeMode: 'light',
        primary: 'blue',
        surface: 'slate',
        preset: 'Aura',
        darkTheme: false,
    });

    layoutState = signal({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        staticMenuMobileActive: false,
        menuHoverActive: false,
    });

    onMenuToggle = vi.fn();
    overlayOpen$ = new Subject<void>();
}

describe('Layout Component Tests', () => {
    let layoutService: MockLayoutService;
    let component: TestLayoutComponent;

    beforeEach(() => {
        layoutService = new MockLayoutService();

        TestBed.configureTestingModule({
            imports: [TestLayoutComponent],
            providers: [{ provide: LayoutService, useValue: layoutService }],
        });

        const fixture = TestBed.createComponent(TestLayoutComponent);
        component = fixture.componentInstance;

        vi.spyOn(document.body.classList, 'add').mockImplementation(() => undefined);
        vi.spyOn(document.body.classList, 'remove').mockImplementation(() => undefined);
    });

    describe('containerClass', () => {
        it('should return layout-static class when menuMode is static', () => {
            expect(component.containerClass['layout-static']).toBe(true);
        });

        it('should return layout-overlay class when menuMode is overlay', () => {
            layoutService.layoutConfig.update((config) => ({
                ...config,
                menuMode: 'overlay',
            }));

            const fixture = TestBed.createComponent(TestLayoutComponent);
            component = fixture.componentInstance;

            expect(component.containerClass['layout-overlay']).toBe(true);
            expect(component.containerClass['layout-static']).toBe(false);
        });

        it('should return layout-static-inactive when staticMenuDesktopInactive is true', () => {
            layoutService.layoutState.update((state) => ({
                ...state,
                staticMenuDesktopInactive: true,
            }));

            const fixture = TestBed.createComponent(TestLayoutComponent);
            component = fixture.componentInstance;

            expect(component.containerClass['layout-static-inactive']).toBe(true);
        });

        it('should return layout-overlay-active when overlayMenuActive is true', () => {
            layoutService.layoutState.update((state) => ({
                ...state,
                overlayMenuActive: true,
            }));

            const fixture = TestBed.createComponent(TestLayoutComponent);
            component = fixture.componentInstance;

            expect(component.containerClass['layout-overlay-active']).toBe(true);
        });

        it('should return layout-mobile-active when staticMenuMobileActive is true', () => {
            layoutService.layoutState.update((state) => ({
                ...state,
                staticMenuMobileActive: true,
            }));

            const fixture = TestBed.createComponent(TestLayoutComponent);
            component = fixture.componentInstance;

            expect(component.containerClass['layout-mobile-active']).toBe(true);
        });
    });

    describe('hideMenu', () => {
        it('should update layoutState to hide menus', () => {
            layoutService.layoutState.update((state) => ({
                ...state,
                overlayMenuActive: true,
                staticMenuMobileActive: true,
                menuHoverActive: true,
            }));

            const updateSpy = vi.spyOn(layoutService.layoutState, 'update');

            component.hideMenu();

            expect(updateSpy).toHaveBeenCalled();
            expect(layoutService.layoutState().overlayMenuActive).toBe(false);
            expect(layoutService.layoutState().staticMenuMobileActive).toBe(false);
            expect(layoutService.layoutState().menuHoverActive).toBe(false);
        });
    });

    describe('Body scroll handling', () => {
        it('should add blocked-scroll class when blocking body scroll', () => {
            component.blockBodyScroll();
            expect(document.body.classList.add).toHaveBeenCalledWith('blocked-scroll');
        });

        it('should remove blocked-scroll class when unblocking body scroll', () => {
            component.unblockBodyScroll();
            expect(document.body.classList.remove).toHaveBeenCalledWith('blocked-scroll');
        });
    });
});
