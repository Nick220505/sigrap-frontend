import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ScheduleStore } from '../../../stores/schedule.store';
import { ScheduleTableComponent } from '../schedule-table/schedule-table.component';

@Component({
  selector: 'app-schedule-toolbar',
  imports: [ButtonModule],
  template: `
    <div class="flex flex-wrap gap-2 justify-between items-center">
      <div class="flex gap-2">
        <p-button
          icon="pi pi-plus"
          label="Nuevo Horario"
          styleClass="p-button-primary"
          (onClick)="scheduleStore.openScheduleDialog()"
        />
        <p-button
          icon="pi pi-trash"
          label="Eliminar Seleccionados"
          styleClass="p-button-danger"
          [disabled]="!scheduleTable().selectedSchedules().length"
          (onClick)="deleteSelectedSchedules()"
        />
      </div>
      <div class="flex gap-2">
        <p-button
          icon="pi pi-filter-slash"
          label="Limpiar Filtros"
          styleClass="p-button-outlined"
          (onClick)="scheduleTable().clearAllFilters()"
        />
      </div>
    </div>
  `,
})
export class ScheduleToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly scheduleStore = inject(ScheduleStore);
  readonly scheduleTable = input.required<ScheduleTableComponent>();

  deleteSelectedSchedules(): void {
    const schedules = this.scheduleTable().selectedSchedules();
    this.confirmationService.confirm({
      message: `
          ¿Está seguro que desea eliminar los ${schedules.length} horarios seleccionados?
          <ul class='mt-2 mb-0'>
            ${schedules
              .map(
                ({ employeeName, dayOfWeek, startTime, endTime }) =>
                  `<li>• <b>${employeeName}</b> - ${this.getDayOfWeekLabel(dayOfWeek)} (${startTime} - ${endTime})</li>`,
              )
              .join('')}
          </ul>
        `,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = schedules.map(({ id }) => id);
        this.scheduleStore.deleteAllById(ids);
      },
    });
  }

  private getDayOfWeekLabel(dayOfWeek: string): string {
    const days: Record<string, string> = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };
    return days[dayOfWeek] || dayOfWeek;
  }
}
