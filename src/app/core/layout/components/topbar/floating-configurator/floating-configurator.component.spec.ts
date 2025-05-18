import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LayoutService } from '@core/layout/services/layout.service';

import { FloatingConfiguratorComponent } from './floating-configurator.component';

const mockLayoutService = {
  layoutConfig: signal({
    darkTheme: false,
    primary: 'blue',
    surface: 'slate',
    menuMode: 'static',
    themeMode: 'light',
  }),
  layoutState: signal({
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
  }),
  isDarkTheme: signal(false),
  getPrimary: signal('blue'),
  getSurface: signal('slate'),
  isOverlay: signal(false),
  transitionComplete: signal(false),
  ngOnDestroy: jasmine.createSpy('ngOnDestroy'),
};

describe('FloatingConfiguratorComponent', () => {
  let component: FloatingConfiguratorComponent;
  let fixture: ComponentFixture<FloatingConfiguratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingConfiguratorComponent],
      providers: [{ provide: LayoutService, useValue: mockLayoutService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('UI Elements', () => {
    it('should render the container div', () => {
      const container = fixture.debugElement.query(By.css('div.fixed'));
      expect(container).toBeTruthy();
    });

    it('should have proper container positioning classes', () => {
      const container = fixture.debugElement.query(By.css('div.fixed'));
      const classes = container.nativeElement.className;
      expect(classes).toContain('fixed');
      expect(classes).toContain('top-8');
      expect(classes).toContain('right-8');
      expect(classes).toContain('z-50');
    });

    it('should render the button', () => {
      const button = fixture.debugElement.query(By.css('p-button'));
      expect(button).toBeTruthy();
    });

    it('should have the correct button icon', () => {
      const button = fixture.debugElement.query(By.css('p-button'));
      expect(button.attributes['icon']).toBe('pi pi-palette');
    });

    it('should have the rounded button property', () => {
      const button = fixture.debugElement.query(By.css('p-button'));
      expect(button.attributes['rounded']).toBeDefined();
    });

    it('should have correct style class animations', () => {
      const button = fixture.debugElement.query(By.css('p-button'));
      expect(button.attributes['pStyleClass']).toBe('@next');
      expect(button.attributes['enterFromClass']).toBe('hidden');
      expect(button.attributes['enterActiveClass']).toBe('animate-scalein');
      expect(button.attributes['leaveToClass']).toBe('hidden');
      expect(button.attributes['leaveActiveClass']).toBe('animate-fadeout');
    });

    it('should have correct button type', () => {
      const button = fixture.debugElement.query(By.css('p-button'));
      expect(button.attributes['type']).toBe('button');
    });

    it('should render the configurator component', () => {
      const configurator = fixture.debugElement.query(
        By.css('app-configurator'),
      );
      expect(configurator).toBeTruthy();
    });
  });
});
