import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { TestBed } from '@angular/core/testing';
import { LayoutService, ThemeMode } from './layout';

describe('LayoutService', () => {
  let service: LayoutService;
  let localStorageSpy: {
    getItem: Mock;
    setItem: Mock;
    removeItem: Mock;
  };
  let mediaQueryListeners: ((e: MediaQueryListEvent) => void)[] = [];
  let systemThemeDarkMode = false;

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

    const storageMock = {
      getItem: vi.fn().mockName('Storage.getItem'),
      setItem: vi.fn().mockName('Storage.setItem'),
      removeItem: vi.fn().mockName('Storage.removeItem'),
    } as const;

    Object.defineProperty(window, 'localStorage', {
      value: storageMock,
      configurable: true,
    });

    localStorageSpy = {
      getItem: storageMock.getItem as Mock,
      setItem: storageMock.setItem as Mock,
      removeItem: storageMock.removeItem as Mock,
    };
    localStorageSpy.getItem.mockReturnValue(null);

    // jsdom may not define window.matchMedia by default, so provide
    // a vi.fn-based mock that our tests and service can rely on.
    window.matchMedia = vi.fn(() =>
      createMediaQueryListMock(systemThemeDarkMode),
    ) as unknown as typeof window.matchMedia;

    vi.useRealTimers();
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [LayoutService],
    });

    service = TestBed.inject(LayoutService);

    vi.spyOn(service, 'toggleDarkModeClass');

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

    vi.spyOn(serviceWithPrivate, 'handleDarkModeTransition').mockImplementation(
      (config) => {
        service.toggleDarkModeClass(config);
      },
    );

    vi.spyOn(serviceWithPrivate, 'startViewTransition');

    localStorageSpy.setItem.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
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
      expect(service.layoutState().staticMenuDesktopInactive).toBe(false);
      expect(service.layoutState().overlayMenuActive).toBe(false);
      expect(service.layoutState().staticMenuMobileActive).toBe(false);
      expect(service.layoutState().menuHoverActive).toBe(false);
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

      localStorageSpy.getItem.mockReturnValue(JSON.stringify(configMock));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [LayoutService],
      });
      const newService = TestBed.inject(LayoutService);

      expect(newService.layoutConfig().darkTheme).toBe(true);
      expect(newService.layoutConfig().themeMode).toBe('dark');
    });

    it('should load system theme setting from localStorage', () => {
      const configMock = {
        darkTheme: true,
        themeMode: 'system',
      };

      systemThemeDarkMode = true;
      localStorageSpy.getItem.mockReturnValue(JSON.stringify(configMock));

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

    it('should save theme settings to localStorage', () => {
      const testConfig = {
        darkTheme: true,
        themeMode: 'dark' as ThemeMode,
        primary: 'blue',
      };

      localStorageSpy.setItem.mockClear();

      service['saveThemeToStorage'](testConfig);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'layout-config',
        expect.any(String),
      );

      const savedJson = (localStorageSpy.setItem as Mock).mock
        .calls[0][1] as string;
      const savedData = JSON.parse(savedJson);

      expect(savedData.darkTheme).toBe(true);
      expect(savedData.themeMode).toBe('dark');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageSpy.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      vi.spyOn(console, 'error');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [LayoutService],
      });
      const newService = TestBed.inject(LayoutService);
      expect(newService).toBeTruthy();

      expect(console.error).toHaveBeenCalledWith(
        'Error loading theme from storage:',
        expect.any(Error),
      );
    });

    it('should handle localStorage save errors gracefully', () => {
      localStorageSpy.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      vi.spyOn(console, 'error');

      service['saveThemeToStorage']({
        darkTheme: true,
        themeMode: 'dark',
      });

      expect(console.error).toHaveBeenCalledWith(
        'Error saving theme to storage:',
        expect.any(Error),
      );
    });
  });

  describe('theme mode handling', () => {
    it('should update layout configuration when toggling dark mode', () => {
      const initialConfig = { ...service.layoutConfig() };

      (service.toggleDarkModeClass as Mock).mockClear();

      service.toggleDarkMode();

      expect(service.layoutConfig().darkTheme).toBe(!initialConfig.darkTheme);
      expect(service.layoutConfig().themeMode).toBe(
        initialConfig.darkTheme ? 'light' : 'dark',
      );

      (service.toggleDarkModeClass as Mock).mockClear();
      service['handleDarkModeTransition'](service.layoutConfig());
      expect(service.toggleDarkModeClass).toHaveBeenCalled();
    });

    it('should set theme mode correctly for light', () => {
      service.setThemeMode('light');
      expect(service.layoutConfig().themeMode).toBe('light');
      expect(service.layoutConfig().darkTheme).toBe(false);
    });

    it('should set theme mode correctly for dark', () => {
      service.setThemeMode('dark');
      expect(service.layoutConfig().themeMode).toBe('dark');
      expect(service.layoutConfig().darkTheme).toBe(true);
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
      expect(service.layoutConfig().darkTheme).toBe(true);
      expect(window.matchMedia).toHaveBeenCalledWith(
        '(prefers-color-scheme: dark)',
      );

      systemThemeDarkMode = false;
      service.setThemeMode('system');
      expect(service.layoutConfig().darkTheme).toBe(false);
    });

    it('should apply system theme based on OS preference', () => {
      service['systemThemeMediaQuery'] = {
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: () => true,
        onchange: null,
        media: '',
        addListener: vi.fn(),
        removeListener: vi.fn(),
      } as MediaQueryList;

      service['applySystemTheme']();
      expect(service.layoutConfig().darkTheme).toBe(true);

      service['systemThemeMediaQuery'] = {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: () => true,
        onchange: null,
        media: '',
        addListener: vi.fn(),
        removeListener: vi.fn(),
      } as MediaQueryList;

      service['applySystemTheme']();
      expect(service.layoutConfig().darkTheme).toBe(false);
    });

    it('should handle system theme changes through media query listener', () => {
      service.layoutConfig.update((config) => ({
        ...config,
        themeMode: 'system',
      }));

      expect(mediaQueryListeners.length).toBeGreaterThan(0);

      if (mediaQueryListeners[0]) {
        mediaQueryListeners[0]({ matches: true } as MediaQueryListEvent);
        expect(service.layoutConfig().darkTheme).toBe(true);

        mediaQueryListeners[0]({ matches: false } as MediaQueryListEvent);
        expect(service.layoutConfig().darkTheme).toBe(false);
      }
    });

    it('should apply time-based theme in auto mode', () => {
      const morningDate = new Date();
      morningDate.setHours(10, 0, 0, 0);
      vi.setSystemTime(morningDate);

      service.layoutConfig.update((config) => ({
        ...config,
        themeMode: 'auto',
      }));

      service['applyTimeBasedTheme']();
      expect(service.layoutConfig().darkTheme).toBe(false);

      const eveningDate = new Date();
      eveningDate.setHours(20, 0, 0, 0);
      vi.setSystemTime(eveningDate);

      service['applyTimeBasedTheme']();
      expect(service.layoutConfig().darkTheme).toBe(true);
    });

    it('should call toggleDarkModeClass when darkTheme changes', () => {
      (service.toggleDarkModeClass as Mock).mockClear();

      service['handleDarkModeTransition']({
        darkTheme: true,
        themeMode: 'dark',
      });

      expect(service.toggleDarkModeClass).toHaveBeenCalled();
    });

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
      expect(service.isSidebarActive()).toBe(false);

      service.layoutState.update((state) => ({
        ...state,
        overlayMenuActive: true,
        staticMenuMobileActive: false,
      }));
      expect(service.isSidebarActive()).toBe(true);

      service.layoutState.update((state) => ({
        ...state,
        overlayMenuActive: false,
        staticMenuMobileActive: true,
      }));
      expect(service.isSidebarActive()).toBe(true);
    });

    it('should compute isDarkTheme correctly', () => {
      service.layoutConfig.update((config) => ({ ...config, darkTheme: true }));
      expect(service.isDarkTheme()).toBe(true);

      service.layoutConfig.update((config) => ({
        ...config,
        darkTheme: false,
      }));
      expect(service.isDarkTheme()).toBe(false);
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
      expect(service.isOverlay()).toBe(false);

      service.layoutConfig.update((config) => ({
        ...config,
        menuMode: 'overlay',
      }));
      expect(service.isOverlay()).toBe(true);
    });
  });

  describe('device detection', () => {
    it('should detect desktop correctly based on window width', () => {
      const originalInnerWidth = window.innerWidth;
      Object.defineProperty(window, 'innerWidth', {
        value: 1200,
        configurable: true,
      });

      expect(service.isDesktop()).toBe(true);
      expect(service.isMobile()).toBe(false);

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

      expect(service.isDesktop()).toBe(false);
      expect(service.isMobile()).toBe(true);

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

      vi.spyOn(service, 'isDesktop').mockReturnValue(true);

      service.onMenuToggle();
      expect(service.layoutState().staticMenuDesktopInactive).toBe(true);

      service.onMenuToggle();
      expect(service.layoutState().staticMenuDesktopInactive).toBe(false);
    });

    it('should handle menu toggle for mobile', () => {
      service.layoutState.update((state) => ({
        ...state,
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        staticMenuMobileActive: false,
      }));

      vi.spyOn(service, 'isDesktop').mockReturnValue(false);

      service.onMenuToggle();
      expect(service.layoutState().staticMenuMobileActive).toBe(true);

      service.onMenuToggle();
      expect(service.layoutState().staticMenuMobileActive).toBe(false);
    });

    it('should emit menu state change event', () => {
      vi.spyOn(service['menuSource'], 'next');
      const menuEvent = { key: 'test-key' };

      service.onMenuStateChange(menuEvent);

      expect(service['menuSource'].next).toHaveBeenCalledWith(menuEvent);
    });
  });

  describe('configuration and event handling', () => {
    it('should update config and emit update event', () => {
      vi.spyOn(service['configUpdate'], 'next');

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

      vi.spyOn(service, 'isDesktop').mockReturnValue(false);

      service.layoutState.update((state) => ({
        ...state,
        staticMenuMobileActive: false,
      }));

      service.onMenuToggle();

      expect(service.layoutState().staticMenuMobileActive).toBe(true);

      expect(overlayOpened).toBe(true);
    });

    it('should reset and emit reset event', () => {
      vi.spyOn(service['resetSource'], 'next');

      service.reset();

      expect(service['resetSource'].next).toHaveBeenCalledWith(true);
    });
  });

  describe('transition handling', () => {
    it('should set transition complete flag correctly', () => {
      expect(service.transitionComplete()).toBe(false);

      service['onTransitionEnd']();
      expect(service.transitionComplete()).toBe(true);

      vi.advanceTimersByTime(150);
      expect(service.transitionComplete()).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should cleanup timeCheckInterval on destroy', () => {
      const fakeInterval = 123;
      service['timeCheckInterval'] = fakeInterval as unknown as ReturnType<
        typeof setInterval
      >;

      vi.spyOn(window, 'clearInterval').mockImplementation(() => {
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
        addEventListener: vi.fn(),
        removeEventListener: vi.fn().mockImplementation(() => {
          service['systemThemeHandler'] = null;
          service['systemThemeMediaQuery'] = null;
        }),
        dispatchEvent: () => true,
        onchange: null,
        media: '(prefers-color-scheme: dark)',
        addListener: vi.fn(),
        removeListener: vi.fn(),
      } as unknown as MediaQueryList;

      const mockHandler = vi.fn();

      service['systemThemeMediaQuery'] = mockMediaQueryList;
      service['systemThemeHandler'] = mockHandler;

      vi.spyOn(window, 'clearInterval').mockImplementation(() => {
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
    expect(service.isDarkTheme()).toBe(false);

    service.layoutConfig.update((config) => ({
      ...config,
      darkTheme: true,
    }));
    expect(service.isDarkTheme()).toBe(true);
  });
});
