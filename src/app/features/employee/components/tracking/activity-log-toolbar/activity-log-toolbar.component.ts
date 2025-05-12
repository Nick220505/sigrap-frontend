import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ActivityLogStore } from '../../../stores/activity-log.store';
import { ActivityLogTableComponent } from '../activity-log-table/activity-log-table.component';

@Component({
  selector: 'app-activity-log-toolbar',
  imports: [ButtonModule],
  template: `
    <div class="flex flex-wrap gap-2 justify-between items-center">
      <div class="flex gap-2">
        <p-button
          icon="pi pi-plus"
          label="Nueva Actividad"
          styleClass="p-button-primary"
          (onClick)="activityLogStore.openActivityLogDialog()"
        ></p-button>
        <p-button
          icon="pi pi-trash"
          label="Eliminar Seleccionados"
          styleClass="p-button-danger"
          [disabled]="!activityLogTable().selectedActivities().length"
          (onClick)="deleteSelectedActivities()"
        ></p-button>
      </div>
      <div class="flex gap-2">
        <p-button
          icon="pi pi-filter-slash"
          label="Limpiar Filtros"
          styleClass="p-button-outlined"
          (onClick)="activityLogTable().clearAllFilters()"
        ></p-button>
      </div>
    </div>
  `,
})
export class ActivityLogToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly activityLogStore = inject(ActivityLogStore);
  readonly activityLogTable = input.required<ActivityLogTableComponent>();

  deleteSelectedActivities(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea eliminar las actividades seleccionadas?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const selectedIds = this.activityLogTable()
          .selectedActivities()
          .map(({ id }) => id);
        this.activityLogStore.deleteAllById(selectedIds);
      },
    });
  }
}
