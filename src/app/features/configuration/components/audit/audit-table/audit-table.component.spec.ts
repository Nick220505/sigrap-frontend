import { DatePipe, NgClass } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { AuditLogStore } from '../../../stores/audit-log.store';
import { AuditTableComponent } from './audit-table.component';

describe('AuditTableComponent', () => {
  let component: AuditTableComponent;
  let fixture: ComponentFixture<AuditTableComponent>;
  let mockStore: {
    entities: any;
    loading: any;
    error: any;
    pageSize: any;
    totalRecords: any;
    findAll: jasmine.Spy;
  };

  beforeEach(async () => {
    mockStore = {
      entities: signal([]),
      loading: signal(false),
      error: signal(null),
      pageSize: signal(10),
      totalRecords: signal(0),
      findAll: jasmine.createSpy('findAll'),
    };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        TooltipModule,
        CalendarModule,
        ToastModule,
        DatePipe,
        PaginatorModule,
        InputIconModule,
        MessageModule,
        IconFieldModule,
        NgClass,
        AuditTableComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        { provide: AuditLogStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditTableComponent);
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
