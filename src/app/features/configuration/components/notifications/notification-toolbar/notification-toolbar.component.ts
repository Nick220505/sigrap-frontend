import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { NotificationPreferenceStore } from '../../../stores/notification-preference.store';
import { NotificationTableComponent } from '../notification-table/notification-table.component';

@Component({
  selector: 'app-notification-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nueva"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nueva preferencia"
          tooltipPosition="top"
          (onClick)="notificationPreferenceStore.openPreferenceDialog()"
        />

        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar preferencias seleccionadas"
          tooltipPosition="top"
          (onClick)="deleteSelectedPreferences()"
          [disabled]="notificationTable().selectedPreferences().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar preferencias a CSV"
          tooltipPosition="top"
          (onClick)="notificationTable().dt().exportCSV()"
          [disabled]="notificationPreferenceStore.preferencesCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class NotificationToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly notificationPreferenceStore = inject(NotificationPreferenceStore);

  readonly notificationTable = input.required<NotificationTableComponent>();

  deleteSelectedPreferences(): void {
    const preferences = this.notificationTable().selectedPreferences();
    this.confirmationService.confirm({
      header: 'Eliminar preferencias',
      message: `
          ¿Está seguro de que desea eliminar las ${preferences.length} preferencias seleccionadas?
          <ul class='mt-2 mb-0'>
            ${preferences
              .map(
                ({ notificationType }) =>
                  `<li>• <b>${notificationType}</b></li>`,
              )
              .join('')}
          </ul>
        `,
      accept: () => {
        const ids = preferences.map(({ id }) => id);
        this.notificationPreferenceStore.deleteAllById(ids);
      },
    });
  }
}
