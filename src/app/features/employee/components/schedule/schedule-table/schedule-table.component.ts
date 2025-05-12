import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ScheduleInfo } from '../../../models/schedule.model';
import { ScheduleStore } from '../../../stores/schedule.store';

type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

type ScheduleType = 'REGULAR' | 'OVERTIME' | 'HOLIDAY';

@Component({
  selector: 'app-schedule-table',
  imports: [TableModule, ButtonModule, InputTextModule, FormsModule],
  template: `
    <div class="card">
      <p-table
        #dt
        [value]="scheduleStore.entities()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="[
          'employeeName',
          'dayOfWeek',
          'startTime',
          'endTime',
        ]"
        [tableStyle]="{ 'min-width': '75rem' }"
        [rowHover]="true"
        dataKey="id"
        [rowsPerPageOptions]="[10, 25, 50]"
        [selection]="selectedSchedules()"
        (selectionChange)="selectedSchedules.set($event)"
        [loading]="scheduleStore.loading()"
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="caption">
          <div class="flex items-center justify-between">
            <h5 class="m-0">Horarios de Empleados</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [ngModel]="searchValue()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Buscar horario..."
              />
            </span>
          </div>
        </ng-template>

        <ng-template pTemplate="header">
          <tr>
            <th style="width: 4rem">
              <p-tableHeaderCheckbox></p-tableHeaderCheckbox>
            </th>
            <th>Empleado</th>
            <th>Día</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
            <th>Tipo</th>
            <th style="width: 8rem"></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-schedule>
          <tr>
            <td>
              <p-tableCheckbox [value]="schedule"></p-tableCheckbox>
            </td>
            <td>{{ schedule.employeeName }}</td>
            <td>{{ getDayOfWeekLabel(schedule.dayOfWeek) }}</td>
            <td>{{ schedule.startTime }}</td>
            <td>{{ schedule.endTime }}</td>
            <td>
              <span [class]="getScheduleTypeClass(schedule.type)">
                {{ getScheduleTypeLabel(schedule.type) }}
              </span>
            </td>
            <td>
              <div class="flex gap-2 justify-center">
                <p-button
                  icon="pi pi-pencil"
                  styleClass="p-button-rounded p-button-text"
                  (onClick)="scheduleStore.openScheduleDialog(schedule)"
                />
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  styleClass="p-button-rounded p-button-text"
                  (onClick)="deleteSchedule(schedule)"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class ScheduleTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly scheduleStore = inject(ScheduleStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedSchedules = signal<ScheduleInfo[]>([]);

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  onSearchChange(value: string): void {
    this.searchValue.set(value);
    this.dt().filterGlobal(value, 'contains');
  }

  deleteSchedule(schedule: ScheduleInfo): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el horario de ${schedule.employeeName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.scheduleStore.delete(schedule.id);
      },
    });
  }

  getDayOfWeekLabel(dayOfWeek: DayOfWeek): string {
    const days: Record<DayOfWeek, string> = {
      MONDAY: 'Lunes',
      TUESDAY: 'Martes',
      WEDNESDAY: 'Miércoles',
      THURSDAY: 'Jueves',
      FRIDAY: 'Viernes',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };
    return days[dayOfWeek];
  }

  getScheduleTypeClass(type: ScheduleType): string {
    const classes: Record<ScheduleType, string> = {
      REGULAR: 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm',
      OVERTIME: 'bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm',
      HOLIDAY: 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm',
    };
    return classes[type];
  }

  getScheduleTypeLabel(type: ScheduleType): string {
    const labels: Record<ScheduleType, string> = {
      REGULAR: 'Regular',
      OVERTIME: 'Horas Extra',
      HOLIDAY: 'Festivo',
    };
    return labels[type];
  }
}
