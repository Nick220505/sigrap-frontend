import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ActivityInfo } from '../../../models/activity-log.model';
import { ActivityLogStore } from '../../../stores/activity-log.store';
import { ActivityLogTableComponent } from '../activity-log-table/activity-log-table.component';

@Component({
  selector: 'app-activity-log-toolbar',
  imports: [ButtonModule, ToolbarModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nueva actividad"
          tooltipPosition="top"
          (onClick)="activityLogStore.openActivityLogDialog()"
        />

        <p-button
          label="Eliminar"
          icon="pi pi-trash"
          severity="danger"
          outlined
          pTooltip="Eliminar actividades seleccionadas"
          tooltipPosition="top"
          [disabled]="activityLogTable().selectedActivities().length === 0"
          (onClick)="deleteSelectedActivities()"
          class="mr-2"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="activityLogTable().dt().exportCSV()"
          [disabled]="activityLogStore.entities().length === 0"
          pTooltip="Exportar actividades a CSV"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class ActivityLogToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly activityLogStore = inject(ActivityLogStore);
  readonly activityLogTable = input.required<ActivityLogTableComponent>();

  deleteSelectedActivities(): void {
    const activities = this.activityLogTable().selectedActivities();
    this.confirmationService.confirm({
      header: 'Eliminar actividades',
      message: `
        ¿Está seguro de que desea eliminar las ${activities.length} actividades seleccionadas?
        <ul class='mt-2 mb-0'>
          ${activities
            .map(
              ({ employeeName, actionType }: ActivityInfo) =>
                `<li>• <b>${employeeName}</b> - ${this.getActionTypeLabel(actionType)}</li>`,
            )
            .join('')}
        </ul>
      `,
      accept: () => {
        const selectedIds = activities.map(({ id }: ActivityInfo) => id);
        this.activityLogStore.deleteAllById(selectedIds);
      },
    });
  }

  private getActionTypeLabel(type: string): string {
    switch (type) {
      case 'CREATE':
        return 'Creación';
      case 'UPDATE':
        return 'Actualización';
      case 'DELETE':
        return 'Eliminación';
      case 'LOGIN':
        return 'Inicio de sesión';
      case 'LOGOUT':
        return 'Cierre de sesión';
      case 'CLOCK_IN':
        return 'Registro de entrada';
      case 'CLOCK_OUT':
        return 'Registro de salida';
      case 'VIEW':
        return 'Visualización';
      case 'EXPORT':
        return 'Exportación';
      default:
        return 'Otro';
    }
  }
}
