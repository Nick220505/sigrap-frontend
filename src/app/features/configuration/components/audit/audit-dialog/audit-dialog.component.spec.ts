import { DatePipe, JsonPipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AuditLogStore } from '../../../stores/audit-log.store';
import { AuditDialogComponent } from './audit-dialog.component';

describe('AuditDialogComponent', () => {
  let component: AuditDialogComponent;
  let fixture: ComponentFixture<AuditDialogComponent>;

  beforeEach(async () => {
    const mockStore = {
      dialogVisible: signal(false),
      selectedAuditLog: signal(null),
      openAuditLogDialog: jasmine.createSpy('openAuditLogDialog'),
      closeAuditLogDialog: jasmine.createSpy('closeAuditLogDialog'),
    };

    await TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        DialogModule,
        ButtonModule,
        DatePipe,
        JsonPipe,
        AuditDialogComponent,
      ],
      providers: [
        provideHttpClient(),
        MessageService,
        { provide: AuditLogStore, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditDialogComponent);
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
