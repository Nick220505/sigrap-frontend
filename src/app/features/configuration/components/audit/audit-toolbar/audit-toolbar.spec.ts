import { beforeEach, describe, expect, it, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { AuditLogStore } from '@features/configuration/stores/audit-log-store';
import { AuditTable } from '../audit-table/audit-table';
import { AuditToolbar } from './audit-toolbar';

@Component({
  selector: 'app-test-host',
  template: `<app-audit-toolbar [auditTable]="mockTableComponent" />`,
  imports: [
    TranslateModule,
    AuditToolbar
  ],
  standalone: true,
})
class TestHost {
  mockTableComponent = {
    isExporting: signal(false),
    exportToPDF: vi.fn(),
    exportToCSV: vi.fn(),
  } as unknown as AuditTable;
}

describe('AuditToolbar', () => {
  let hostFixture: ComponentFixture<TestHost>;

  beforeEach(async () => {
    const mockStore = {
      entities: signal([]),
      loading: signal(false),
      error: signal(null),
      findAll: vi.fn(),
      auditLogsCount: signal(0),
    };

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        ButtonModule,
        ToolbarModule,
        TooltipModule,
        TestHost,
        AuditToolbar,
      ],
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

    hostFixture = TestBed.createComponent(TestHost);
    hostFixture.detectChanges();
  });

  it('should create', () => {
    const toolbarComponent = hostFixture.debugElement.query(
      By.directive(AuditToolbar),
    );
    expect(toolbarComponent).toBeTruthy();
  });

  it('should render toolbar with buttons', () => {
    const toolbar = hostFixture.debugElement.query(By.css('p-toolbar'));
    expect(toolbar).toBeTruthy();
  });
});
