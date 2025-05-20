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
import { ScheduleInfo } from '../../../models/schedule.model';
import { ScheduleStore } from '../../../stores/schedule.store';

@Component({
  selector: 'app-schedule-table',
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
        { field: 'userName', header: 'Empleado' },
        { field: 'day', header: 'Día' },
        { field: 'startTime', header: 'Hora Inicio' },
        { field: 'endTime', header: 'Hora Fin' },
        { field: 'type', header: 'Tipo' },
      ];

    <p-table
      #dt
      [value]="scheduleStore.entities()"
      [loading]="scheduleStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} horarios"
      [globalFilterFields]="['userName', 'day', 'startTime', 'endTime', 'type']"
      [tableStyle]="{ 'min-width': '75rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedSchedules"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Horarios de Empleados</h5>
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

      <ng-template #body let-schedule>
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="schedule" />
          </td>

          <td>{{ schedule.userName }}</td>

          <td>
            @switch (schedule.day) {
              @case ('MONDAY') {
                Lunes
              }
              @case ('TUESDAY') {
                Martes
              }
              @case ('WEDNESDAY') {
                Miércoles
              }
              @case ('THURSDAY') {
                Jueves
              }
              @case ('FRIDAY') {
                Viernes
              }
              @case ('SATURDAY') {
                Sábado
              }
              @case ('SUNDAY') {
                Domingo
              }
              @default {
                No especificado
              }
            }
          </td>

          <td>
            {{
              schedule.startTime
                ? ('1970-01-01T' + schedule.startTime | date: 'hh:mm a')
                : ''
            }}
          </td>

          <td>
            {{
              schedule.endTime
                ? ('1970-01-01T' + schedule.endTime | date: 'hh:mm a')
                : ''
            }}
          </td>

          <td>
            @switch (schedule.type) {
              @case ('REGULAR') {
                <span
                  class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  Regular
                </span>
              }
              @case ('OVERTIME') {
                <span
                  class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                >
                  Horas Extra
                </span>
              }
              @case ('HOLIDAY') {
                <span
                  class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  Festivo
                </span>
              }
              @default {
                <span
                  class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  Regular
                </span>
              }
            }
          </td>

          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="scheduleStore.openScheduleDialog(schedule)"
              pTooltip="Editar horario"
              tooltipPosition="top"
              [disabled]="scheduleStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteSchedule(schedule)"
              pTooltip="Eliminar horario"
              tooltipPosition="top"
              [disabled]="scheduleStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (scheduleStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar horarios:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="scheduleStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="scheduleStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron horarios.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class ScheduleTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly scheduleStore = inject(ScheduleStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedSchedules = linkedSignal<ScheduleInfo[], ScheduleInfo[]>({
    source: this.scheduleStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: ScheduleInfo) => id));
      return prevSelected.filter(({ id }: ScheduleInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteSchedule(schedule: ScheduleInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar horario',
      message: `¿Está seguro de que desea eliminar el horario de <b>${schedule.userName}</b>?`,
      accept: () => this.scheduleStore.delete(schedule.id),
    });
  }
}
