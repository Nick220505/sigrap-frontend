import { NO_ERRORS_SCHEMA, PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { LayoutService } from '@core/layout/services/layout.service';
import { ConfiguratorComponent } from './configurator.component';

describe('ConfiguratorComponent', () => {
  let component: ConfiguratorComponent;
  let fixture: ComponentFixture<ConfiguratorComponent>;
  let layoutService: jasmine.SpyObj<LayoutService>;

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

    const routerSpy = jasmine.createSpyObj('Router', [], {
      url: '/dashboard',
    });

    await TestBed.configureTestingModule({
      imports: [ConfiguratorComponent],
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

    spyOn(component, 'ngOnInit');

    spyOn(component, 'applyTheme').and.stub();
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
              focusBackground: '{surface.400}',
              color: '{text.900}',
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
              focusBackground: '{surface.600}',
              color: '{text.100}',
              focusColor: '{text.100}',
            },
          },
        },
      },
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
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
  });

  describe('State Changes', () => {
    it('should update layout config when menu mode is changed', () => {
      const updateSpy = spyOn(
        layoutService.layoutConfig,
        'update',
      ).and.callThrough();

      component.onMenuModeChange('overlay');

      expect(updateSpy).toHaveBeenCalled();
    });
  });
});
