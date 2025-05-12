import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { EmployeeInfo } from '../../../models/employee.model';
import { EmployeeStore } from '../../../stores/employee.store';

@Component({
  selector: 'app-employee-table',
  imports: [TableModule, ButtonModule, InputTextModule, FormsModule],
  template: `
    <div class="card">
      <p-table
        #dt
        [value]="employeeStore.entities()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="[
          'firstName',
          'lastName',
          'documentId',
          'email',
          'position',
          'department',
        ]"
        [tableStyle]="{ 'min-width': '75rem' }"
        [rowHover]="true"
        dataKey="id"
        [rowsPerPageOptions]="[10, 25, 50]"
        [selection]="selectedEmployees()"
        (selectionChange)="selectedEmployees.set($event)"
        [loading]="employeeStore.loading()"
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="caption">
          <div class="flex items-center justify-between">
            <h5 class="m-0">Gestión de Empleados</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [ngModel]="searchValue()"
                (ngModelChange)="searchValue.set($event)"
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                placeholder="Buscar empleado..."
              />
            </span>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th style="width: 4rem">
              <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
            </th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Documento</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Cargo</th>
            <th>Departamento</th>
            <th>Estado</th>
            <th style="width: 8rem"></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-employee>
          <tr>
            <td>
              <p-tableCheckbox [value]="employee"></p-tableCheckbox>
            </td>
            <td>{{ employee.firstName }}</td>
            <td>{{ employee.lastName }}</td>
            <td>{{ employee.documentId }}</td>
            <td>{{ employee.email }}</td>
            <td>{{ employee.phoneNumber }}</td>
            <td>{{ employee.position }}</td>
            <td>{{ employee.department }}</td>
            <td>
              <span [class]="getStatusClass(employee.status)">
                {{ getStatusLabel(employee.status) }}
              </span>
            </td>
            <td>
              <div class="flex gap-2 justify-center">
                <p-button
                  icon="pi pi-pencil"
                  styleClass="p-button-rounded p-button-text"
                  (onClick)="employeeStore.openEmployeeDialog(employee)"
                />
                <p-button
                  icon="pi pi-trash"
                  styleClass="p-button-rounded p-button-text p-button-danger"
                  (onClick)="deleteEmployee(employee)"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class EmployeeTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly employeeStore = inject(EmployeeStore);

  readonly searchValue = signal('');
  readonly selectedEmployees = signal<EmployeeInfo[]>([]);

  clearAllFilters(): void {
    this.searchValue.set('');
  }

  deleteEmployee({ id, firstName, lastName }: EmployeeInfo): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar al empleado ${firstName} ${lastName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.employeeStore.delete(id);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm';
      case 'INACTIVE':
        return 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm';
      case 'TERMINATED':
        return 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm';
      case 'PROBATION':
        return 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      case 'TERMINATED':
        return 'Terminado';
      case 'PROBATION':
        return 'Prueba';
      default:
        return status;
    }
  }
}
