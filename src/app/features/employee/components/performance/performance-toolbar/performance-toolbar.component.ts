import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { PerformanceStore } from '../../../stores/performance.store';
import { PerformanceTableComponent } from '../performance-table/performance-table.component';

@Component({
  selector: 'app-performance-toolbar',
  imports: [ButtonModule],
  template: `
    <div class="flex flex-wrap gap-2 justify-between items-center">
      <div class="flex gap-2">
        <p-button
          icon="pi pi-plus"
          label="Nueva Evaluación"
          styleClass="p-button-primary"
          (onClick)="performanceStore.openPerformanceDialog()"
        />
        <p-button
          icon="pi pi-trash"
          label="Eliminar Seleccionados"
          styleClass="p-button-danger"
          [disabled]="!performanceTable().selectedPerformances().length"
          (onClick)="deleteSelectedPerformances()"
        />
      </div>
      <div class="flex gap-2">
        <p-button
          icon="pi pi-filter-slash"
          label="Limpiar Filtros"
          styleClass="p-button-outlined"
          (onClick)="performanceTable().clearAllFilters()"
        />
      </div>
    </div>
  `,
})
export class PerformanceToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly performanceStore = inject(PerformanceStore);
  readonly performanceTable = input.required<PerformanceTableComponent>();

  deleteSelectedPerformances(): void {
    const performances = this.performanceTable().selectedPerformances();
    this.confirmationService.confirm({
      message: `
          ¿Está seguro que desea eliminar las ${performances.length} evaluaciones seleccionadas?
          <ul class='mt-2 mb-0'>
            ${performances
              .map(
                ({ employeeName, period, rating }) =>
                  `<li>• <b>${employeeName}</b> - ${period} (Calificación: ${rating})</li>`,
              )
              .join('')}
          </ul>
        `,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const ids = performances.map(({ id }) => id);
        this.performanceStore.deleteAllById(ids);
      },
    });
  }
}
