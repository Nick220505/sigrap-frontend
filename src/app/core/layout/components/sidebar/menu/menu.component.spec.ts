import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@core/auth/stores/auth.store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserRole } from '../../../../../features/configuration/models/user.model';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { MenuComponent } from './menu.component';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let originalMatchMedia: typeof window.matchMedia;

  const mockAuthStore = {
    user: signal({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: UserRole.ADMINISTRATOR,
    }),
  };

  beforeEach(async () => {
    // Store original matchMedia
    originalMatchMedia = window.matchMedia;

    // Mock matchMedia
    try {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jasmine.createSpy('matchMedia').and.returnValue({
          matches: false,
          media: '',
          onchange: null,
          addListener: jasmine.createSpy('addListener'),
          removeListener: jasmine.createSpy('removeListener'),
          addEventListener: jasmine.createSpy('addEventListener'),
          removeEventListener: jasmine.createSpy('removeEventListener'),
          dispatchEvent: jasmine.createSpy('dispatchEvent'),
        }),
      });
    } catch (e) {
      // If already spied upon, ignore the error
      const error = e as Error;
      if (!error.message?.includes('already been spied upon')) {
        throw error;
      }
    }

    await TestBed.configureTestingModule({
      imports: [MenuComponent, NoopAnimationsModule, MenuItemComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        ConfirmationService,
        MessageService,
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    // Restore original matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
