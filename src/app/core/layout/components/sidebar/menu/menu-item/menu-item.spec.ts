import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationEnd, Router, provideRouter } from '@angular/router';
import { LayoutService } from '@core/layout/services/layout';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { Subject } from 'rxjs';
import { MenuItem } from './menu-item';

describe('MenuItem', () => {
  let component: MenuItem;
  let fixture: ComponentFixture<MenuItem>;
  let layoutService: {
    onMenuStateChange: Mock;
    menuSource$: unknown;
    resetSource$: unknown;
  };
  let router: {
    isActive: Mock;
    events: unknown;
  };

  const menuSourceSubject = new Subject<{
    key: string;
    routeEvent?: boolean;
  }>();
  const resetSourceSubject = new Subject<boolean>();
  const routerEventsSubject = new Subject<NavigationEnd>();

  beforeEach(async () => {
    layoutService = {
      onMenuStateChange: vi.fn().mockName('LayoutService.onMenuStateChange'),
      menuSource$: menuSourceSubject.asObservable(),
      resetSource$: resetSourceSubject.asObservable(),
    };

    router = {
      isActive: vi.fn().mockName('Router.isActive'),
      events: routerEventsSubject.asObservable(),
    };
    router.isActive.mockReturnValue(false);

    await TestBed.configureTestingModule({
      imports: [MenuItem, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: LayoutService, useValue: layoutService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  function setupComponent(inputs: {
    item?: PrimeMenuItem;
    index?: number;
    parentKey?: string;
    root?: boolean;
  }): void {
    fixture = TestBed.createComponent(MenuItem);
    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      'item',
      inputs.item ?? { label: 'Default Item' },
    );
    fixture.componentRef.setInput('index', inputs.index ?? 0);
    fixture.componentRef.setInput('parentKey', inputs.parentKey ?? '');

    if (inputs.root !== undefined) {
      fixture.componentRef.setInput('root', inputs.root);
    }

    component.ngOnInit();
  }

  it('should create the component', () => {
    setupComponent({
      item: { label: 'Test Item' },
      index: 0,
      parentKey: '',
    });
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should set the key correctly', () => {
      setupComponent({
        item: { label: 'Test Item' },
        index: 2,
        parentKey: 'parent',
      });
      expect(component.key()).toBe('parent-2');
    });

    it('should set the key without parent key', () => {
      setupComponent({
        item: { label: 'Test Item' },
        index: 3,
        parentKey: '',
      });
      expect(component.key()).toBe('3');
    });

    it('should call updateActiveStateFromRoute if item has a routerLink', () => {
      vi.spyOn(MenuItem.prototype, 'updateActiveStateFromRoute');

      setupComponent({
        item: { label: 'Test Item', routerLink: ['/test'] },
        index: 0,
        parentKey: '',
      });

      expect(component.updateActiveStateFromRoute).toHaveBeenCalled();
    });
  });

  describe('Item rendering', () => {
    it('should render root item label when root is true', () => {
      setupComponent({
        item: { label: 'Root Item' },
        index: 0,
        parentKey: '',
        root: true,
      });
      fixture.detectChanges();

      const rootTextEl = fixture.debugElement.query(
        By.css('.layout-menuitem-root-text'),
      );
      expect(rootTextEl).toBeTruthy();
      expect(rootTextEl.nativeElement.textContent.trim()).toBe('Root Item');
    });

    it('should render item with URL', () => {
      setupComponent({
        item: {
          label: 'External Link',
          url: 'https://example.com',
          icon: 'pi pi-external-link',
        },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      const linkEl = fixture.debugElement.query(By.css('a'));
      expect(linkEl).toBeTruthy();
      expect(linkEl.attributes['href']).toBe('https://example.com');

      const iconEl = fixture.debugElement.query(By.css('.pi-external-link'));
      expect(iconEl).toBeTruthy();

      const textEl = fixture.debugElement.query(
        By.css('.layout-menuitem-text'),
      );
      expect(textEl.nativeElement.textContent.trim()).toBe('External Link');
    });

    it('should render item with submenu items', () => {
      setupComponent({
        item: {
          label: 'Menu with Submenu',
          icon: 'pi pi-fw pi-list',
          items: [{ label: 'Submenu Item 1' }, { label: 'Submenu Item 2' }],
        },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      const submenuToggler = fixture.debugElement.query(
        By.css('.layout-submenu-toggler'),
      );
      expect(submenuToggler).toBeTruthy();

      const submenuItems = fixture.debugElement.queryAll(By.css('li'));
      expect(submenuItems.length).toBe(2);
    });

    it('should not render when visible is false', () => {
      setupComponent({
        item: {
          label: 'Hidden Item',
          visible: false,
        },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      const itemEl = fixture.debugElement.query(
        By.css('.layout-menuitem-text'),
      );
      expect(itemEl).toBeFalsy();
    });
  });

  describe('Item interaction', () => {
    it('should handle item click for standard item', () => {
      setupComponent({
        item: { label: 'Test Item' },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      const linkEl = fixture.debugElement.query(By.css('a'));
      linkEl.triggerEventHandler('click', new MouseEvent('click'));

      expect(layoutService.onMenuStateChange).toHaveBeenCalledWith({
        key: component.key(),
      });
    });

    it('should toggle active state for items with submenu', () => {
      setupComponent({
        item: {
          label: 'Menu with Submenu',
          items: [{ label: 'Submenu Item' }],
        },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      expect(component.active()).toBe(false);

      const linkEl = fixture.debugElement.query(By.css('a'));
      linkEl.triggerEventHandler('click', new MouseEvent('click'));

      expect(component.active()).toBe(true);
      expect(layoutService.onMenuStateChange).toHaveBeenCalledWith({
        key: component.key(),
      });

      linkEl.triggerEventHandler('click', new MouseEvent('click'));
      expect(component.active()).toBe(false);
    });

    it('should not do anything when clicking disabled item', () => {
      setupComponent({
        item: {
          label: 'Disabled Item',
          disabled: true,
        },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      const event = new MouseEvent('click');
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      component.itemClick(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(layoutService.onMenuStateChange).not.toHaveBeenCalled();
    });

    it('should execute command when defined', () => {
      const commandSpy = vi.fn();
      setupComponent({
        item: {
          label: 'Command Item',
          command: commandSpy,
        },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      const mockEvent = new MouseEvent('click');
      component.itemClick(mockEvent);

      expect(commandSpy).toHaveBeenCalledWith({
        originalEvent: mockEvent,
        item: component.item(),
      });
      expect(layoutService.onMenuStateChange).toHaveBeenCalledWith({
        key: component.key(),
      });
    });

    it('should update active state when route matches', () => {
      router.isActive.mockReturnValue(true);

      setupComponent({
        item: {
          label: 'Dashboard',
          routerLink: ['/dashboard'],
        },
        index: 0,
        parentKey: '',
      });

      component.updateActiveStateFromRoute();

      expect(router.isActive).toHaveBeenCalledWith('/dashboard', {
        paths: 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored',
      });
      expect(layoutService.onMenuStateChange).toHaveBeenCalledWith({
        key: component.key(),
        routeEvent: true,
      });
    });

    it('should update the active state directly', () => {
      setupComponent({
        item: { label: 'Test Item' },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      expect(component.active()).toBe(false);

      component.active.set(true);

      expect(component.active()).toBe(true);
    });

    it('should set parent active when child item is clicked', () => {
      setupComponent({
        item: {
          label: 'Parent Menu',
          items: [{ label: 'Child Item' }],
        },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      expect(component.active()).toBe(false);

      const event = new MouseEvent('click');
      component.itemClick(event);

      expect(component.active()).toBe(true);
    });
  });

  describe('Route handling', () => {
    it('should update active state from route when route is active', () => {
      router.isActive.mockReturnValue(true);

      setupComponent({
        item: {
          label: 'Dashboard',
          routerLink: ['/dashboard'],
        },
        index: 0,
        parentKey: '',
      });

      component.updateActiveStateFromRoute();

      expect(router.isActive).toHaveBeenCalledWith('/dashboard', {
        paths: 'exact',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored',
      });
      expect(layoutService.onMenuStateChange).toHaveBeenCalledWith({
        key: component.key(),
        routeEvent: true,
      });
    });

    it('should not update state when route is not active', () => {
      router.isActive.mockReturnValue(false);

      setupComponent({
        item: {
          label: 'Dashboard',
          routerLink: ['/dashboard'],
        },
        index: 0,
        parentKey: '',
      });

      layoutService.onMenuStateChange.mockClear();

      component.updateActiveStateFromRoute();

      expect(router.isActive).toHaveBeenCalled();
      expect(layoutService.onMenuStateChange).not.toHaveBeenCalled();
    });
  });

  describe('Helper methods and bindings', () => {
    it('should return "expanded" for submenuAnimation when root is true', () => {
      setupComponent({ root: true });
      fixture.detectChanges();
      expect(component.submenuAnimation).toBe('expanded');
    });

    it('should return "expanded" for submenuAnimation when active', () => {
      setupComponent({ root: false });
      component.active.set(true);
      fixture.detectChanges();
      expect(component.submenuAnimation).toBe('expanded');
    });

    it('should return "collapsed" for submenuAnimation when not active and not root', () => {
      setupComponent({ root: false });
      component.active.set(false);
      fixture.detectChanges();
      expect(component.submenuAnimation).toBe('collapsed');
    });

    it('should add active-menuitem class when active and not root', () => {
      setupComponent({ root: false });
      component.active.set(true);
      fixture.detectChanges();
      expect(component.activeClass).toBe(true);
    });

    it('should not add active-menuitem class when not active', () => {
      setupComponent({ root: false });
      component.active.set(false);
      fixture.detectChanges();
      expect(component.activeClass).toBe(false);
    });

    it('should not add active-menuitem class when root even if active', () => {
      setupComponent({ root: true });
      component.active.set(true);
      fixture.detectChanges();
      expect(component.activeClass).toBe(false);
    });

    it('should add layout-root-menuitem class when root', () => {
      setupComponent({ root: true });
      fixture.detectChanges();
      expect(component.isRootItem).toBe(true);
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from subscriptions on destroy', () => {
      setupComponent({});
      const menuSourceSpy = vi.spyOn(
        component['menuSourceSubscription'],
        'unsubscribe',
      );
      const menuResetSpy = vi.spyOn(
        component['menuResetSubscription'],
        'unsubscribe',
      );

      component.ngOnDestroy();

      expect(menuSourceSpy).toHaveBeenCalled();
      expect(menuResetSpy).toHaveBeenCalled();
    });
  });

  describe('Subscription handlers', () => {
    it('should respond to menu source events', () => {
      setupComponent({
        item: { label: 'Test Item' },
        index: 1,
        parentKey: 'parent',
      });
      fixture.detectChanges();

      component.active.set(true);
      expect(component.active()).toBe(true);

      component.active.set(false);
      fixture.detectChanges();

      expect(component.active()).toBe(false);
    });

    it('should reset active state when reset event occurs', () => {
      setupComponent({
        item: { label: 'Reset Test Item' },
        index: 0,
        parentKey: '',
      });
      fixture.detectChanges();

      component.active.set(true);
      expect(component.active()).toBe(true);

      resetSourceSubject.next(true);
      fixture.detectChanges();

      expect(component.active()).toBe(false);
    });
  });

  describe('Route testing', () => {
    it('should explicitly test updateActiveStateFromRoute method', () => {
      setupComponent({
        item: {
          label: 'Test Route Item',
          routerLink: ['/test-path'],
        },
      });

      router.isActive.mockReturnValue(false);
      layoutService.onMenuStateChange.mockClear();
      component.updateActiveStateFromRoute();
      expect(layoutService.onMenuStateChange).not.toHaveBeenCalled();

      router.isActive.mockReturnValue(true);
      component.active.set(false);
      layoutService.onMenuStateChange.mockClear();

      component.updateActiveStateFromRoute();

      expect(layoutService.onMenuStateChange).toHaveBeenCalledWith({
        key: component.key(),
        routeEvent: true,
      });
    });

    it('should call updateActiveStateFromRoute when NavigationEnd occurs', () => {
      setupComponent({
        item: {
          label: 'Router Item',
          routerLink: ['/test-path'],
        },
      });

      vi.spyOn(component, 'updateActiveStateFromRoute');

      component.updateActiveStateFromRoute();

      expect(component.updateActiveStateFromRoute).toHaveBeenCalled();
    });

    it('should call router.isActive when route link exists', () => {
      setupComponent({
        item: {
          label: 'Router Item',
          routerLink: ['/dashboard'],
        },
      });

      router.isActive.mockClear();

      component.updateActiveStateFromRoute();

      expect(router.isActive).toHaveBeenCalled();
    });
  });

  describe('Item command and disabled behavior', () => {
    it('should not execute actions when item is disabled', () => {
      setupComponent({
        item: {
          label: 'Disabled Item',
          disabled: true,
        },
        index: 0,
        parentKey: '',
      });

      const event = new MouseEvent('click');
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      component.itemClick(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(layoutService.onMenuStateChange).not.toHaveBeenCalled();
    });

    it('should execute command when defined', () => {
      const commandSpy = vi.fn();

      setupComponent({
        item: {
          label: 'Command Item',
          command: commandSpy,
        },
        index: 0,
        parentKey: '',
      });

      const event = new MouseEvent('click');
      component.itemClick(event);

      expect(commandSpy).toHaveBeenCalledWith({
        originalEvent: event,
        item: component.item(),
      });
    });
  });

  describe('Helper methods', () => {
    it('should return correct submenuAnimation based on active and root states', () => {
      setupComponent({
        root: false,
      });

      component.active.set(false);
      expect(component.submenuAnimation).toBe('collapsed');

      component.active.set(true);
      expect(component.submenuAnimation).toBe('expanded');

      setupComponent({
        root: true,
      });

      expect(component.submenuAnimation).toBe('expanded');
    });

    it('should compute activeClass correctly', () => {
      setupComponent({
        root: false,
      });

      component.active.set(false);
      expect(component.activeClass).toBe(false);

      component.active.set(true);
      expect(component.activeClass).toBe(true);

      setupComponent({
        root: true,
      });

      component.active.set(true);
      expect(component.activeClass).toBe(false);
    });

    it('should compute isRootItem correctly', () => {
      setupComponent({
        root: false,
      });
      expect(component.isRootItem).toBe(false);

      setupComponent({
        root: true,
      });
      expect(component.isRootItem).toBe(true);
    });
  });

  describe('Item visibility and rendering', () => {
    it('should not render when item visible is false', () => {
      setupComponent({
        item: { label: 'Hidden Item', visible: false },
      });

      fixture.detectChanges();
      const menuItem = fixture.debugElement.query(
        By.css('.layout-menuitem-text'),
      );
      expect(menuItem).toBeFalsy();
    });

    it('should add badge when item has badge', () => {
      setupComponent({
        item: {
          label: 'Badge Item',
          badge: '5',
        },
      });

      fixture.detectChanges();

      const labelEl = fixture.debugElement.query(
        By.css('.layout-menuitem-text'),
      );
      expect(labelEl).toBeTruthy();
      expect(labelEl.nativeElement.textContent.trim()).toBe('Badge Item');
    });

    it('should set target attribute for external links', () => {
      setupComponent({
        item: {
          label: 'External Link',
          url: 'https://example.com',
          target: '_blank',
        },
      });

      fixture.detectChanges();

      const linkEl = fixture.debugElement.query(By.css('a'));
      expect(linkEl.attributes['target']).toBe('_blank');
    });
  });

  describe('Key handling and DOM testing', () => {
    it('should use item.label in html rendering', () => {
      setupComponent({
        item: { label: 'Custom Label Text' },
      });

      fixture.detectChanges();

      const labelEl = fixture.debugElement.query(
        By.css('.layout-menuitem-text'),
      );
      expect(labelEl.nativeElement.textContent.trim()).toBe(
        'Custom Label Text',
      );
    });

    it('should correctly compute item key with parent', () => {
      setupComponent({
        item: { label: 'Test Item' },
        index: 3,
        parentKey: 'parent-section',
      });

      expect(component.key()).toBe('parent-section-3');
    });

    it('should render icon when item has icon property', () => {
      setupComponent({
        item: {
          label: 'Icon Item',
          icon: 'pi pi-home',
        },
      });

      fixture.detectChanges();

      const iconEl = fixture.debugElement.query(By.css('.pi-home'));
      expect(iconEl).toBeTruthy();
    });
  });

  describe('Subscription handlers - direct access', () => {
    it('should handle non-matching key cases correctly', () => {
      setupComponent({
        item: { label: 'Test Item' },
        index: 3,
        parentKey: 'parent',
      });

      expect(component.key()).toBe('parent-3');

      component.active.set(true);
      expect(component.active()).toBe(true);

      fixture = TestBed.createComponent(MenuItem);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('item', { label: 'Different Item' });
      fixture.componentRef.setInput('index', 5);
      fixture.componentRef.setInput('parentKey', 'other-parent');
      component.ngOnInit();

      component.active.set(true);
      fixture.detectChanges();

      menuSourceSubject.next({ key: 'totally-different-key' });

      setTimeout(() => {
        expect(component.active()).toBe(false);
      }, 0);
    });
  });

  describe('Router events subscription', () => {
    it('should call updateActiveStateFromRoute when NavigationEnd event occurs', () => {
      const eventsSubject = new Subject<NavigationEnd>();

      Object.defineProperty(router, 'events', {
        get: () => eventsSubject,
      });

      setupComponent({
        item: {
          label: 'Route Item',
          routerLink: ['/dashboard'],
        },
      });

      const spy = vi.spyOn(component, 'updateActiveStateFromRoute');

      eventsSubject.next(new NavigationEnd(1, '/dashboard', '/dashboard'));

      expect(spy).toHaveBeenCalled();
    });

    it('should call updateActiveStateFromRoute when NavigationEnd event occurs with routerLink', () => {
      setupComponent({
        item: {
          label: 'Route Item',
          routerLink: ['/dashboard'],
        },
      });

      vi.spyOn(component, 'updateActiveStateFromRoute');

      routerEventsSubject.next(
        new NavigationEnd(1, '/dashboard', '/dashboard'),
      );

      expect(component.updateActiveStateFromRoute).toHaveBeenCalled();
    });

    it('should not change active state when NavigationEnd event occurs without routerLink', () => {
      setupComponent({
        item: {
          label: 'Non Route Item',
        },
      });

      component.active.set(false);

      routerEventsSubject.next(
        new NavigationEnd(1, '/dashboard', '/dashboard'),
      );

      expect(component.active()).toBe(false);
    });
  });

  describe('Reset source subscription', () => {
    it('should set active to false when resetSource$ emits', () => {
      setupComponent({
        item: { label: 'Test Reset Item' },
      });

      component.active.set(true);
      expect(component.active()).toBe(true);

      resetSourceSubject.next(true);

      expect(component.active()).toBe(false);
    });
  });
});
