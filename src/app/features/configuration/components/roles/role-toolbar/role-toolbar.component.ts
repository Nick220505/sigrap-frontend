import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { RoleStore } from '../../../stores/role.store';
import { RoleTableComponent } from '../role-table/role-table.component';

@Component({
  selector: 'app-role-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nuevo rol"
          tooltipPosition="top"
          (onClick)="roleStore.openRoleDialog()"
        />

        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar roles seleccionados"
          tooltipPosition="top"
          (onClick)="deleteSelectedRoles()"
          [disabled]="roleTable().selectedRoles().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar roles a CSV"
          tooltipPosition="top"
          (onClick)="roleTable().dt().exportCSV()"
          [disabled]="roleStore.rolesCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class RoleToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly roleStore = inject(RoleStore);

  readonly roleTable = input.required<RoleTableComponent>();

  deleteSelectedRoles(): void {
    const roles = this.roleTable().selectedRoles();
    this.confirmationService.confirm({
      header: 'Eliminar roles',
      message: `
          ¿Está seguro de que desea eliminar los ${roles.length} roles seleccionados?
          <ul class='mt-2 mb-0'>
            ${roles.map(({ name }) => `<li>• <b>${name}</b></li>`).join('')}
          </ul>
        `,
      accept: () => {
        const ids = roles.map(({ id }) => id);
        this.roleStore.deleteAllById(ids);
      },
    });
  }
}
