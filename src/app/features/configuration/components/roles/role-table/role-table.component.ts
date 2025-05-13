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
import { RoleInfo } from '../../../models/role.model';
import { RoleStore } from '../../../stores/role.store';

const PERMISSION_TRANSLATIONS: Record<string, string> = {
  ROLE_CREATE: 'Crear roles',
  ROLE_READ: 'Ver roles',
  ROLE_UPDATE: 'Actualizar roles',
  ROLE_DELETE: 'Eliminar roles',

  USER_CREATE: 'Crear usuarios',
  USER_READ: 'Ver usuarios',
  USER_UPDATE: 'Actualizar usuarios',
  USER_DELETE: 'Eliminar usuarios',

  PRODUCT_CREATE: 'Crear productos',
  PRODUCT_READ: 'Ver productos',
  PRODUCT_UPDATE: 'Actualizar productos',
  PRODUCT_DELETE: 'Eliminar productos',

  CATEGORY_CREATE: 'Crear categorías',
  CATEGORY_READ: 'Ver categorías',
  CATEGORY_UPDATE: 'Actualizar categorías',
  CATEGORY_DELETE: 'Eliminar categorías',

  PERMISSION_READ: 'Ver permisos',
  PERMISSION_ASSIGN: 'Asignar permisos',

  AUDIT_READ: 'Ver auditoría',
};

@Component({
  selector: 'app-role-table',
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
        { field: 'description', header: 'Descripción' },
        { field: 'permissions', header: 'Permisos' },
        { field: 'createdAt', header: 'Fecha de Creación' },
        { field: 'updatedAt', header: 'Última Actualización' },
      ];

    <p-table
      #dt
      [value]="roleStore.entities()"
      [loading]="roleStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} roles"
      [globalFilterFields]="['name', 'description', 'permissions']"
      [tableStyle]="{ 'min-width': '70rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedRoles"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Administrar Roles</h5>
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

      <ng-template #body let-role let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="role" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'permissions') {
                <div class="flex flex-wrap gap-1">
                  @for (permission of role.permissions; track permission.id) {
                    <span
                      class="px-2 py-1 bg-primary-100 text-primary-900 rounded-full text-sm"
                    >
                      {{
                        PERMISSION_TRANSLATIONS[permission.name] ||
                          permission.name
                      }}
                    </span>
                  }
                </div>
              } @else if (
                column.field === 'createdAt' || column.field === 'updatedAt'
              ) {
                {{ role[column.field] | date: 'dd/MM/yyyy hh:mm a' : 'UTC-5' }}
              } @else {
                {{ role[column.field] }}
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="roleStore.openRoleDialog(role)"
              pTooltip="Editar rol"
              tooltipPosition="top"
              [disabled]="roleStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteRole(role)"
              pTooltip="Eliminar rol"
              tooltipPosition="top"
              [disabled]="roleStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (roleStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar roles:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="roleStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="roleStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron roles.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class RoleTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly roleStore = inject(RoleStore);
  readonly PERMISSION_TRANSLATIONS = PERMISSION_TRANSLATIONS;

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedRoles = linkedSignal<RoleInfo[], RoleInfo[]>({
    source: this.roleStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: RoleInfo) => id));
      return prevSelected.filter(({ id }: RoleInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteRole({ id, name }: RoleInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar rol',
      message: `¿Está seguro de que desea eliminar el rol <b>${name}</b>?`,
      accept: () => this.roleStore.delete(id),
    });
  }
}
