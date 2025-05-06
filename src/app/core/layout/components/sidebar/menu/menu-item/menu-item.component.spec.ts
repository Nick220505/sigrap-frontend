import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NavigationEnd, Router, provideRouter } from '@angular/router';
import { LayoutService } from '@core/layout/services/layout.service';
import { MenuItem } from 'primeng/api';
import { Subject, of } from 'rxjs';
import { MenuItemComponent } from './menu-item.component';

describe('MenuItemComponent', () => {
  let component: MenuItemComponent;
  let fixture: ComponentFixture<MenuItemComponent>;
  let layoutService: jasmine.SpyObj<LayoutService>;
  let router: jasmine.SpyObj<Router>;

  const menuSourceSubject = new Subject<{
    key: string;
    routeEvent?: boolean;
  }>();
  const resetSourceSubject = new Subject<boolean>();

  beforeEach(async () => {
    layoutService = jasmine.createSpyObj(
      'LayoutService',
      ['onMenuStateChange'],
      {
        menuSource$: menuSourceSubject.asObservable(),
        resetSource$: resetSourceSubject.asObservable(),
      },
    );

    router = jasmine.createSpyObj('Router', ['isActive'], {
      events: of(new NavigationEnd(1, '/', '/')),
    });
    router.isActive.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [MenuItemComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: LayoutService, useValue: layoutService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  function setupComponent(inputs: {
    item?: MenuItem;
    index?: number;
    parentKey?: string;
    root?: boolean;
  }): void {
    fixture = TestBed.createComponent(MenuItemComponent);
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
      spyOn(MenuItemComponent.prototype, 'updateActiveStateFromRoute');

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

      expect(component.active()).toBeFalse();

      const linkEl = fixture.debugElement.query(By.css('a'));
      linkEl.triggerEventHandler('click', new MouseEvent('click'));

      expect(component.active()).toBeTrue();
      expect(layoutService.onMenuStateChange).toHaveBeenCalledWith({
        key: component.key(),
      });

      linkEl.triggerEventHandler('click', new MouseEvent('click'));
      expect(component.active()).toBeFalse();
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

      const mockEvent = jasmine.createSpyObj('Event', ['preventDefault']);
      component.itemClick(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(layoutService.onMenuStateChange).not.toHaveBeenCalled();
    });

    it('should execute command when defined', () => {
      const commandSpy = jasmine.createSpy('command');
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
      router.isActive.and.returnValue(true);

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

      expect(component.active()).toBeFalse();

      component.active.set(true);

      expect(component.active()).toBeTrue();
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

      expect(component.active()).toBeFalse();

      const event = new MouseEvent('click');
      component.itemClick(event);

      expect(component.active()).toBeTrue();
    });
  });

  describe('Route handling', () => {
    it('should update active state from route when route is active', () => {
      router.isActive.and.returnValue(true);

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
      router.isActive.and.returnValue(false);

      setupComponent({
        item: {
          label: 'Dashboard',
          routerLink: ['/dashboard'],
        },
        index: 0,
        parentKey: '',
      });

      layoutService.onMenuStateChange.calls.reset();

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
      expect(component.activeClass).toBeTrue();
    });

    it('should not add active-menuitem class when not active', () => {
      setupComponent({ root: false });
      component.active.set(false);
      fixture.detectChanges();
      expect(component.activeClass).toBeFalse();
    });

    it('should not add active-menuitem class when root even if active', () => {
      setupComponent({ root: true });
      component.active.set(true);
      fixture.detectChanges();
      expect(component.activeClass).toBeFalse();
    });

    it('should add layout-root-menuitem class when root', () => {
      setupComponent({ root: true });
      fixture.detectChanges();
      expect(component.isRootItem).toBeTrue();
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe from subscriptions on destroy', () => {
      setupComponent({});
      const menuSourceSpy = spyOn(
        component['menuSourceSubscription'],
        'unsubscribe',
      );
      const menuResetSpy = spyOn(
        component['menuResetSubscription'],
        'unsubscribe',
      );

      component.ngOnDestroy();

      expect(menuSourceSpy).toHaveBeenCalled();
      expect(menuResetSpy).toHaveBeenCalled();
    });
  });
});
