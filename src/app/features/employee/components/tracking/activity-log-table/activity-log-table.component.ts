import { DatePipe } from '@angular/common';
import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivityInfo } from '@features/employee/models/activity-log.model';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ActivityLogStore } from '../../../stores/activity-log.store';

@Component({
  selector: 'app-activity-log-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DatePipe,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    MessageModule,
  ],
  template: `
    @let columns =
      [
        { field: 'employeeName', header: 'Empleado' },
        { field: 'actionType', header: 'Tipo de Actividad' },
        { field: 'description', header: 'Descripción' },
        { field: 'timestamp', header: 'Fecha y Hora' },
      ];

    <p-table
      #dt
      [value]="activityLogStore.entities()"
      [loading]="activityLogStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} actividades"
      [globalFilterFields]="[
        'employeeName',
        'actionType',
        'description',
        'timestamp',
      ]"
      [tableStyle]="{ 'min-width': '75rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedActivities"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Registro de Actividades</h5>
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

      <ng-template #body let-activity let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="activity" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'actionType') {
                <span [class]="getActionTypeClass(activity.actionType)">
                  {{ getActionTypeLabel(activity.actionType) }}
                </span>
              } @else if (column.field === 'timestamp') {
                {{ activity.timestamp | date: 'dd/MM/yyyy HH:mm' }}
              } @else {
                {{ activity[column.field] }}
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="activityLogStore.openActivityLogDialog(activity)"
              pTooltip="Editar actividad"
              tooltipPosition="top"
              [disabled]="activityLogStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteActivity(activity)"
              pTooltip="Eliminar actividad"
              tooltipPosition="top"
              [disabled]="activityLogStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (activityLogStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar actividades:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="activityLogStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="activityLogStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron actividades registradas.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class ActivityLogTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly activityLogStore = inject(ActivityLogStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedActivities = linkedSignal<ActivityInfo[], ActivityInfo[]>({
    source: this.activityLogStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: ActivityInfo) => id));
      return prevSelected.filter(({ id }: ActivityInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteActivity({ id, employeeName }: ActivityInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar actividad',
      message: `¿Está seguro de que desea eliminar la actividad de <b>${employeeName}</b>?`,
      accept: () => this.activityLogStore.delete(id),
    });
  }

  getActionTypeClass(type: string): string {
    switch (type) {
      case 'TASK':
        return 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm';
      case 'BREAK':
        return 'bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm';
      case 'MEETING':
        return 'bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm';
      case 'TRAINING':
        return 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm';
      default:
        return '';
    }
  }

  getActionTypeLabel(type: string): string {
    switch (type) {
      case 'TASK':
        return 'Tarea';
      case 'BREAK':
        return 'Descanso';
      case 'MEETING':
        return 'Reunión';
      case 'TRAINING':
        return 'Capacitación';
      default:
        return type;
    }
  }
}
