import { beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { AuditLogStore } from '@features/configuration/stores/audit-log-store';
import { Audit } from './audit';

describe('Audit', () => {
  let component: Audit;
  let fixture: ComponentFixture<Audit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Audit, TranslateModule.forRoot()],
      providers: [provideHttpClient(), MessageService, AuditLogStore],
    })
      .overrideComponent(Audit, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(Audit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a reference to AuditLogStore', () => {
    expect(component.auditLogStore).toBeTruthy();
  });

  it('should define auditTable viewChild accessor', () => {
    expect(component.auditTable).toBeDefined();
  });
});
