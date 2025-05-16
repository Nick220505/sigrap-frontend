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
import { PerformanceInfo } from '../../../models/performance.model';
import { PerformanceStore } from '../../../stores/performance.store';

type RatingLevel = 'Excelente' | 'Bueno' | 'Regular' | 'Deficiente';

@Component({
  selector: 'app-performance-table',
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
        { field: 'evaluatorName', header: 'Evaluador' },
        { field: 'period', header: 'Periodo' },
        { field: 'rating', header: 'Calificación' },
        { field: 'evaluationDate', header: 'Fecha de Evaluación' },
      ];

    <p-table
      #dt
      [value]="performanceStore.entities()"
      [loading]="performanceStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} evaluaciones"
      [globalFilterFields]="[
        'employeeName',
        'evaluatorName',
        'period',
        'rating',
      ]"
      [tableStyle]="{ 'min-width': '75rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedPerformances"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Evaluaciones de Rendimiento</h5>
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

      <ng-template #body let-performance let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="performance" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'rating') {
                <span [class]="getRatingClass(performance.rating)">
                  {{ getRatingLabel(performance.rating) }}
                </span>
              } @else if (column.field === 'evaluationDate') {
                {{ performance[column.field] | date: 'dd/MM/yyyy' }}
              } @else {
                {{ performance[column.field] }}
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="performanceStore.openPerformanceDialog(performance)"
              pTooltip="Editar evaluación"
              tooltipPosition="top"
              [disabled]="performanceStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deletePerformance(performance)"
              pTooltip="Eliminar evaluación"
              tooltipPosition="top"
              [disabled]="performanceStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (performanceStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar evaluaciones:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="performanceStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="performanceStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron evaluaciones.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class PerformanceTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly performanceStore = inject(PerformanceStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedPerformances = linkedSignal<
    PerformanceInfo[],
    PerformanceInfo[]
  >({
    source: this.performanceStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: PerformanceInfo) => id));
      return prevSelected.filter(({ id }: PerformanceInfo) =>
        entityIds.has(id),
      );
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deletePerformance(performance: PerformanceInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar evaluación',
      message: `¿Está seguro de que desea eliminar la evaluación de <b>${performance.employeeName}</b>?`,
      accept: () => this.performanceStore.delete(performance.id),
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
