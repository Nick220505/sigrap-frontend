import { Component, inject, input } from '@angular/core';
import { AttendanceTableComponent } from '@features/employee/components/employee-attendance/attendance-table/attendance-table.component';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-attendance-toolbar',
  imports: [ButtonModule, ToolbarModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button
          label="Registrar Entrada"
          icon="pi pi-clock"
          outlined
          class="mr-2"
          pTooltip="Registrar entrada de empleado"
          tooltipPosition="top"
          (onClick)="attendanceStore.openClockInDialog()"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="attendanceTable().dt().exportCSV()"
          [disabled]="attendanceStore.entities().length === 0"
          pTooltip="Exportar registros a CSV"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class AttendanceToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly attendanceStore = inject(AttendanceStore);
  readonly attendanceTable = input.required<AttendanceTableComponent>();
}
