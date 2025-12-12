import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AuthStore } from '@core/auth/stores/auth-store';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserRole } from '../../../../../features/configuration/models/user';
import { MenuItem } from './menu-item/menu-item';
import { Menu } from './menu';

describe('Menu', () => {
  let component: Menu;
  let fixture: ComponentFixture<Menu>;
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
    originalMatchMedia = window.matchMedia;

    try {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockReturnValue({
          matches: false,
          media: '',
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }),
      });
    } catch (e) {
      const error = e as Error;
      if (!error.message?.includes('already been spied upon')) {
        throw error;
      }
    }

    await TestBed.configureTestingModule({
      imports: [Menu, NoopAnimationsModule, MenuItem],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        ConfirmationService,
        MessageService,
        { provide: AuthStore, useValue: mockAuthStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Menu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

