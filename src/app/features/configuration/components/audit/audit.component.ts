import { Component, inject, viewChild } from '@angular/core';
import { AuditLogStore } from '../../stores/audit-log.store';
import { AuditTableComponent } from './audit-table/audit-table.component';
import { AuditToolbarComponent } from './audit-toolbar/audit-toolbar.component';

@Component({
  selector: 'app-audit',
  imports: [AuditToolbarComponent, AuditTableComponent],
  template: `
    <app-audit-toolbar [auditTable]="auditTable" />

    <app-audit-table #auditTable />
  `,
})
export class AuditComponent {
  readonly auditLogStore = inject(AuditLogStore);
  readonly auditTable = viewChild.required(AuditTableComponent);
}
