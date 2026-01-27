import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DatePipe, JsonPipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AuditLogStore } from '../../../stores/audit-log-store';
import { AuditDialog } from './audit-dialog';

describe('AuditDialog', () => {
  let component: AuditDialog;
  let fixture: ComponentFixture<AuditDialog>;

  beforeEach(async () => {
    const mockStore = {
      dialogVisible: signal(false),
      selectedAuditLog: signal(null),
      openAuditLogDialog: vi.fn(),
      closeAuditLogDialog: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DialogModule, ButtonModule, DatePipe, JsonPipe, AuditDialog],
      providers: [
        providePrimeNG({
          theme: {
            preset: Aura,
            options: {
              darkModeSelector: '.app-dark',
              cssLayer: {
                name: 'primeng',
                order: 'theme, base, primeng',
              },
            },
          },
        }),
        provideHttpClient(),
        MessageService,
        { provide: AuditLogStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a reference to AuditLogStore', () => {
    expect(component.auditLogStore).toBeTruthy();
  });
});
