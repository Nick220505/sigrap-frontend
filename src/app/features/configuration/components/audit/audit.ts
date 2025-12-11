import { Component, inject, viewChild } from '@angular/core';
import { AuditLogStore } from '../../stores/audit-log-store';
import { AuditTable } from './audit-table/audit-table';
import { AuditToolbar } from './audit-toolbar/audit-toolbar';

@Component({
  selector: 'app-audit',
  imports: [AuditToolbar, AuditTable],
  template: `
    <app-audit-toolbar [auditTable]="auditTable" />

    <app-audit-table #auditTable />
  `,
})
export class Audit {
  readonly auditLogStore = inject(AuditLogStore);
  readonly auditTable = viewChild.required(AuditTable);
}
