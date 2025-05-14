import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SupplierInfo } from '@features/supplier/models/supplier.model';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-supplier-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    MessageModule,
    FormsModule,
    TagModule,
  ],
  template: `
    @let columns =
      [
        { field: 'name', header: 'Nombre' },
        { field: 'contactPerson', header: 'Contacto' },
        { field: 'email', header: 'Email' },
        { field: 'phone', header: 'Teléfono' },
        { field: 'status', header: 'Estado' },
      ];

    <p-table
      #dt
      [value]="supplierStore.entities()"
      [loading]="supplierStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} proveedores"
      [globalFilterFields]="[
        'name',
        'contactPerson',
        'email',
        'phone',
        'status',
      ]"
      [tableStyle]="{ 'min-width': '60rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedSuppliers"
    >
      <ng-template pTemplate="caption">
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Administrar Proveedores</h5>
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

      <ng-template pTemplate="header">
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

      <ng-template pTemplate="body" let-supplier let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="supplier" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'status') {
                <p-tag
                  [severity]="getStatusSeverity(supplier.status)"
                  [value]="getStatusLabel(supplier.status)"
                />
              } @else {
                {{ supplier[column.field] || '-' }}
              }
            </td>
          }

          <td>
            <div class="flex gap-2 justify-center">
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                rounded
                outlined
                (onClick)="supplierStore.openSupplierDialog(supplier)"
                pTooltip="Editar proveedor"
                tooltipPosition="top"
                [disabled]="supplierStore.loading()"
              />

              <p-button
                icon="pi pi-trash"
                severity="danger"
                rounded
                outlined
                (onClick)="deleteSupplier(supplier)"
                pTooltip="Eliminar proveedor"
                tooltipPosition="top"
                [disabled]="supplierStore.loading()"
              />
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (supplierStore.error()) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar proveedores:</strong>
                    <p>{{ supplierStore.error() }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="supplierStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="supplierStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron proveedores.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class SupplierTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly supplierStore = inject(SupplierStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedSuppliers = linkedSignal<SupplierInfo[], SupplierInfo[]>({
    source: this.supplierStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: SupplierInfo) => id));
      return prevSelected.filter(({ id }: SupplierInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteSupplier(supplier: SupplierInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar proveedor',
      message: `¿Está seguro de que desea eliminar el proveedor <b>${supplier.name}</b>?`,
      accept: () => this.supplierStore.delete(supplier.id),
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'PROBATION':
        return 'warning';
      case 'TERMINATED':
        return 'danger';
      case 'BLACKLISTED':
        return 'danger';
      default:
        return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'INACTIVE':
        return 'Inactivo';
      case 'PROBATION':
        return 'En Prueba';
      case 'TERMINATED':
        return 'Terminado';
      case 'BLACKLISTED':
        return 'Lista Negra';
      default:
        return status;
    }
  }
}
