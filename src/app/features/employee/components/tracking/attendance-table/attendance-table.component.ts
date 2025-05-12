import { DatePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttendanceInfo } from '@features/employee/models/attendance.model';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { AttendanceStore } from '../../../stores/attendance.store';

@Component({
  selector: 'app-attendance-table',
  imports: [TableModule, ButtonModule, InputTextModule, FormsModule, DatePipe],
  template: `
    <div class="card">
      <p-table
        #dt
        [value]="attendanceStore.entities()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="[
          'employeeName',
          'date',
          'clockInTime',
          'clockOutTime',
          'status',
        ]"
        [tableStyle]="{ 'min-width': '75rem' }"
        [rowHover]="true"
        dataKey="id"
        [rowsPerPageOptions]="[10, 25, 50]"
        [selection]="selectedAttendances()"
        (selectionChange)="selectedAttendances.set($event)"
        [loading]="attendanceStore.loading()"
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="caption">
          <div class="flex items-center justify-between">
            <h5 class="m-0">Registro de Asistencia</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [ngModel]="searchValue()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Buscar asistencia..."
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
            <th>Fecha</th>
            <th>Hora Entrada</th>
            <th>Hora Salida</th>
            <th>Estado</th>
            <th style="width: 8rem"></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-attendance>
          <tr>
            <td>
              <p-tableCheckbox [value]="attendance"></p-tableCheckbox>
            </td>
            <td>{{ attendance.employeeName }}</td>
            <td>{{ attendance.date | date: 'dd/MM/yyyy' }}</td>
            <td>{{ attendance.clockInTime }}</td>
            <td>{{ attendance.clockOutTime || '-' }}</td>
            <td>
              <span [class]="getStatusClass(attendance.status)">
                {{ getStatusLabel(attendance.status) }}
              </span>
            </td>
            <td>
              <div class="flex gap-2 justify-center">
                <p-button
                  icon="pi pi-clock"
                  styleClass="p-button-rounded p-button-text p-button-success"
                  [disabled]="attendance.clockOutTime"
                  (onClick)="clockOut(attendance)"
                />
                <p-button
                  icon="pi pi-trash"
                  styleClass="p-button-rounded p-button-text p-button-danger"
                  (onClick)="deleteAttendance(attendance)"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class AttendanceTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly attendanceStore = inject(AttendanceStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedAttendances = signal<AttendanceInfo[]>([]);

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  onSearchChange(value: string): void {
    this.searchValue.set(value);
    this.dt().filterGlobal(value, 'contains');
  }

  clockOut({ id, employeeName }: AttendanceInfo): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea registrar la salida de ${employeeName}?`,
      header: 'Confirmar registro de salida',
      icon: 'pi pi-exclamation-triangle',
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
      message: `¿Está seguro que desea eliminar el registro de asistencia de ${employeeName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.attendanceStore.deleteAllById([id]);
      },
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm';
      case 'ABSENT':
        return 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm';
      default:
        return '';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PRESENT':
        return 'Presente';
      case 'LATE':
        return 'Tarde';
      case 'ABSENT':
        return 'Ausente';
      default:
        return status;
    }
  }
}
