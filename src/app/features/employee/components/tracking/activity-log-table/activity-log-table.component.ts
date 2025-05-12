import { DatePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivityInfo } from '@features/employee/models/activity-log.model';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ActivityLogStore } from '../../../stores/activity-log.store';

@Component({
  selector: 'app-activity-log-table',
  imports: [TableModule, ButtonModule, InputTextModule, FormsModule, DatePipe],
  template: `
    <div class="card">
      <p-table
        #dt
        [value]="activityLogStore.entities()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="[
          'employeeName',
          'activityType',
          'description',
          'timestamp',
        ]"
        [tableStyle]="{ 'min-width': '75rem' }"
        [rowHover]="true"
        dataKey="id"
        [rowsPerPageOptions]="[10, 25, 50]"
        [selection]="selectedActivities()"
        (selectionChange)="selectedActivities.set($event)"
        [loading]="activityLogStore.loading()"
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="caption">
          <div class="flex items-center justify-between">
            <h5 class="m-0">Registro de Actividades</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [ngModel]="searchValue()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Buscar actividad..."
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
            <th>Tipo de Actividad</th>
            <th>Descripción</th>
            <th>Fecha y Hora</th>
            <th style="width: 8rem"></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-activity>
          <tr>
            <td>
              <p-tableCheckbox [value]="activity"></p-tableCheckbox>
            </td>
            <td>{{ activity.employeeName }}</td>
            <td>
              <span [class]="getActivityTypeClass(activity.activityType)">
                {{ getActivityTypeLabel(activity.activityType) }}
              </span>
            </td>
            <td>{{ activity.description }}</td>
            <td>{{ activity.timestamp | date: 'dd/MM/yyyy HH:mm' }}</td>
            <td>
              <div class="flex gap-2 justify-center">
                <p-button
                  icon="pi pi-pencil"
                  styleClass="p-button-rounded p-button-text"
                  (onClick)="activityLogStore.openActivityLogDialog(activity)"
                />
                <p-button
                  icon="pi pi-trash"
                  styleClass="p-button-rounded p-button-text p-button-danger"
                  (onClick)="deleteActivity(activity)"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class ActivityLogTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly activityLogStore = inject(ActivityLogStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedActivities = signal<ActivityInfo[]>([]);

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  onSearchChange(value: string): void {
    this.searchValue.set(value);
    this.dt().filterGlobal(value, 'contains');
  }

  deleteActivity({ id, employeeName }: ActivityInfo): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar la actividad de ${employeeName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.activityLogStore.delete(id);
      },
    });
  }

  getActivityTypeClass(type: string): string {
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

  getActivityTypeLabel(type: string): string {
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
