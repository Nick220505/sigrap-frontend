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
import { NotificationPreferenceInfo } from '../../../models/notification-preference.model';
import { NotificationPreferenceStore } from '../../../stores/notification-preference.store';

@Component({
  selector: 'app-notification-table',
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
        { field: 'notificationType', header: 'Tipo' },
        { field: 'channel', header: 'Canal' },
        { field: 'enabled', header: 'Estado' },
        { field: 'username', header: 'Usuario' },
        { field: 'createdAt', header: 'Fecha de Creación' },
        { field: 'updatedAt', header: 'Última Actualización' },
      ];

    <p-table
      #dt
      [value]="notificationPreferenceStore.entities()"
      [loading]="notificationPreferenceStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} preferencias"
      [globalFilterFields]="['notificationType', 'channel', 'username']"
      [tableStyle]="{ 'min-width': '70rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedPreferences"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Preferencias de Notificación</h5>
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

      <ng-template #body let-preference let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="preference" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'enabled') {
                <span
                  [class]="
                    preference.enabled
                      ? 'bg-green-100 text-green-900'
                      : 'bg-red-100 text-red-900'
                  "
                  class="px-2 py-1 rounded-full text-sm"
                >
                  {{ preference.enabled ? 'Activo' : 'Inactivo' }}
                </span>
              } @else if (
                column.field === 'createdAt' || column.field === 'updatedAt'
              ) {
                {{ preference[column.field] | date: 'medium' }}
              } @else {
                {{ preference[column.field] }}
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="
                notificationPreferenceStore.openPreferenceDialog(preference)
              "
              pTooltip="Editar preferencia"
              tooltipPosition="top"
              [disabled]="notificationPreferenceStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deletePreference(preference)"
              pTooltip="Eliminar preferencia"
              tooltipPosition="top"
              [disabled]="notificationPreferenceStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (notificationPreferenceStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar preferencias:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="notificationPreferenceStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="notificationPreferenceStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron preferencias de notificación.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class NotificationTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly notificationPreferenceStore = inject(NotificationPreferenceStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedPreferences = linkedSignal<
    NotificationPreferenceInfo[],
    NotificationPreferenceInfo[]
  >({
    source: this.notificationPreferenceStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(
        entities.map(({ id }: NotificationPreferenceInfo) => id),
      );
      return prevSelected.filter(({ id }: NotificationPreferenceInfo) =>
        entityIds.has(id),
      );
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deletePreference({ id, notificationType }: NotificationPreferenceInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar preferencia',
      message: `¿Está seguro de que desea eliminar la preferencia de notificación <b>${notificationType}</b>?`,
      accept: () => this.notificationPreferenceStore.delete(id),
    });
  }
}
