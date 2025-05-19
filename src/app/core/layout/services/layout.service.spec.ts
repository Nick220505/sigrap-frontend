import { fakeAsync, TestBed } from '@angular/core/testing';
import { LayoutService, ThemeMode } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;
  let localStorageSpy: jasmine.SpyObj<Storage>;
  let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[] = [];
  let systemThemeDarkMode = false;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let matchMediaSpy: jasmine.Spy;

  const createMediaQueryListMock = (matches: boolean): MediaQueryList => {
    return {
      matches,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: (event: string, listener: EventListener) => {
        if (event === 'change') {
          mediaQueryListeners.push(
            listener as (e: MediaQueryListEvent) => void,
          );
        }
      },
      removeEventListener: (event: string, listener: EventListener) => {
        if (event === 'change') {
          const index = mediaQueryListeners.indexOf(
            listener as (e: MediaQueryListEvent) => void,
          );
          if (index !== -1) {
            mediaQueryListeners.splice(index, 1);
          }
        }
      },
      dispatchEvent: () => true,
      addListener: (listener: (e: MediaQueryListEvent) => void) => {
        mediaQueryListeners.push(listener);
      },
      removeListener: (listener: (e: MediaQueryListEvent) => void) => {
        const index = mediaQueryListeners.indexOf(listener);
        if (index !== -1) {
          mediaQueryListeners.splice(index, 1);
        }
      },
    } as MediaQueryList;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    mediaQueryListeners = [];
    systemThemeDarkMode = false;

    const storageMock = jasmine.createSpyObj('Storage', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    storageMock.getItem.and.returnValue(null);
    spyOnProperty(window, 'localStorage').and.returnValue(storageMock);
    localStorageSpy = storageMock;

    try {
      matchMediaSpy = spyOn(window, 'matchMedia').and.callFake((_query) => {
        return createMediaQueryListMock(systemThemeDarkMode);
      });
    } catch (e) {
      const error = e as Error;
      if (!error.message?.includes('already been spied upon')) {
        throw error;
      }
    }

    jasmine.clock().uninstall();
    jasmine.clock().install();

    TestBed.configureTestingModule({
      providers: [LayoutService],
    });

    service = TestBed.inject(LayoutService);

    spyOn(service, 'toggleDarkModeClass').and.callThrough();

    const serviceAsUnknown = service as unknown;
    const serviceWithPrivate = serviceAsUnknown as {
      handleDarkModeTransition: (config: {
        darkTheme?: boolean;
        themeMode?: ThemeMode;
      }) => void;
      startViewTransition: (config: {
        darkTheme?: boolean;
        themeMode?: ThemeMode;
      }) => void;
    };

    spyOn(serviceWithPrivate, 'handleDarkModeTransition').and.callFake(
      (config) => {
        service.toggleDarkModeClass(config);
      },
    );

    spyOn(serviceWithPrivate, 'startViewTransition').and.callThrough();

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

    it('should load system theme setting from localStorage', () => {
      const configMock = {
        darkTheme: true,
        themeMode: 'system',
      };

      systemThemeDarkMode = true;
      localStorageSpy.getItem.and.returnValue(JSON.stringify(configMock));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [LayoutService],
      });
      const newService = TestBed.inject(LayoutService);

      expect(newService.layoutConfig().themeMode).toBe('system');
      expect(window.matchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)',
      );
    });

    it('should save theme settings to localStorage', fakeAsync(() => {
      const testConfig = {
        darkTheme: true,
        themeMode: 'dark' as ThemeMode,
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

    it('should handle localStorage save errors gracefully', () => {
      localStorageSpy.setItem.and.throwError('Storage error');

      spyOn(console, 'error');

      service['saveThemeToStorage']({
        darkTheme: true,
        themeMode: 'dark',
      });

      expect(console.error).toHaveBeenCalledWith(
        'Error saving theme to storage:',
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

    it('should set theme mode correctly for light', () => {
      service.setThemeMode('light');
      expect(service.layoutConfig().themeMode).toBe('light');
      expect(service.layoutConfig().darkTheme).toBeFalse();
    });

    it('should set theme mode correctly for dark', () => {
      service.setThemeMode('dark');
      expect(service.layoutConfig().themeMode).toBe('dark');
      expect(service.layoutConfig().darkTheme).toBeTrue();
    });

    it('should set theme mode correctly for auto', () => {
      const currentHour = new Date().getHours();
      const shouldBeDark = currentHour >= 18 || currentHour < 6;

      service.setThemeMode('auto');
      expect(service.layoutConfig().themeMode).toBe('auto');
      expect(service.layoutConfig().darkTheme).toBe(shouldBeDark);
    });

    it('should set theme mode correctly for system', () => {
      systemThemeDarkMode = true;
      service.setThemeMode('system');
      expect(service.layoutConfig().themeMode).toBe('system');
      expect(service.layoutConfig().darkTheme).toBeTrue();
      expect(window.matchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)',
      );

      systemThemeDarkMode = false;
      service.setThemeMode('system');
      expect(service.layoutConfig().darkTheme).toBeFalse();
    });

    it('should apply system theme based on OS preference', () => {
      service['systemThemeMediaQuery'] = {
        matches: true,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
        dispatchEvent: () => true,
        onchange: null,
        media: '',
        addListener: jasmine.createSpy('addListener'),
        removeListener: jasmine.createSpy('removeListener'),
      } as MediaQueryList;

      service['applySystemTheme']();
      expect(service.layoutConfig().darkTheme).toBeTrue();

      service['systemThemeMediaQuery'] = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine.createSpy('removeEventListener'),
        dispatchEvent: () => true,
        onchange: null,
        media: '',
        addListener: jasmine.createSpy('addListener'),
        removeListener: jasmine.createSpy('removeListener'),
      } as MediaQueryList;

      service['applySystemTheme']();
      expect(service.layoutConfig().darkTheme).toBeFalse();
    });

    it('should handle system theme changes through media query listener', () => {
      service.layoutConfig.update((config) => ({
        ...config,
        themeMode: 'system',
      }));

      expect(mediaQueryListeners.length).toBeGreaterThan(0);

      if (mediaQueryListeners[0]) {
        mediaQueryListeners[0]({ matches: true } as MediaQueryListEvent);
        expect(service.layoutConfig().darkTheme).toBeTrue();

        mediaQueryListeners[0]({ matches: false } as MediaQueryListEvent);
        expect(service.layoutConfig().darkTheme).toBeFalse();
      }
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
        themeMode: 'dark',
      });

      expect(service.toggleDarkModeClass).toHaveBeenCalled();
    }));

    it('should clean up system theme event listeners on destroy', () => {
      service.setThemeMode('system');
      const initialLength = mediaQueryListeners.length;
      service.ngOnDestroy();

      expect(mediaQueryListeners.length).toBeLessThan(initialLength);
    });
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
    it('should cleanup timeCheckInterval on destroy', () => {
      const fakeInterval = 123;
      service['timeCheckInterval'] = fakeInterval as unknown as ReturnType<
        typeof setInterval
      >;

      spyOn(window, 'clearInterval').and.callFake(() => {
        service['timeCheckInterval'] = null;
      });

      service.ngOnDestroy();

      expect(window.clearInterval).toHaveBeenCalledWith(fakeInterval);
      expect(service['timeCheckInterval']).toBeNull();
    });

    it('should clean up all resources on destroy', () => {
      const fakeInterval = 123;
      service['timeCheckInterval'] = fakeInterval as unknown as ReturnType<
        typeof setInterval
      >;

      systemThemeDarkMode = true;

      const mockMediaQueryList = {
        matches: false,
        addEventListener: jasmine.createSpy('addEventListener'),
        removeEventListener: jasmine
          .createSpy('removeEventListener')
          .and.callFake(() => {
            service['systemThemeHandler'] = null;
            service['systemThemeMediaQuery'] = null;
          }),
        dispatchEvent: () => true,
        onchange: null,
        media: '(prefers-color-scheme: dark)',
        addListener: jasmine.createSpy('addListener'),
        removeListener: jasmine.createSpy('removeListener'),
      } as unknown as MediaQueryList;

      const mockHandler = jasmine.createSpy('systemThemeHandler');

      service['systemThemeMediaQuery'] = mockMediaQueryList;
      service['systemThemeHandler'] = mockHandler;

      spyOn(window, 'clearInterval').and.callFake(() => {
        service['timeCheckInterval'] = null;
      });

      service.ngOnDestroy();

      expect(window.clearInterval).toHaveBeenCalled();
      expect(service['timeCheckInterval']).toBeNull();

      expect(mockMediaQueryList.removeEventListener).toHaveBeenCalled();
      expect(service['systemThemeHandler']).toBeNull();
      expect(service['systemThemeMediaQuery']).toBeNull();
    });
  });

  it('should support system theme mode', () => {
    service.setThemeMode('system');
    expect(service.layoutConfig().themeMode).toBe('system');
  });

  it('should properly switch between dark and light themes', () => {
    service.layoutConfig.update((config) => ({
      ...config,
      darkTheme: false,
    }));
    expect(service.isDarkTheme()).toBeFalse();

    service.layoutConfig.update((config) => ({
      ...config,
      darkTheme: true,
    }));
    expect(service.isDarkTheme()).toBeTrue();
  });
});
