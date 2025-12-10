import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MenuComponent } from './menu/menu.component';

import { SidebarComponent } from './sidebar.component';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let originalMatchMedia: typeof window.matchMedia;

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
            imports: [SidebarComponent, NoopAnimationsModule, MenuComponent],
            providers: [provideRouter([]), provideHttpClient(), MessageService],
        }).compileComponents();

        fixture = TestBed.createComponent(SidebarComponent);
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
