import { Component, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { AuditLogStore } from '@features/configuration/stores/audit-log-store';
import { AuditTable } from '../audit-table/audit-table';

@Component({
  selector: 'app-audit-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Refresh"
          icon="pi pi-refresh"
          outlined
          class="mr-2"
          pTooltip="Refresh records"
          tooltipPosition="top"
          (onClick)="auditLogStore.findAll({})"
          [loading]="auditLogStore.loading()"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Export PDF"
          icon="pi pi-file-pdf"
          styleClass="p-button-help mr-2"
          [loading]="auditTable().isExporting()"
          [disabled]="auditLogStore.entities().length === 0"
          pTooltip="Export records to PDF"
          tooltipPosition="top"
          (onClick)="auditTable().exportToPDF()"
        />
        <p-button
          label="Export CSV"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Export records to CSV"
          tooltipPosition="top"
          (onClick)="auditTable().exportToCSV()"
          [disabled]="auditLogStore.auditLogsCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class AuditToolbar {
  readonly auditLogStore = inject(AuditLogStore);
  readonly auditTable = input.required<AuditTable>();
}
