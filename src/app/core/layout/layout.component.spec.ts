import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { LayoutService } from './services/layout.service';

// Create a simple test component that we can test
@Component({
  template: '',
})
class TestLayoutComponent {
  containerClass: Record<string, boolean> = {};

  constructor(public layoutService: LayoutService) {
    this.containerClass = {
      'layout-overlay':
        this.layoutService.layoutConfig().menuMode === 'overlay',
      'layout-static': this.layoutService.layoutConfig().menuMode === 'static',
      'layout-static-inactive':
        !!this.layoutService.layoutState().staticMenuDesktopInactive &&
        this.layoutService.layoutConfig().menuMode === 'static',
      'layout-overlay-active':
        !!this.layoutService.layoutState().overlayMenuActive,
      'layout-mobile-active':
        !!this.layoutService.layoutState().staticMenuMobileActive,
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

  onMenuToggle = jasmine.createSpy('onMenuToggle');
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

    // Mock document.body.classList
    spyOn(document.body.classList, 'add').and.stub();
    spyOn(document.body.classList, 'remove').and.stub();
  });

  describe('containerClass', () => {
    it('should return layout-static class when menuMode is static', () => {
      expect(component.containerClass['layout-static']).toBeTrue();
    });

    it('should return layout-overlay class when menuMode is overlay', () => {
      layoutService.layoutConfig.update((config) => ({
        ...config,
        menuMode: 'overlay',
      }));

      // Need to recreate the component since containerClass is set in constructor
      const fixture = TestBed.createComponent(TestLayoutComponent);
      component = fixture.componentInstance;

      expect(component.containerClass['layout-overlay']).toBeTrue();
      expect(component.containerClass['layout-static']).toBeFalse();
    });

    it('should return layout-static-inactive when staticMenuDesktopInactive is true', () => {
      layoutService.layoutState.update((state) => ({
        ...state,
        staticMenuDesktopInactive: true,
      }));

      // Need to recreate the component since containerClass is set in constructor
      const fixture = TestBed.createComponent(TestLayoutComponent);
      component = fixture.componentInstance;

      expect(component.containerClass['layout-static-inactive']).toBeTrue();
    });

    it('should return layout-overlay-active when overlayMenuActive is true', () => {
      layoutService.layoutState.update((state) => ({
        ...state,
        overlayMenuActive: true,
      }));

      // Need to recreate the component since containerClass is set in constructor
      const fixture = TestBed.createComponent(TestLayoutComponent);
      component = fixture.componentInstance;

      expect(component.containerClass['layout-overlay-active']).toBeTrue();
    });

    it('should return layout-mobile-active when staticMenuMobileActive is true', () => {
      layoutService.layoutState.update((state) => ({
        ...state,
        staticMenuMobileActive: true,
      }));

      // Need to recreate the component since containerClass is set in constructor
      const fixture = TestBed.createComponent(TestLayoutComponent);
      component = fixture.componentInstance;

      expect(component.containerClass['layout-mobile-active']).toBeTrue();
    });
  });

  describe('hideMenu', () => {
    it('should update layoutState to hide menus', () => {
      // Set initial state with menus active
      layoutService.layoutState.update((state) => ({
        ...state,
        overlayMenuActive: true,
        staticMenuMobileActive: true,
        menuHoverActive: true,
      }));

      const updateSpy = spyOn(
        layoutService.layoutState,
        'update',
      ).and.callThrough();

      component.hideMenu();

      expect(updateSpy).toHaveBeenCalled();
      expect(layoutService.layoutState().overlayMenuActive).toBeFalse();
      expect(layoutService.layoutState().staticMenuMobileActive).toBeFalse();
      expect(layoutService.layoutState().menuHoverActive).toBeFalse();
    });
  });

  describe('Body scroll handling', () => {
    it('should add blocked-scroll class when blocking body scroll', () => {
      component.blockBodyScroll();
      expect(document.body.classList.add).toHaveBeenCalledWith(
        'blocked-scroll',
      );
    });

    it('should remove blocked-scroll class when unblocking body scroll', () => {
      component.unblockBodyScroll();
      expect(document.body.classList.remove).toHaveBeenCalledWith(
        'blocked-scroll',
      );
    });
  });
});
