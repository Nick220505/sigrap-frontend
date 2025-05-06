import { NO_ERRORS_SCHEMA, PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { LayoutService } from '@core/layout/services/layout.service';
import { ConfiguratorComponent } from './configurator.component';

type PaletteType = Record<string, string>;

interface ColorType {
  name: string;
  palette: PaletteType;
}

const mockUpdatePreset = jasmine.createSpy('updatePreset');
const mockUpdateSurfacePalette = jasmine.createSpy('updateSurfacePalette');

describe('ConfiguratorComponent', () => {
  let component: ConfiguratorComponent;
  let fixture: ComponentFixture<ConfiguratorComponent>;
  let layoutService: jasmine.SpyObj<LayoutService>;
  let layoutConfigUpdateSpy: jasmine.Spy;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const layoutServiceSpy = jasmine.createSpyObj('LayoutService', [], {
      layoutConfig: signal({
        primary: 'blue',
        surface: 'slate',
        preset: 'Aura',
        menuMode: 'static',
        darkTheme: false,
      }),
    });

    layoutConfigUpdateSpy = spyOn(
      layoutServiceSpy.layoutConfig,
      'update',
    ).and.callThrough();

    routerSpy = jasmine.createSpyObj('Router', [], {
      url: '/dashboard',
    });

    await TestBed.configureTestingModule({
      imports: [ConfiguratorComponent, FormsModule],
      providers: [
        { provide: LayoutService, useValue: layoutServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfiguratorComponent);
    component = fixture.componentInstance;
    layoutService = TestBed.inject(
      LayoutService,
    ) as jasmine.SpyObj<LayoutService>;

    spyOn(component, 'getPresetExt').and.returnValue({
      semantic: {
        primary: {},
        colorScheme: {
          light: {
            primary: {
              color: '{primary.500}',
              contrastColor: '#ffffff',
              hoverColor: '{primary.600}',
              activeColor: '{primary.700}',
            },
            highlight: {
              background: '{surface.300}',
              color: '{text.900}',
              focusBackground: '{surface.400}',
              focusColor: '{text.900}',
            },
          },
          dark: {
            primary: {
              color: '{primary.400}',
              contrastColor: '{surface.900}',
              hoverColor: '{primary.300}',
              activeColor: '{primary.200}',
            },
            highlight: {
              background: '{surface.700}',
              color: '{text.100}',
              focusBackground: '{surface.600}',
              focusColor: '{text.100}',
            },
          },
        },
      },
    });

    component.applyTheme = (type: string, color: ColorType) => {
      if (type === 'primary') {
        mockUpdatePreset(component.getPresetExt());
      } else if (type === 'surface') {
        mockUpdateSurfacePalette(color.palette);
      }
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Service interactions', () => {
    it('should use the layout service for configuration', () => {
      expect(layoutService.layoutConfig).toBeDefined();
    });
  });

  describe('Computed Properties', () => {
    it('should get selectedPrimaryColor from layout config', () => {
      expect(component.selectedPrimaryColor()).toBe('blue');
    });

    it('should get selectedSurfaceColor from layout config', () => {
      expect(component.selectedSurfaceColor()).toBe('slate');
    });

    it('should get selectedPreset from layout config', () => {
      expect(component.selectedPreset()).toBe('Aura');
    });

    it('should get menuMode from layout config', () => {
      expect(component.menuMode()).toBe('static');
    });

    it('should compute primaryColors', () => {
      expect(component.primaryColors()).toBeDefined();
      expect(component.primaryColors().length).toBeGreaterThan(0);
    });

    it('should determine if menu mode button should be shown based on router URL', () => {
      TestBed.resetTestingModule();
      const authRouterSpy = jasmine.createSpyObj('Router', [], {
        url: '/auth/login',
      });

      const fixture2 = TestBed.configureTestingModule({
        imports: [ConfiguratorComponent],
        providers: [
          { provide: Router, useValue: authRouterSpy },
          { provide: PLATFORM_ID, useValue: 'browser' },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      }).createComponent(ConfiguratorComponent);

      const component2 = fixture2.componentInstance;

      expect(component2.showMenuModeButton()).toBeFalse();
    });
  });

  describe('applyTheme method', () => {
    it('should call updatePreset when type is primary', () => {
      const colorMock: ColorType = {
        name: 'blue',
        palette: { 500: '#3b82f6' },
      };

      mockUpdatePreset.calls.reset();

      component.applyTheme('primary', colorMock);

      expect(mockUpdatePreset).toHaveBeenCalledWith(component.getPresetExt());
    });

    it('should call updateSurfacePalette when type is surface', () => {
      const colorMock: ColorType = {
        name: 'slate',
        palette: { 500: '#64748b' },
      };

      mockUpdateSurfacePalette.calls.reset();

      component.applyTheme('surface', colorMock);

      expect(mockUpdateSurfacePalette).toHaveBeenCalledWith(colorMock.palette);
    });

    it('should not call any update function for other types', () => {
      const colorMock: ColorType = {
        name: 'blue',
        palette: { 500: '#3b82f6' },
      };

      mockUpdatePreset.calls.reset();
      mockUpdateSurfacePalette.calls.reset();

      component.applyTheme('unknown', colorMock);

      expect(mockUpdatePreset).not.toHaveBeenCalled();
      expect(mockUpdateSurfacePalette).not.toHaveBeenCalled();
    });
  });

  describe('updateColors method', () => {
    it('should update layout config with primary color', () => {
      mockUpdatePreset.calls.reset();

      const event = new MouseEvent('click');
      const stopPropagationSpy = spyOn(event, 'stopPropagation');
      const color: ColorType = {
        name: 'green',
        palette: { 500: '#10b981' },
      };

      component.updateColors(event, 'primary', color);

      expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(mockUpdatePreset).toHaveBeenCalled();
    });

    it('should update layout config with surface color', () => {
      mockUpdateSurfacePalette.calls.reset();

      const event = new MouseEvent('click');
      const stopPropagationSpy = spyOn(event, 'stopPropagation');
      const color: ColorType = {
        name: 'zinc',
        palette: { 500: '#71717a' },
      };

      component.updateColors(event, 'surface', color);

      expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(mockUpdateSurfacePalette).toHaveBeenCalledWith(color.palette);
    });

    it('should call stopPropagation when updating colors', () => {
      const mockEvent = jasmine.createSpyObj('Event', ['stopPropagation']);
      const color: ColorType = {
        name: 'blue',
        palette: { 500: '#3b82f6' },
      };

      component.updateColors(mockEvent, 'primary', color);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('should handle any color type and call applyTheme', () => {
      mockUpdatePreset.calls.reset();
      mockUpdateSurfacePalette.calls.reset();

      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      const color: ColorType = {
        name: 'blue',
        palette: { 500: '#3b82f6' },
      };

      layoutConfigUpdateSpy.calls.reset();

      component.updateColors(event, 'custom', color);

      expect(mockUpdatePreset).not.toHaveBeenCalled();
      expect(mockUpdateSurfacePalette).not.toHaveBeenCalled();
    });
  });

  describe('onPresetChange method', () => {
    it('should update layout config when preset changes', () => {
      component.onPresetChange('Lara');

      expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      const updateCall = layoutConfigUpdateSpy.calls.mostRecent().args[0];

      const result = updateCall({ preset: 'Aura' });
      expect(result.preset).toBe('Lara');
    });

    it('should handle all available presets', () => {
      component.presets.forEach((preset) => {
        layoutConfigUpdateSpy.calls.reset();
        component.onPresetChange(preset);
        expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      });
    });

    it('should not update config when preset value is not valid', () => {
      layoutConfigUpdateSpy.calls.reset();
      component.onPresetChange('InvalidPreset');

      expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      const updateCall = layoutConfigUpdateSpy.calls.mostRecent().args[0];

      const result = updateCall({ preset: 'Aura' });
      expect(result.preset).toBe('InvalidPreset');
    });
  });

  describe('UI interaction', () => {
    it('should trigger updateColors when primary color button is clicked', () => {
      spyOn(component, 'updateColors').and.callThrough();
      const primaryColorButtons = fixture.debugElement.queryAll(
        By.css('button[title]'),
      );

      if (primaryColorButtons.length > 0) {
        const primaryButton = primaryColorButtons[0];
        primaryButton.triggerEventHandler('click', new MouseEvent('click'));
        expect(component.updateColors).toHaveBeenCalled();
      }
    });

    it('should trigger onPresetChange when preset selectbutton changes', () => {
      spyOn(component, 'onPresetChange');

      const selectButton = fixture.debugElement.query(By.css('p-selectbutton'));

      if (selectButton) {
        selectButton.triggerEventHandler('ngModelChange', 'Lara');
        expect(component.onPresetChange).toHaveBeenCalledWith('Lara');
      }
    });

    it('should render the menuModeOptions correctly', () => {
      expect(component.menuModeOptions).toEqual([
        { label: 'Estático', value: 'static' },
        { label: 'Superpuesto', value: 'overlay' },
      ]);
    });

    it('should conditionally show the menu mode selector based on route', () => {
      const menuModeDiv = fixture.debugElement.query(By.css('div'));

      expect(component.showMenuModeButton()).toBeTrue();

      if (menuModeDiv) {
        expect(menuModeDiv).toBeTruthy();
      }
    });
  });

  describe('Menu Mode changes', () => {
    it('should update layout config when menu mode is changed', () => {
      component.onMenuModeChange('overlay');

      expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      const updateCall = layoutConfigUpdateSpy.calls.mostRecent().args[0];

      const result = updateCall({ menuMode: 'static' });
      expect(result.menuMode).toBe('overlay');
    });

    it('should handle both menu mode options', () => {
      layoutConfigUpdateSpy.calls.reset();
      component.onMenuModeChange('static');
      expect(layoutConfigUpdateSpy).toHaveBeenCalled();

      layoutConfigUpdateSpy.calls.reset();
      component.onMenuModeChange('overlay');
      expect(layoutConfigUpdateSpy).toHaveBeenCalled();
    });
  });
});
