import { Component, inject, input } from '@angular/core';
import { AttendanceTableComponent } from '@features/employee/components/employee-attendance/attendance-table/attendance-table.component';
import { AttendanceInfo } from '@features/employee/models/attendance.model';
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

        <p-button
          label="Eliminar"
          icon="pi pi-trash"
          severity="danger"
          outlined
          pTooltip="Eliminar registros seleccionados"
          tooltipPosition="top"
          [disabled]="attendanceTable().selectedAttendances().length === 0"
          (onClick)="deleteSelectedAttendances()"
          class="mr-2"
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

  deleteSelectedAttendances(): void {
    const attendances = this.attendanceTable().selectedAttendances();
    this.confirmationService.confirm({
      header: 'Eliminar registros',
      message: `
        ¿Está seguro de que desea eliminar los ${attendances.length} registros de asistencia seleccionados?
        <ul class='mt-2 mb-0'>
          ${attendances
            .map(
              ({ userName, date }: AttendanceInfo) =>
                `<li>• <b>${userName}</b> - ${date}</li>`,
            )
            .join('')}
        </ul>
      `,
      accept: () => {
        const ids = attendances.map(({ id }: AttendanceInfo) => id);
        this.attendanceStore.deleteAllById(ids);
      },
    });
  }
}
