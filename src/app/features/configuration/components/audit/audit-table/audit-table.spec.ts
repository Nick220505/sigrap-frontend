import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { DatePipe, NgClass } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { PrimeNG } from 'primeng/config';
import { AuditLogStore } from '../../../stores/audit-log-store';
import { AuditTable } from './audit-table';

const primengConfigStub: PrimeNG = new Proxy(
  {
    pt: () => ({}),
    csp: () => ({}),
    unstyled: () => false,
    theme: () => ({}),
    ptOptions: () => ({}),
    translationObserver: {
      subscribe: () => ({ unsubscribe: () => undefined }),
    },
  },
  {
    get(target, prop: string | symbol) {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      return () => ({});
    },
  },
) as unknown as PrimeNG;

describe('AuditTable', () => {
  let component: AuditTable;
  let fixture: ComponentFixture<AuditTable>;
  let mockStore: {
    entities: unknown;
    loading: unknown;
    error: unknown;
    pageSize: unknown;
    totalRecords: unknown;
    findAll: Mock;
  };

  beforeEach(async () => {
    mockStore = {
      entities: signal([]),
      loading: signal(false),
      error: signal(null),
      pageSize: signal(10),
      totalRecords: signal(0),
      findAll: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        DatePipe,
        PaginatorModule,
        NgClass,
        AuditTable,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        { provide: AuditLogStore, useValue: mockStore },
        { provide: PrimeNG, useValue: primengConfigStub },
      ],
    })
      .overrideComponent(AuditTable, {
        set: {
          template: `<div class="audit-table-root"></div>`,
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AuditTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a reference to the AuditLogStore', () => {
    expect(component.auditLogStore).toBeTruthy();
  });

  it('should handle page change', () => {
    const mockEvent: PaginatorState = {
      page: 1,
      first: 10,
      rows: 10,
      pageCount: 5,
    };

    component.onPageChange(mockEvent);
    expect(mockStore.findAll).toHaveBeenCalledWith({
      page: mockEvent.page,
      size: mockEvent.rows,
    });
  });
});
