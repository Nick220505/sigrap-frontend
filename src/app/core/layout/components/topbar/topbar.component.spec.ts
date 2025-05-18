import { CommonModule } from '@angular/common';
import {
  ElementRef,
  NO_ERRORS_SCHEMA,
  signal,
  WritableSignal,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { User } from '@core/auth/models/user.model';
import { AuthStore } from '@core/auth/stores/auth.store';
import {
  LayoutConfig,
  LayoutService,
} from '@core/layout/services/layout.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';
import { NEVER } from 'rxjs';
import { ConfiguratorComponent } from './floating-configurator/configurator/configurator.component';
import { TopbarComponent } from './topbar.component';

interface MockConfirmation {
  accept?: () => void;
  reject?: () => void;
}

class MockLayoutService {
  layoutConfig: WritableSignal<LayoutConfig> = signal({
    themeMode: 'light',
    primary: 'blue',
    surface: 'slate',
    preset: 'Aura',
    menuMode: 'static',
    darkTheme: false,
  });
  onMenuToggle = jasmine.createSpy('onMenuToggle');
  setThemeMode = jasmine.createSpy('setThemeMode').and.callFake((mode) => {
    this.layoutConfig.update((config) => ({ ...config, themeMode: mode }));
  });
}

class MockAuthStore {
  user: WritableSignal<User | null> = signal({
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'ADMINISTRATOR',
    lastLogin: new Date().toISOString(),
  });
  logout = jasmine.createSpy('logout');
}

class MockConfirmationService {
  requireConfirmation$ = NEVER;

  confirm = jasmine
    .createSpy('confirm')
    .and.callFake((confirmation: MockConfirmation) => {
      if (confirmation.accept) {
        confirmation.accept();
      }
    });
}

class MockElementRef implements ElementRef {
  nativeElement = {
    querySelector: jasmine.createSpy('querySelector').and.returnValue({
      contains: jasmine.createSpy('contains').and.returnValue(false),
    }),
  };
}

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
  let layoutService: MockLayoutService;
  let authStore: MockAuthStore;
  let confirmationService: MockConfirmationService;
  let elementRef: MockElementRef;
  let userMenuVisibleSetSpy: jasmine.Spy;

  beforeEach(async () => {
    layoutService = new MockLayoutService();
    authStore = new MockAuthStore();
    confirmationService = new MockConfirmationService();
    elementRef = new MockElementRef();

    await TestBed.configureTestingModule({
      imports: [
        TopbarComponent,
        RouterModule.forRoot([]),
        CommonModule,
        StyleClassModule,
        TooltipModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: LayoutService, useValue: layoutService },
        { provide: AuthStore, useValue: authStore },
        { provide: ConfirmationService, useValue: confirmationService },
        { provide: ElementRef, useValue: elementRef },
        MessageService,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(ConfiguratorComponent, {
        set: {
          template: '',
          imports: [],
        },
      })
      .overrideComponent(ConfirmDialog, {
        set: {
          selector: 'p-confirmDialog',
          template: '',
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    userMenuVisibleSetSpy = spyOn(
      component.userMenuVisible,
      'set',
    ).and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call layoutService.onMenuToggle when menu button is clicked', () => {
    const menuButton = fixture.debugElement.query(
      By.css('.layout-menu-button'),
    );
    menuButton.triggerEventHandler('click', null);
    expect(layoutService.onMenuToggle).toHaveBeenCalled();
  });

  it('should toggle theme mode on button click (light -> dark -> auto -> system -> light)', () => {
    const themeButton = fixture.debugElement.queryAll(By.css('button'))[1];

    expect(component.themeMode()).toBe('light');
    expect(component.getThemeTooltip()).toBe('Modo Claro');
    let themeIcon = fixture.debugElement.query(By.css('.pi-sun'));
    expect(themeIcon).toBeTruthy();

    themeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(layoutService.setThemeMode).toHaveBeenCalledWith('dark');
    expect(component.themeMode()).toBe('dark');
    expect(component.getThemeTooltip()).toBe('Modo Oscuro');
    themeIcon = fixture.debugElement.query(By.css('.pi-moon'));
    expect(themeIcon).toBeTruthy();

    themeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(layoutService.setThemeMode).toHaveBeenCalledWith('auto');
    expect(component.themeMode()).toBe('auto');
    expect(component.getThemeTooltip()).toBe('Automático (Basado en hora)');
    themeIcon = fixture.debugElement.query(By.css('.pi-sync'));
    expect(themeIcon).toBeTruthy();

    themeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(layoutService.setThemeMode).toHaveBeenCalledWith('system');
    expect(component.themeMode()).toBe('system');
    expect(component.getThemeTooltip()).toBe('Según preferencia del sistema');
    themeIcon = fixture.debugElement.query(By.css('.pi-desktop'));
    expect(themeIcon).toBeTruthy();

    themeButton.triggerEventHandler('click', null);
    fixture.detectChanges();
    expect(layoutService.setThemeMode).toHaveBeenCalledWith('light');
    expect(component.themeMode()).toBe('light');
    expect(component.getThemeTooltip()).toBe('Modo Claro');
    themeIcon = fixture.debugElement.query(By.css('.pi-sun'));
    expect(themeIcon).toBeTruthy();
  });

  it('should toggle user menu visibility on user button click', fakeAsync(() => {
    expect(component.userMenuVisible()).toBeFalse();
    const userButton = fixture.debugElement.query(
      By.css('button[pTooltip="Perfil"]'),
    );

    userButton.triggerEventHandler('click', new MouseEvent('click'));
    tick();
    fixture.detectChanges();
    expect(component.userMenuVisible()).toBeTrue();

    let userMenu = fixture.debugElement.query(By.css('.animate-scalein'));
    expect(userMenu).toBeTruthy();

    userButton.triggerEventHandler('click', new MouseEvent('click'));
    tick();
    fixture.detectChanges();
    expect(component.userMenuVisible()).toBeFalse();

    userMenu = fixture.debugElement.query(By.css('.animate-scalein'));
    expect(userMenu).toBeFalsy();
  }));

  it('should display user info when user menu is visible', fakeAsync(() => {
    component.userMenuVisible.set(true);
    tick();
    fixture.detectChanges();

    const userInfoDiv = fixture.debugElement.query(
      By.css('.absolute .border-b'),
    );
    expect(userInfoDiv).toBeTruthy();

    const userName = userInfoDiv.query(By.css('.font-medium'));
    const userEmail = userInfoDiv.query(By.css('div:nth-child(2)'));

    expect(userName.nativeElement.textContent.trim()).toBe('Test User');
    expect(userEmail.nativeElement.textContent.trim()).toBe('test@example.com');
  }));

  it('should call confirmLogout when logout button is clicked', fakeAsync(() => {
    spyOn(component, 'confirmLogout');
    component.userMenuVisible.set(true);
    tick();
    fixture.detectChanges();

    const logoutButtonIcon = fixture.debugElement.query(
      By.css('button .pi-sign-out'),
    );
    expect(logoutButtonIcon)
      .withContext('Logout button icon not found')
      .toBeTruthy();

    const logoutButton = logoutButtonIcon?.parent;

    if (logoutButton) {
      logoutButton.triggerEventHandler('click', null);
      tick();
      fixture.detectChanges();
      expect(component.confirmLogout).toHaveBeenCalled();
    } else {
      fail('Logout button parent element not found');
    }
  }));

  it('confirmLogout should call confirmationService.confirm and authStore.logout on accept', () => {
    component.confirmLogout();
    expect(confirmationService.confirm).toHaveBeenCalled();
    expect(authStore.logout).toHaveBeenCalled();
  });

  it('should close user menu when clicking outside', fakeAsync(() => {
    component.userMenuVisible.set(true);
    tick();
    fixture.detectChanges();
    expect(component.userMenuVisible()).toBeTrue();

    document.dispatchEvent(new MouseEvent('click'));
    tick();
    fixture.detectChanges();

    expect(component.userMenuVisible()).toBeFalse();
  }));

  it('should NOT close user menu when clicking inside', fakeAsync(() => {
    spyOn(component, 'onDocumentClick').and.stub();

    const userMenuContainerDiv = document.createElement('div');
    userMenuContainerDiv.id = 'userMenuContainer';
    elementRef.nativeElement.querySelector
      .withArgs('#userMenuContainer')
      .and.returnValue(userMenuContainerDiv);
    (userMenuContainerDiv as HTMLElement).contains = jasmine
      .createSpy('contains')
      .and.returnValue(true);

    component.userMenuVisible.set(true);
    userMenuVisibleSetSpy.calls.reset();
    tick();
    fixture.detectChanges();
    expect(component.userMenuVisible()).toBeTrue();

    document.dispatchEvent(new MouseEvent('click'));
    tick();
    fixture.detectChanges();

    expect(userMenuVisibleSetSpy).not.toHaveBeenCalledWith(false);
    expect(component.userMenuVisible()).toBeTrue();
  }));

  it('should contain the configurator component placeholder', () => {
    const configurator = fixture.debugElement.query(By.css('app-configurator'));
    expect(configurator).toBeTruthy();
  });

  it('should correctly set light theme when toggling from system mode', () => {
    layoutService.layoutConfig.update((config) => ({
      ...config,
      themeMode: 'system',
    }));
    fixture.detectChanges();

    component.toggleThemeMode();

    expect(layoutService.setThemeMode).toHaveBeenCalledWith('light');
  });
});
