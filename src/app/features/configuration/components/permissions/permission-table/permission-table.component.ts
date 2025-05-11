import { DatePipe } from '@angular/common';
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
import { PermissionInfo } from '../../../models/permission.model';
import { PermissionStore } from '../../../stores/permission.store';

@Component({
  selector: 'app-permission-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    MessageModule,
    FormsModule,
    DatePipe,
  ],
  template: `
    @let columns =
      [
        { field: 'name', header: 'Nombre' },
        { field: 'resource', header: 'Recurso' },
        { field: 'action', header: 'Acción' },
        { field: 'createdAt', header: 'Fecha de Creación' },
        { field: 'updatedAt', header: 'Última Actualización' },
      ];

    <p-table
      #dt
      [value]="permissionStore.entities()"
      [loading]="permissionStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} permisos"
      [globalFilterFields]="['name', 'resource', 'action']"
      [tableStyle]="{ 'min-width': '70rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedPermissions"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Administrar Permisos</h5>
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

      <ng-template #body let-permission let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="permission" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @if (
                column.field === 'createdAt' || column.field === 'updatedAt'
              ) {
                {{ permission[column.field] | date: 'medium' }}
              } @else {
                {{ permission[column.field] }}
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="permissionStore.openPermissionDialog(permission)"
              pTooltip="Editar permiso"
              tooltipPosition="top"
              [disabled]="permissionStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deletePermission(permission)"
              pTooltip="Eliminar permiso"
              tooltipPosition="top"
              [disabled]="permissionStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (permissionStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar permisos:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="permissionStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="permissionStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron permisos.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class PermissionTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly permissionStore = inject(PermissionStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedPermissions = linkedSignal<
    PermissionInfo[],
    PermissionInfo[]
  >({
    source: this.permissionStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: PermissionInfo) => id));
      return prevSelected.filter(({ id }: PermissionInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deletePermission({ id, name }: PermissionInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar permiso',
      message: `¿Está seguro de que desea eliminar el permiso <b>${name}</b>?`,
      accept: () => this.permissionStore.delete(id),
    });
  }
}
