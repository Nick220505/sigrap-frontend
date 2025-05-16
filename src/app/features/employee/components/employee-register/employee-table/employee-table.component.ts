import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { EmployeeInfo } from '../../../models/employee.model';
import { EmployeeStore } from '../../../stores/employee.store';

@Component({
  selector: 'app-employee-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    MessageModule,
  ],
  template: `
    @let columns =
      [
        { field: 'firstName', header: 'Nombre' },
        { field: 'lastName', header: 'Apellido' },
        { field: 'documentId', header: 'Documento' },
        { field: 'email', header: 'Email' },
        { field: 'phoneNumber', header: 'Teléfono' },
        { field: 'status', header: 'Estado' },
      ];

    <p-table
      #dt
      [value]="employeeStore.entities()"
      [loading]="employeeStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} empleados"
      [globalFilterFields]="['firstName', 'lastName', 'documentId', 'email']"
      [tableStyle]="{ 'min-width': '75rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedEmployees"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Administrar Empleados</h5>
          </div>

          <div class="flex items-center w-full sm:w-auto">
            <p-iconfield class="w-full">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input
                pInputText
                type="text"
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                [(ngModel)]="searchValue"
                placeholder="Buscar..."
                class="w-full"
              />
            </p-iconfield>
          </div>
        </div>
      </ng-template>

      <ng-template #header>
        <tr>
          <th style="width: 3rem">
            <p-tableHeaderCheckbox />
          </th>

          @for (column of columns; track column.field) {
            <th pSortableColumn="{{ column.field }}">
              <div class="flex items-center gap-2">
                <span>{{ column.header }}</span>
                <p-sortIcon field="{{ column.field }}" />
                <p-columnFilter
                  type="text"
                  field="{{ column.field }}"
                  display="menu"
                  class="ml-auto"
                  placeholder="Filtrar por {{ column.header.toLowerCase() }}"
                  pTooltip="Filtrar por {{ column.header.toLowerCase() }}"
                  tooltipPosition="top"
                />
              </div>
            </th>
          }

          <th>
            <div class="flex items-center gap-2">
              <span>Acciones</span>
              <button
                type="button"
                pButton
                icon="pi pi-filter-slash"
                class="p-button-rounded p-button-text p-button-secondary"
                pTooltip="Limpiar todos los filtros"
                tooltipPosition="top"
                (click)="clearAllFilters()"
                aria-label="Limpiar todos los filtros"
              ></button>
            </div>
          </th>
        </tr>
      </ng-template>

      <ng-template #body let-employee let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="employee" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'status') {
                <span [class]="getStatusClass(employee.status)">
                  {{ getStatusLabel(employee.status) }}
                </span>
              } @else if (column.field === 'phoneNumber') {
                {{ employee[column.field] || 'No especificado' }}
              } @else {
                {{ employee[column.field] }}
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="employeeStore.openEmployeeDialog(employee)"
              pTooltip="Editar empleado"
              tooltipPosition="top"
              [disabled]="employeeStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteEmployee(employee)"
              pTooltip="Eliminar empleado"
              tooltipPosition="top"
              [disabled]="employeeStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (employeeStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar empleados:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="employeeStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="employeeStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron empleados.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class EmployeeTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly employeeStore = inject(EmployeeStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedEmployees = linkedSignal<EmployeeInfo[], EmployeeInfo[]>({
    source: this.employeeStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: EmployeeInfo) => id));
      return prevSelected.filter(({ id }: EmployeeInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteEmployee({ id, firstName, lastName }: EmployeeInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar empleado',
      message: `¿Está seguro de que desea eliminar al empleado <b>${firstName} ${lastName}</b>?`,
      accept: () => this.employeeStore.delete(id),
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
