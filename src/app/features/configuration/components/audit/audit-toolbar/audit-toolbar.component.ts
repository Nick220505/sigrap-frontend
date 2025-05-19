import { Component, inject, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { AuditLogStore } from '../../../stores/audit-log.store';
import { AuditTableComponent } from '../audit-table/audit-table.component';

@Component({
  selector: 'app-audit-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Actualizar"
          icon="pi pi-refresh"
          outlined
          class="mr-2"
          pTooltip="Actualizar registros"
          tooltipPosition="top"
          (onClick)="auditLogStore.findAll()"
          [loading]="auditLogStore.loading()"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar PDF"
          icon="pi pi-file-pdf"
          styleClass="p-button-help mr-2"
          [loading]="auditTable().isExporting()"
          [disabled]="auditLogStore.entities().length === 0"
          pTooltip="Exportar registros en PDF"
          tooltipPosition="top"
          (onClick)="auditTable().exportToPDF()"
        />
        <p-button
          label="Exportar CSV"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar registros a CSV"
          tooltipPosition="top"
          (onClick)="auditTable().dt().exportCSV()"
          [disabled]="auditLogStore.auditLogsCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class AuditToolbarComponent {
  readonly auditLogStore = inject(AuditLogStore);
  readonly auditTable = input.required<AuditTableComponent>();
}
