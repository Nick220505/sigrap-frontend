import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ScheduleInfo } from '../../../models/schedule.model';
import { ScheduleStore } from '../../../stores/schedule.store';
import { ScheduleTableComponent } from '../schedule-table/schedule-table.component';

@Component({
  selector: 'app-schedule-toolbar',
  imports: [ButtonModule, ToolbarModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nuevo horario"
          tooltipPosition="top"
          (onClick)="scheduleStore.openScheduleDialog()"
        />

        <p-button
          label="Eliminar"
          icon="pi pi-trash"
          severity="danger"
          outlined
          pTooltip="Eliminar horarios seleccionados"
          tooltipPosition="top"
          [disabled]="scheduleTable().selectedSchedules().length === 0"
          (onClick)="deleteSelectedSchedules()"
          class="mr-2"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="scheduleTable().dt().exportCSV()"
          [disabled]="scheduleStore.entities().length === 0"
          pTooltip="Exportar horarios a CSV"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class ScheduleToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly scheduleStore = inject(ScheduleStore);
  readonly scheduleTable = input.required<ScheduleTableComponent>();

  deleteSelectedSchedules(): void {
    const schedules = this.scheduleTable().selectedSchedules();
    this.confirmationService.confirm({
      header: 'Eliminar horarios',
      message: `
        ¿Está seguro de que desea eliminar los ${schedules.length} horarios seleccionados?
        <ul class='mt-2 mb-0'>
          ${schedules
            .map(
              ({ userName, day }: ScheduleInfo) =>
                `<li>• <b>${userName}</b> - ${this.getDayOfWeekLabel(day)}</li>`,
            )
            .join('')}
        </ul>
      `,
      accept: () => {
        const ids = schedules.map(({ id }: ScheduleInfo) => id);
        this.scheduleStore.deleteAllById(ids);
      },
    });
  }

  private getDayOfWeekLabel(day: string | undefined): string {
    if (!day) return 'No especificado';

    const days: Record<string, string> = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };
    return days[day] || day;
  }
}
