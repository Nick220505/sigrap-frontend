import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { PermissionStore } from '../../../stores/permission.store';
import { PermissionTableComponent } from '../permission-table/permission-table.component';

@Component({
  selector: 'app-permission-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nuevo permiso"
          tooltipPosition="top"
          (onClick)="permissionStore.openPermissionDialog()"
        />

        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar permisos seleccionados"
          tooltipPosition="top"
          (onClick)="deleteSelectedPermissions()"
          [disabled]="permissionTable().selectedPermissions().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar permisos a CSV"
          tooltipPosition="top"
          (onClick)="permissionTable().dt().exportCSV()"
          [disabled]="permissionStore.permissionsCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class PermissionToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly permissionStore = inject(PermissionStore);

  readonly permissionTable = input.required<PermissionTableComponent>();

  deleteSelectedPermissions(): void {
    const permissions = this.permissionTable().selectedPermissions();
    this.confirmationService.confirm({
      header: 'Eliminar permisos',
      message: `
          ¿Está seguro de que desea eliminar los ${permissions.length} permisos seleccionados?
          <ul class='mt-2 mb-0'>
            ${permissions.map(({ name }) => `<li>• <b>${name}</b></li>`).join('')}
          </ul>
        `,
      accept: () => {
        const ids = permissions.map(({ id }) => id);
        this.permissionStore.deleteAllById(ids);
      },
    });
  }
}
