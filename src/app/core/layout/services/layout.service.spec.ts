import { TestBed } from '@angular/core/testing';
import { LayoutService } from './layout.service';

describe('LayoutService', () => {
  let service: LayoutService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Mock localStorage
    const storageMock = jasmine.createSpyObj('Storage', [
      'getItem',
      'setItem',
      'removeItem',
    ]);
    storageMock.getItem.and.returnValue(null);
    spyOnProperty(window, 'localStorage').and.returnValue(storageMock);
    localStorageSpy = storageMock;

    TestBed.configureTestingModule({
      providers: [LayoutService],
    });
    service = TestBed.inject(LayoutService);
  });

  afterEach(() => {
    // Cleanup mocks
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default config values', () => {
    expect(service.layoutConfig()).toBeDefined();
    expect(service.layoutConfig().primary).toBe('blue');
    expect(service.layoutConfig().menuMode).toBe('static');
    expect(service.layoutConfig().themeMode).toBe('auto');
  });

  it('should load theme from localStorage on initialization', () => {
    // Verificar que se intentó leer desde localStorage durante la inicialización
    expect(localStorageSpy.getItem).toHaveBeenCalledWith('layout-config');
  });

  it('should update layout configuration when toggling dark mode', () => {
    // Guarda el estado inicial
    const initialConfig = { ...service.layoutConfig() };

    // Act
    service.toggleDarkMode();

    // Assert - La configuración debe ser diferente después de cambiar el modo oscuro
    expect(service.layoutConfig().darkTheme).toBe(!initialConfig.darkTheme);
  });

  it('should set theme mode correctly', () => {
    // Test light mode
    service.setThemeMode('light');
    expect(service.layoutConfig().themeMode).toBe('light');
    expect(service.layoutConfig().darkTheme).toBeFalse();

    // Test dark mode
    service.setThemeMode('dark');
    expect(service.layoutConfig().themeMode).toBe('dark');
    expect(service.layoutConfig().darkTheme).toBeTrue();

    // Test auto mode
    const currentHour = new Date().getHours();
    const shouldBeDark = currentHour >= 18 || currentHour < 6;

    service.setThemeMode('auto');
    expect(service.layoutConfig().themeMode).toBe('auto');
    expect(service.layoutConfig().darkTheme).toBe(shouldBeDark);
  });

  it('should detect desktop and mobile correctly', () => {
    // Mock window.innerWidth
    const originalInnerWidth = window.innerWidth;

    // Test desktop
    Object.defineProperty(window, 'innerWidth', {
      value: 1200,
      configurable: true,
    });
    expect(service.isDesktop()).toBeTrue();
    expect(service.isMobile()).toBeFalse();

    // Test mobile
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      configurable: true,
    });
    expect(service.isDesktop()).toBeFalse();
    expect(service.isMobile()).toBeTrue();

    // Restore original value
    Object.defineProperty(window, 'innerWidth', {
      value: originalInnerWidth,
      configurable: true,
    });
  });

  it('should handle menu toggle', () => {
    // Set initial state
    service.layoutState.update((state) => ({
      ...state,
      staticMenuDesktopInactive: false,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
    }));

    // Mock isDesktop to return true
    spyOn(service, 'isDesktop').and.returnValue(true);

    // Toggle menu in desktop mode
    service.onMenuToggle();
    expect(service.layoutState().staticMenuDesktopInactive).toBeTrue();

    // Mock isDesktop to return false
    service['isDesktop'] = jasmine.createSpy().and.returnValue(false);

    // Toggle menu in mobile mode
    service.onMenuToggle();
    expect(service.layoutState().staticMenuMobileActive).toBeTrue();
  });

  it('should update config and emit update event', () => {
    spyOn(service['configUpdate'], 'next');

    service.onConfigUpdate();

    expect(service['configUpdate'].next).toHaveBeenCalledWith(
      service.layoutConfig(),
    );
  });

  it('should emit menu state change event', () => {
    spyOn(service['menuSource'], 'next');
    const menuEvent = { key: 'test-key' };

    service.onMenuStateChange(menuEvent);

    expect(service['menuSource'].next).toHaveBeenCalledWith(menuEvent);
  });

  it('should reset and emit reset event', () => {
    spyOn(service['resetSource'], 'next');

    service.reset();

    expect(service['resetSource'].next).toHaveBeenCalledWith(true);
  });

  it('should cleanup on destroy', () => {
    // Set a time check interval with an empty function (just for testing cleanup)
    service['timeCheckInterval'] = setInterval(() => {
      /* empty interval for testing */
    }, 1000);

    spyOn(window, 'clearInterval');

    service.ngOnDestroy();

    expect(window.clearInterval).toHaveBeenCalledWith(
      service['timeCheckInterval'],
    );
  });
});
