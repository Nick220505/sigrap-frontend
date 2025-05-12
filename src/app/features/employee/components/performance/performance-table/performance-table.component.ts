import { DatePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { PerformanceInfo } from '../../../models/performance.model';
import { PerformanceStore } from '../../../stores/performance.store';

type RatingLevel = 'Excelente' | 'Bueno' | 'Regular' | 'Deficiente';

@Component({
  selector: 'app-performance-table',
  imports: [TableModule, ButtonModule, InputTextModule, FormsModule, DatePipe],
  template: `
    <div class="card">
      <p-table
        #dt
        [value]="performanceStore.entities()"
        [rows]="10"
        [paginator]="true"
        [globalFilterFields]="[
          'employeeName',
          'evaluatorName',
          'period',
          'rating',
        ]"
        [tableStyle]="{ 'min-width': '75rem' }"
        [rowHover]="true"
        dataKey="id"
        [rowsPerPageOptions]="[10, 25, 50]"
        [selection]="selectedPerformances()"
        (selectionChange)="selectedPerformances.set($event)"
        [loading]="performanceStore.loading()"
        styleClass="p-datatable-gridlines"
      >
        <ng-template pTemplate="caption">
          <div class="flex items-center justify-between">
            <h5 class="m-0">Evaluaciones de Rendimiento</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search"></i>
              <input
                pInputText
                type="text"
                [ngModel]="searchValue()"
                (ngModelChange)="onSearchChange($event)"
                placeholder="Buscar evaluación..."
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
            <th>Evaluador</th>
            <th>Periodo</th>
            <th>Calificación</th>
            <th>Fecha de Evaluación</th>
            <th style="width: 8rem"></th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-performance>
          <tr>
            <td>
              <p-tableCheckbox [value]="performance"></p-tableCheckbox>
            </td>
            <td>{{ performance.employeeName }}</td>
            <td>{{ performance.evaluatorName }}</td>
            <td>{{ performance.period }}</td>
            <td>
              <span [class]="getRatingClass(performance.rating)">
                {{ getRatingLabel(performance.rating) }}
              </span>
            </td>
            <td>{{ performance.evaluationDate | date: 'dd/MM/yyyy' }}</td>
            <td>
              <div class="flex gap-2 justify-center">
                <p-button
                  icon="pi pi-pencil"
                  styleClass="p-button-rounded p-button-text"
                  (onClick)="
                    performanceStore.openPerformanceDialog(performance)
                  "
                />
                <p-button
                  icon="pi pi-trash"
                  severity="danger"
                  styleClass="p-button-rounded p-button-text"
                  (onClick)="deletePerformance(performance)"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class PerformanceTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly performanceStore = inject(PerformanceStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedPerformances = signal<PerformanceInfo[]>([]);

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  onSearchChange(value: string): void {
    this.searchValue.set(value);
    this.dt().filterGlobal(value, 'contains');
  }

  deletePerformance(performance: PerformanceInfo): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar la evaluación de ${performance.employeeName}?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.performanceStore.delete(performance.id);
      },
    });
  }

  getRatingClass(rating: number): string {
    const classes: Record<RatingLevel, string> = {
      Excelente: 'bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm',
      Bueno: 'bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm',
      Regular: 'bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm',
      Deficiente: 'bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm',
    };
    return classes[this.getRatingLabel(rating)];
  }

  getRatingLabel(rating: number): RatingLevel {
    if (rating >= 4.5) {
      return 'Excelente';
    } else if (rating >= 3.5) {
      return 'Bueno';
    } else if (rating >= 2.5) {
      return 'Regular';
    } else {
      return 'Deficiente';
    }
  }
}
