import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { AttendanceStore } from '../../../stores/attendance.store';
import { AttendanceTableComponent } from '../attendance-table/attendance-table.component';

@Component({
  selector: 'app-attendance-toolbar',
  imports: [ButtonModule],
  template: `
    <div class="flex flex-wrap gap-2 justify-between items-center">
      <div class="flex gap-2">
        <p-button
          icon="pi pi-clock"
          label="Registrar Entrada"
          styleClass="p-button-primary"
          (onClick)="attendanceStore.openClockInDialog()"
        />
        <p-button
          icon="pi pi-trash"
          label="Eliminar Seleccionados"
          styleClass="p-button-danger"
          [disabled]="!attendanceTable().selectedAttendances().length"
          (onClick)="deleteSelectedAttendances()"
        />
      </div>
      <div class="flex gap-2">
        <p-button
          icon="pi pi-filter-slash"
          label="Limpiar Filtros"
          styleClass="p-button-outlined"
          (onClick)="attendanceTable().clearAllFilters()"
        />
      </div>
    </div>
  `,
})
export class AttendanceToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly attendanceStore = inject(AttendanceStore);
  readonly attendanceTable = input.required<AttendanceTableComponent>();

  deleteSelectedAttendances(): void {
    const attendances = this.attendanceTable().selectedAttendances();
    this.confirmationService.confirm({
      message: `
          ¿Está seguro que desea eliminar los ${attendances.length} registros de asistencia seleccionados?
          <ul class='mt-2 mb-0'>
            ${attendances
              .map(
                ({ employeeName, date }) =>
                  `<li>• <b>${employeeName}</b> - ${date}</li>`,
              )
              .join('')}
          </ul>
        `,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = attendances.map(({ id }) => id);
        this.attendanceStore.deleteAllById(ids);
      },
    });
  }
}
