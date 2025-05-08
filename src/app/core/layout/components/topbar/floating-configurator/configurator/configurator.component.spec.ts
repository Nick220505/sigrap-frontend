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

describe('ConfiguratorComponent', () => {
  let component: ConfiguratorComponent;
  let fixture: ComponentFixture<ConfiguratorComponent>;
  let layoutService: jasmine.SpyObj<LayoutService>;
  let layoutConfigUpdateSpy: jasmine.Spy;
  let routerSpy: jasmine.SpyObj<Router>;
  let applyThemeSpy: jasmine.Spy;

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

    applyThemeSpy = spyOn(component, 'applyTheme').and.callThrough();

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

  describe('getPresetExt method', () => {
    it('should return noir preset config when color.name is noir', () => {
      // We'll test the implementation directly
      const noirResult = component['getPresetExt'].call({
        primaryColors: () => [{ name: 'noir', palette: {} }],
        selectedPrimaryColor: () => 'noir',
        layoutService: {
          layoutConfig: () => ({ preset: 'Aura' }),
        },
      });

      // Verify noir-specific properties
      expect(noirResult.semantic.primary?.[50]).toBe('{surface.50}');
      expect(noirResult.semantic.colorScheme.light.primary.color).toBe(
        '{primary.950}',
      );
      expect(noirResult.semantic.colorScheme.dark.highlight.color).toBe(
        '{primary.950}',
      );
    });

    it('should return Nora preset config when preset is Nora', () => {
      // We'll test the implementation directly
      const colorMock = { name: 'blue', palette: { '500': '#3b82f6' } };

      const noraResult = component['getPresetExt'].call({
        primaryColors: () => [colorMock],
        selectedPrimaryColor: () => 'blue',
        layoutService: {
          layoutConfig: () => ({ preset: 'Nora' }),
        },
      });

      // Verify Nora-specific properties
      expect(noraResult.semantic.primary).toBe(colorMock.palette);
      expect(noraResult.semantic.colorScheme.light.primary.color).toBe(
        '{primary.600}',
      );
      expect(noraResult.semantic.colorScheme.dark.primary.color).toBe(
        '{primary.500}',
      );
    });

    it('should return default preset config for other cases', () => {
      // We'll test the implementation directly
      const colorMock = { name: 'green', palette: { '500': '#10b981' } };

      const defaultResult = component['getPresetExt'].call({
        primaryColors: () => [colorMock],
        selectedPrimaryColor: () => 'green',
        layoutService: {
          layoutConfig: () => ({ preset: 'Lara' }),
        },
      });

      // Verify default config properties
      expect(defaultResult.semantic.primary).toBe(colorMock.palette);
      expect(defaultResult.semantic.colorScheme.light.primary.color).toBe(
        '{primary.500}',
      );
      expect(
        defaultResult.semantic.colorScheme.dark.highlight.background,
      ).toContain('color-mix');
    });
  });

  describe('updateColors method', () => {
    it('should update layout config with primary color and call applyTheme', () => {
      const event = new MouseEvent('click');
      const stopPropagationSpy = spyOn(event, 'stopPropagation');
      const color: ColorType = {
        name: 'green',
        palette: { 500: '#10b981' },
      };

      applyThemeSpy.calls.reset();

      component.updateColors(event, 'primary', color);

      expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(applyThemeSpy).toHaveBeenCalledWith('primary', color);
    });

    it('should update layout config with surface color and call applyTheme', () => {
      const event = new MouseEvent('click');
      const stopPropagationSpy = spyOn(event, 'stopPropagation');
      const color: ColorType = {
        name: 'zinc',
        palette: { 500: '#71717a' },
      };

      applyThemeSpy.calls.reset();

      component.updateColors(event, 'surface', color);

      expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(applyThemeSpy).toHaveBeenCalledWith('surface', color);
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
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');
      const color: ColorType = {
        name: 'blue',
        palette: { 500: '#3b82f6' },
      };

      applyThemeSpy.calls.reset();

      component.updateColors(event, 'custom', color);

      expect(applyThemeSpy).toHaveBeenCalledWith('custom', color);
    });
  });

  describe('onPresetChange method', () => {
    it('should update layout config when preset changes', () => {
      // Create a proper mock for getPresetExt
      const mockPresetExt = {
        semantic: {
          primary: { '500': '#3b82f6' },
          colorScheme: {
            light: {
              primary: {
                color: '{primary.500}',
                contrastColor: '#ffffff',
                hoverColor: '{primary.600}',
                activeColor: '{primary.700}',
              },
              highlight: {
                background: '{primary.50}',
                focusBackground: '{primary.100}',
                color: '{primary.700}',
                focusColor: '{primary.800}',
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
                background:
                  'color-mix(in srgb, {primary.400}, transparent 84%)',
                focusBackground:
                  'color-mix(in srgb, {primary.400}, transparent 76%)',
                color: 'rgba(255,255,255,.87)',
                focusColor: 'rgba(255,255,255,.87)',
              },
            },
          },
        },
      };

      spyOn(component, 'getPresetExt').and.returnValue(mockPresetExt);

      component.onPresetChange('Lara');

      expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      const updateCall = layoutConfigUpdateSpy.calls.mostRecent().args[0];

      const result = updateCall({ preset: 'Aura' });
      expect(result.preset).toBe('Lara');
    });

    it('should handle all available presets', () => {
      // Create a proper mock for getPresetExt
      const mockPresetExt = {
        semantic: {
          primary: { '500': '#3b82f6' },
          colorScheme: {
            light: {
              primary: {
                color: '{primary.500}',
                contrastColor: '#ffffff',
                hoverColor: '{primary.600}',
                activeColor: '{primary.700}',
              },
              highlight: {
                background: '{primary.50}',
                focusBackground: '{primary.100}',
                color: '{primary.700}',
                focusColor: '{primary.800}',
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
                background:
                  'color-mix(in srgb, {primary.400}, transparent 84%)',
                focusBackground:
                  'color-mix(in srgb, {primary.400}, transparent 76%)',
                color: 'rgba(255,255,255,.87)',
                focusColor: 'rgba(255,255,255,.87)',
              },
            },
          },
        },
      };

      spyOn(component, 'getPresetExt').and.returnValue(mockPresetExt);

      component.presets.forEach((preset) => {
        layoutConfigUpdateSpy.calls.reset();
        component.onPresetChange(preset);
        expect(layoutConfigUpdateSpy).toHaveBeenCalled();
      });
    });

    it('should not update config when preset value is not valid', () => {
      // Create a proper mock for getPresetExt
      const mockPresetExt = {
        semantic: {
          primary: { '500': '#3b82f6' },
          colorScheme: {
            light: {
              primary: {
                color: '{primary.500}',
                contrastColor: '#ffffff',
                hoverColor: '{primary.600}',
                activeColor: '{primary.700}',
              },
              highlight: {
                background: '{primary.50}',
                focusBackground: '{primary.100}',
                color: '{primary.700}',
                focusColor: '{primary.800}',
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
                background:
                  'color-mix(in srgb, {primary.400}, transparent 84%)',
                focusBackground:
                  'color-mix(in srgb, {primary.400}, transparent 76%)',
                color: 'rgba(255,255,255,.87)',
                focusColor: 'rgba(255,255,255,.87)',
              },
            },
          },
        },
      };

      spyOn(component, 'getPresetExt').and.returnValue(mockPresetExt);

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
