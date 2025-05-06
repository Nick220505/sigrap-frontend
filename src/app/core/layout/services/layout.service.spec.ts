import { fakeAsync, TestBed } from '@angular/core/testing';
import { LayoutService, ThemeMode } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const storageMock = jasmine.createSpyObj('Storage', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    storageMock.getItem.and.returnValue(null);
    spyOnProperty(window, 'localStorage').and.returnValue(storageMock);
    localStorageSpy = storageMock;

    jasmine.clock().uninstall();
    jasmine.clock().install();

    TestBed.configureTestingModule({
      providers: [LayoutService],
    });

    service = TestBed.inject(LayoutService);

    spyOn(service, 'toggleDarkModeClass').and.callFake(() => {
      return;
    });

    const serviceAsUnknown = service as unknown;
    const serviceWithPrivate = serviceAsUnknown as {
      handleDarkModeTransition: (config: {
        darkTheme?: boolean;
        themeMode?: ThemeMode;
      }) => void;
    };

    spyOn(serviceWithPrivate, 'handleDarkModeTransition').and.callFake(
      (config) => {
        service.toggleDarkModeClass(config);
      },
    );

    localStorageSpy.setItem.calls.reset();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialization and default values', () => {
    it('should have default config values', () => {
      expect(service.layoutConfig()).toBeDefined();
      expect(service.layoutConfig().primary).toBe('blue');
      expect(service.layoutConfig().menuMode).toBe('static');
      expect(service.layoutConfig().themeMode).toBe('auto');
    });

    it('should load theme from localStorage on initialization', () => {
      expect(localStorageSpy.getItem).toHaveBeenCalledWith('layout-config');
    });

    it('should initialize layout state with default values', () => {
      expect(service.layoutState().staticMenuDesktopInactive).toBeFalse();
      expect(service.layoutState().overlayMenuActive).toBeFalse();
      expect(service.layoutState().staticMenuMobileActive).toBeFalse();
      expect(service.layoutState().menuHoverActive).toBeFalse();
    });

    it('should initialize computed signals', () => {
      expect(service.theme).toBeDefined();
      expect(service.isSidebarActive).toBeDefined();
      expect(service.isDarkTheme).toBeDefined();
      expect(service.getPrimary).toBeDefined();
      expect(service.getSurface).toBeDefined();
      expect(service.isOverlay).toBeDefined();
    });
  });

  describe('storage handling', () => {
    it('should load theme settings from localStorage', () => {
      const configMock = {
        darkTheme: true,
        themeMode: 'dark',
      };

      localStorageSpy.getItem.and.returnValue(JSON.stringify(configMock));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [LayoutService],
      });
      const newService = TestBed.inject(LayoutService);

      expect(newService.layoutConfig().darkTheme).toBeTrue();
      expect(newService.layoutConfig().themeMode).toBe('dark');
    });

    it('should save theme settings to localStorage', fakeAsync(() => {
      const testConfig = {
        darkTheme: true,
        themeMode: 'dark' as 'auto' | 'dark' | 'light',
        primary: 'blue',
      };

      localStorageSpy.setItem.calls.reset();

      service['saveThemeToStorage'](testConfig);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'layout-config',
        jasmine.any(String),
      );

      const savedJson = localStorageSpy.setItem.calls.mostRecent().args[1];
      const savedData = JSON.parse(savedJson);

      expect(savedData.darkTheme).toBeTrue();
      expect(savedData.themeMode).toBe('dark');
    }));

    it('should handle localStorage errors gracefully', () => {
      localStorageSpy.getItem.and.throwError('Storage error');

      spyOn(console, 'error');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [LayoutService],
      });
      const newService = TestBed.inject(LayoutService);
      expect(newService).toBeTruthy();

      expect(console.error).toHaveBeenCalledWith(
        'Error loading theme from storage:',
        jasmine.any(Error),
      );
    });
  });

  describe('theme mode handling', () => {
    it('should update layout configuration when toggling dark mode', fakeAsync(() => {
      const initialConfig = { ...service.layoutConfig() };

      (service.toggleDarkModeClass as jasmine.Spy).calls.reset();

      service.toggleDarkMode();

      expect(service.layoutConfig().darkTheme).toBe(!initialConfig.darkTheme);
      expect(service.layoutConfig().themeMode).toBe(
        initialConfig.darkTheme ? 'light' : 'dark',
      );

      (service.toggleDarkModeClass as jasmine.Spy).calls.reset();
      service['handleDarkModeTransition'](service.layoutConfig());
      expect(service.toggleDarkModeClass).toHaveBeenCalled();
    }));

    it('should set theme mode correctly', () => {
      service.setThemeMode('light');
      expect(service.layoutConfig().themeMode).toBe('light');
      expect(service.layoutConfig().darkTheme).toBeFalse();

      service.setThemeMode('dark');
      expect(service.layoutConfig().themeMode).toBe('dark');
      expect(service.layoutConfig().darkTheme).toBeTrue();

      const currentHour = new Date().getHours();
      const shouldBeDark = currentHour >= 18 || currentHour < 6;

      service.setThemeMode('auto');
      expect(service.layoutConfig().themeMode).toBe('auto');
      expect(service.layoutConfig().darkTheme).toBe(shouldBeDark);
    });

    it('should apply time-based theme in auto mode', fakeAsync(() => {
      const morningDate = new Date();
      morningDate.setHours(10, 0, 0, 0);
      jasmine.clock().mockDate(morningDate);

      service.layoutConfig.update((config) => ({
        ...config,
        themeMode: 'auto',
      }));

      service['applyTimeBasedTheme']();
      expect(service.layoutConfig().darkTheme).toBeFalse();

      const eveningDate = new Date();
      eveningDate.setHours(20, 0, 0, 0);
      jasmine.clock().mockDate(eveningDate);

      service['applyTimeBasedTheme']();
      expect(service.layoutConfig().darkTheme).toBeTrue();
    }));

    it('should call toggleDarkModeClass when darkTheme changes', fakeAsync(() => {
      (service.toggleDarkModeClass as jasmine.Spy).calls.reset();

      service['handleDarkModeTransition']({
        darkTheme: true,
        themeMode: 'dark' as 'auto' | 'dark' | 'light',
      });

      expect(service.toggleDarkModeClass).toHaveBeenCalled();
    }));
  });

  describe('computed signals', () => {
    it('should compute theme value correctly', () => {
      service.layoutConfig.update((config) => ({ ...config, darkTheme: true }));
      expect(service.theme()).toBe('light');

      service.layoutConfig.update((config) => ({
        ...config,
        darkTheme: false,
      }));
      expect(service.theme()).toBe('dark');
    });

    it('should compute isSidebarActive correctly', () => {
      service.layoutState.update((state) => ({
        ...state,
        overlayMenuActive: false,
        staticMenuMobileActive: false,
      }));
      expect(service.isSidebarActive()).toBeFalse();

      service.layoutState.update((state) => ({
        ...state,
        overlayMenuActive: true,
        staticMenuMobileActive: false,
      }));
      expect(service.isSidebarActive()).toBeTrue();

      service.layoutState.update((state) => ({
        ...state,
        overlayMenuActive: false,
        staticMenuMobileActive: true,
      }));
      expect(service.isSidebarActive()).toBeTrue();
    });

    it('should compute isDarkTheme correctly', () => {
      service.layoutConfig.update((config) => ({ ...config, darkTheme: true }));
      expect(service.isDarkTheme()).toBeTrue();

      service.layoutConfig.update((config) => ({
        ...config,
        darkTheme: false,
      }));
      expect(service.isDarkTheme()).toBeFalse();
    });

    it('should compute getPrimary correctly', () => {
      service.layoutConfig.update((config) => ({
        ...config,
        primary: 'green',
      }));
      expect(service.getPrimary()).toBe('green');
    });

    it('should compute getSurface correctly', () => {
      service.layoutConfig.update((config) => ({
        ...config,
        surface: 'slate',
      }));
      expect(service.getSurface()).toBe('slate');
    });

    it('should compute isOverlay correctly', () => {
      service.layoutConfig.update((config) => ({
        ...config,
        menuMode: 'static',
      }));
      expect(service.isOverlay()).toBeFalse();

      service.layoutConfig.update((config) => ({
        ...config,
        menuMode: 'overlay',
      }));
      expect(service.isOverlay()).toBeTrue();
    });
  });

  describe('device detection', () => {
    it('should detect desktop correctly based on window width', () => {
      const originalInnerWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', {
        value: 1200,
        configurable: true,
      });

      expect(service.isDesktop()).toBeTrue();
      expect(service.isMobile()).toBeFalse();

      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        configurable: true,
      });
    });

    it('should detect mobile correctly based on window width', () => {
      const originalInnerWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', {
        value: 768,
        configurable: true,
      });

      expect(service.isDesktop()).toBeFalse();
      expect(service.isMobile()).toBeTrue();

      Object.defineProperty(window, 'innerWidth', {
        value: originalInnerWidth,
        configurable: true,
      });
    });
  });

  describe('menu handling', () => {
    it('should handle menu toggle for desktop', () => {
      service.layoutState.update((state) => ({
        ...state,
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        staticMenuMobileActive: false,
      }));

      spyOn(service, 'isDesktop').and.returnValue(true);

      service.onMenuToggle();
      expect(service.layoutState().staticMenuDesktopInactive).toBeTrue();

      service.onMenuToggle();
      expect(service.layoutState().staticMenuDesktopInactive).toBeFalse();
    });

    it('should handle menu toggle for mobile', () => {
      service.layoutState.update((state) => ({
        ...state,
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        staticMenuMobileActive: false,
      }));

      spyOn(service, 'isDesktop').and.returnValue(false);

      service.onMenuToggle();
      expect(service.layoutState().staticMenuMobileActive).toBeTrue();

      service.onMenuToggle();
      expect(service.layoutState().staticMenuMobileActive).toBeFalse();
    });

    it('should emit menu state change event', () => {
      spyOn(service['menuSource'], 'next');
      const menuEvent = { key: 'test-key' };

      service.onMenuStateChange(menuEvent);

      expect(service['menuSource'].next).toHaveBeenCalledWith(menuEvent);
    });
  });

  describe('configuration and event handling', () => {
    it('should update config and emit update event', () => {
      spyOn(service['configUpdate'], 'next');

      service.onConfigUpdate();

      expect(service['configUpdate'].next).toHaveBeenCalledWith(
        service.layoutConfig(),
      );
    });

    it('should emit overlay open event', () => {
      let overlayOpened = false;
      service.overlayOpen$.subscribe(() => {
        overlayOpened = true;
      });

      spyOn(service, 'isDesktop').and.returnValue(false);

      service.layoutState.update((state) => ({
        ...state,
        staticMenuMobileActive: false,
      }));

      service.onMenuToggle();

      expect(service.layoutState().staticMenuMobileActive).toBeTrue();

      expect(overlayOpened).toBeTrue();
    });

    it('should reset and emit reset event', () => {
      spyOn(service['resetSource'], 'next');

      service.reset();

      expect(service['resetSource'].next).toHaveBeenCalledWith(true);
    });
  });

  describe('transition handling', () => {
    it('should set transition complete flag correctly', () => {
      expect(service.transitionComplete()).toBeFalse();

      service['onTransitionEnd']();
      expect(service.transitionComplete()).toBeTrue();

      jasmine.clock().tick(150);
      expect(service.transitionComplete()).toBeFalse();
    });
  });

  describe('cleanup', () => {
    it('should cleanup on destroy', () => {
      service['timeCheckInterval'] = setInterval(() => {
        void 0;
      }, 1000);

      spyOn(window, 'clearInterval');

      service.ngOnDestroy();

      expect(window.clearInterval).toHaveBeenCalledWith(
        service['timeCheckInterval'],
      );
    });
  });
});
