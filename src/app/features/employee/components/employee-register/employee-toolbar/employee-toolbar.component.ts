import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { EmployeeInfo } from '../../../models/employee.model';
import { EmployeeStore } from '../../../stores/employee.store';
import { EmployeeTableComponent } from '../employee-table/employee-table.component';

@Component({
  selector: 'app-employee-toolbar',
  imports: [ButtonModule, ToolbarModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nuevo empleado"
          tooltipPosition="top"
          (onClick)="employeeStore.openEmployeeDialog()"
        />

        <p-button
          label="Eliminar"
          icon="pi pi-trash"
          severity="danger"
          outlined
          pTooltip="Eliminar empleados seleccionados"
          tooltipPosition="top"
          [disabled]="employeeTable().selectedEmployees().length === 0"
          (onClick)="deleteSelectedEmployees()"
          class="mr-2"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="employeeTable().dt().exportCSV()"
          [disabled]="employeeStore.entities().length === 0"
          pTooltip="Exportar empleados a CSV"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class EmployeeToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly employeeStore = inject(EmployeeStore);
  readonly employeeTable = input.required<EmployeeTableComponent>();

  deleteSelectedEmployees(): void {
    const employees = this.employeeTable().selectedEmployees();
    this.confirmationService.confirm({
      header: 'Eliminar empleados',
      message: `
        ¿Está seguro de que desea eliminar los ${employees.length} empleados seleccionados?
        <ul class='mt-2 mb-0'>
          ${employees
            .map(
              ({ firstName, lastName }: EmployeeInfo) =>
                `<li>• <b>${firstName} ${lastName}</b></li>`,
            )
            .join('')}
        </ul>
      `,
      accept: () => {
        const ids = employees.map(({ id }: EmployeeInfo) => id);
        this.employeeStore.deleteAllById(ids);
      },
    });
  }
}
