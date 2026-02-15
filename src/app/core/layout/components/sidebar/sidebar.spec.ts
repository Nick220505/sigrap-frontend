import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Menu } from './menu/menu';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;
  let originalMatchMedia: typeof window.matchMedia;

  const mockTranslateService = {
    instant: vi.fn((key: string) => key),
    get: vi.fn((key: string) => of(key)),
    use: vi.fn().mockReturnValue(of({})),
    getBrowserLang: vi.fn().mockReturnValue('en'),
    onLangChange: {
      subscribe: vi.fn()
    }
  };

  beforeEach(async () => {
    originalMatchMedia = window.matchMedia;

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

    await TestBed.configureTestingModule({
      imports: [Sidebar, Menu],
      providers: [
        provideRouter([]), 
        provideHttpClient(), 
        MessageService,
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Sidebar);
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
