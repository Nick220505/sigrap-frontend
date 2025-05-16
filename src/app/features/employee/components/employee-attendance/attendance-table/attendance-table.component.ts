import { DatePipe } from '@angular/common';
import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttendanceInfo } from '@features/employee/models/attendance.model';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-attendance-table',
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
        { field: 'date', header: 'Fecha' },
        { field: 'clockInTime', header: 'Hora Entrada' },
        { field: 'clockOutTime', header: 'Hora Salida' },
        { field: 'status', header: 'Estado' },
      ];

    <p-table
      #dt
      [value]="attendanceStore.entities()"
      [loading]="attendanceStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
      [globalFilterFields]="[
        'employeeName',
        'date',
        'clockInTime',
        'clockOutTime',
        'status',
      ]"
      [tableStyle]="{ 'min-width': '75rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedAttendances"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Registro de Asistencia</h5>
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

      <ng-template #body let-attendance let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="attendance" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'status') {
                @switch (attendance.status) {
                  @case ('PRESENT') {
                    <span
                      class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >Presente</span
                    >
                  }
                  @case ('LATE') {
                    <span
                      class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm"
                      >Tarde</span
                    >
                  }
                  @case ('ABSENT') {
                    <span
                      class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                      >Ausente</span
                    >
                  }
                  @case ('EARLY_DEPARTURE') {
                    <span
                      class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                      >Salida temprana</span
                    >
                  }
                  @case ('ON_LEAVE') {
                    <span
                      class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                      >Permiso</span
                    >
                  }
                  @default {
                    <span>{{ attendance.status }}</span>
                  }
                }
              } @else if (column.field === 'date') {
                {{ attendance.date | date: 'dd/MM/yyyy' }}
              } @else if (column.field === 'clockInTime') {
                {{
                  attendance.clockInTime | date: 'dd/MM/yyyy hh:mm a' : 'UTC-5'
                }}
              } @else if (column.field === 'clockOutTime') {
                {{
                  (attendance.clockOutTime
                    | date: 'dd/MM/yyyy hh:mm a' : 'UTC-5') || '-'
                }}
              } @else {
                {{ attendance[column.field] }}
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-clock"
              class="mr-2"
              severity="success"
              rounded
              outlined
              (click)="clockOut(attendance)"
              pTooltip="Registrar salida"
              tooltipPosition="top"
              [disabled]="
                !!attendance.clockOutTime || attendanceStore.loading()
              "
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteAttendance(attendance)"
              pTooltip="Eliminar registro"
              tooltipPosition="top"
              [disabled]="attendanceStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (attendanceStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar registros:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="attendanceStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="attendanceStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron registros de asistencia.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class AttendanceTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly attendanceStore = inject(AttendanceStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedAttendances = linkedSignal<
    AttendanceInfo[],
    AttendanceInfo[]
  >({
    source: this.attendanceStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: AttendanceInfo) => id));
      return prevSelected.filter(({ id }: AttendanceInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  clockOut({ id, employeeName }: AttendanceInfo): void {
    this.confirmationService.confirm({
      header: 'Registrar salida',
      message: `¿Está seguro de que desea registrar la salida de <b>${employeeName}</b>?`,
      accept: () => {
        this.attendanceStore.clockOut({
          attendanceId: id,
          timestamp: new Date().toISOString(),
        });
      },
    });
  }

  deleteAttendance({ id, employeeName }: AttendanceInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar registro',
      message: `¿Está seguro de que desea eliminar el registro de asistencia de <b>${employeeName}</b>?`,
      accept: () => this.attendanceStore.deleteAllById([id]),
    });
  }
}
