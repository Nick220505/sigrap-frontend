import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { PerformanceInfo } from '../../../models/performance.model';
import { PerformanceStore } from '../../../stores/performance.store';
import { PerformanceTableComponent } from '../performance-table/performance-table.component';

@Component({
  selector: 'app-performance-toolbar',
  imports: [ButtonModule, ToolbarModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nueva evaluación"
          tooltipPosition="top"
          (onClick)="performanceStore.openPerformanceDialog()"
        />

        <p-button
          label="Eliminar"
          icon="pi pi-trash"
          severity="danger"
          outlined
          pTooltip="Eliminar evaluaciones seleccionadas"
          tooltipPosition="top"
          [disabled]="performanceTable().selectedPerformances().length === 0"
          (onClick)="deleteSelectedPerformances()"
          class="mr-2"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="performanceTable().dt().exportCSV()"
          [disabled]="performanceStore.entities().length === 0"
          pTooltip="Exportar evaluaciones a CSV"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class PerformanceToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly performanceStore = inject(PerformanceStore);
  readonly performanceTable = input.required<PerformanceTableComponent>();

  deleteSelectedPerformances(): void {
    const performances = this.performanceTable().selectedPerformances();
    this.confirmationService.confirm({
      header: 'Eliminar evaluaciones',
      message: `
        ¿Está seguro de que desea eliminar las ${performances.length} evaluaciones seleccionadas?
        <ul class='mt-2 mb-0'>
          ${performances
            .map(
              ({ employeeName, period }: PerformanceInfo) =>
                `<li>• <b>${employeeName}</b> - Periodo: ${period}</li>`,
            )
            .join('')}
        </ul>
      `,
      accept: () => {
        const ids = performances.map(({ id }: PerformanceInfo) => id);
        this.performanceStore.deleteAllById(ids);
      },
    });
  }
}
