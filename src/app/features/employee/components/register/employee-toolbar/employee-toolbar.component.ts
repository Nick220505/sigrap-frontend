import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { EmployeeStore } from '../../../stores/employee.store';
import { EmployeeTableComponent } from '../employee-table/employee-table.component';

@Component({
  selector: 'app-employee-toolbar',
  imports: [ButtonModule],
  template: `
    <div class="flex flex-wrap gap-2 justify-between items-center">
      <div class="flex gap-2">
        <p-button
          icon="pi pi-plus"
          label="Nuevo Empleado"
          styleClass="p-button-primary"
          (onClick)="employeeStore.openEmployeeDialog()"
        />
        <p-button
          icon="pi pi-trash"
          label="Eliminar Seleccionados"
          styleClass="p-button-danger"
          [disabled]="!employeeTable().selectedEmployees().length"
          (onClick)="deleteSelectedEmployees()"
        />
      </div>
      <div class="flex gap-2">
        <p-button
          icon="pi pi-filter-slash"
          label="Limpiar Filtros"
          styleClass="p-button-outlined"
          (onClick)="employeeTable().clearAllFilters()"
        />
      </div>
    </div>
  `,
})
export class EmployeeToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly employeeStore = inject(EmployeeStore);
  readonly employeeTable = input.required<EmployeeTableComponent>();

  deleteSelectedEmployees(): void {
    const employees = this.employeeTable().selectedEmployees();
    this.confirmationService.confirm({
      message: `
          ¿Está seguro que desea eliminar los ${employees.length} empleados seleccionados?
          <ul class='mt-2 mb-0'>
            ${employees
              .map(
                ({ firstName, lastName }) =>
                  `<li>• <b>${firstName} ${lastName}</b></li>`,
              )
              .join('')}
          </ul>
        `,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = employees.map(({ id }) => id);
        this.employeeStore.deleteAllById(ids);
      },
    });
  }
}
