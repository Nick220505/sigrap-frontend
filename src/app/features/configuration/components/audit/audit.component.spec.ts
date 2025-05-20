import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { AuditLogStore } from '../../stores/audit-log.store';
import { AuditTableComponent } from './audit-table/audit-table.component';
import { AuditToolbarComponent } from './audit-toolbar/audit-toolbar.component';
import { AuditComponent } from './audit.component';

describe('AuditComponent', () => {
  let component: AuditComponent;
  let fixture: ComponentFixture<AuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditComponent, AuditTableComponent, AuditToolbarComponent],
      providers: [provideHttpClient(), MessageService, AuditLogStore],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a reference to AuditLogStore', () => {
    expect(component.auditLogStore).toBeTruthy();
  });

  it('should have a reference to AuditTableComponent', () => {
    expect(component.auditTable).toBeTruthy();
  });
});
