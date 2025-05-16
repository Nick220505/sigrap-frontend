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
import { UserInfo, UserRole } from '../../../models/user.model';
import { UserStore } from '../../../stores/user.store';

@Component({
  selector: 'app-user-table',
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
        { field: 'email', header: 'Email' },
        { field: 'phone', header: 'Teléfono' },
        { field: 'documentId', header: 'Número de Identificación' },
        { field: 'lastLogin', header: 'Último Acceso' },
        { field: 'role', header: 'Rol' },
      ];

    <p-table
      #dt
      [value]="userStore.entities()"
      [loading]="userStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} usuarios"
      [globalFilterFields]="['name', 'email', 'role', 'phone', 'documentId']"
      [tableStyle]="{ 'min-width': '85rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedUsers"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Administrar Usuarios</h5>
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

      <ng-template #body let-user let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="user" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @switch (column.field) {
                @case ('lastLogin') {
                  {{ user.lastLogin | date: 'dd/MM/yyyy hh:mm a' : 'UTC-5' }}
                }
                @case ('role') {
                  <span
                    class="px-2 py-1 bg-primary-100 text-primary-900 rounded-full text-sm"
                  >
                    {{ getRoleLabel(user.role) }}
                  </span>
                }
                @default {
                  {{ user[column.field] }}
                }
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="userStore.openUserDialog(user)"
              pTooltip="Editar usuario"
              tooltipPosition="top"
              [disabled]="userStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteUser(user)"
              pTooltip="Eliminar usuario"
              tooltipPosition="top"
              [disabled]="userStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (userStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar usuarios:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="userStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="userStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron usuarios.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class UserTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly userStore = inject(UserStore);
  readonly UserRole = UserRole;

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedUsers = linkedSignal<UserInfo[], UserInfo[]>({
    source: this.userStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: UserInfo) => id));
      return prevSelected.filter(({ id }: UserInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteUser({ id, name }: UserInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar usuario',
      message: `¿Está seguro de que desea eliminar el usuario <b>${name}</b>?`,
      accept: () => this.userStore.delete(id),
    });
  }

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.ADMINISTRATOR]: 'Administrador',
      [UserRole.EMPLOYEE]: 'Empleado',
    };
    return labels[role] || role;
  }
}
