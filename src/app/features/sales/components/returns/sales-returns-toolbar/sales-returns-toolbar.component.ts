import { Component, inject, input } from '@angular/core';
import { SaleReturnInfo } from '@features/sales/models/sale-return.model';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SalesReturnsTableComponent } from '../sales-returns-table/sales-returns-table.component';

@Component({
  selector: 'app-sales-returns-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nueva"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Registrar nueva devolución"
          tooltipPosition="top"
          (onClick)="saleReturnStore.openReturnDialog()"
        />

        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar devoluciones seleccionadas"
          tooltipPosition="top"
          (onClick)="deleteSelectedSaleReturns()"
          [disabled]="salesReturnsTable().selectedSaleReturns().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar devoluciones a CSV"
          tooltipPosition="top"
          (onClick)="exportCSV()"
          [disabled]="saleReturnStore.entities().length === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class SalesReturnsToolbarComponent {
  readonly saleReturnStore = inject(SaleReturnStore);
  private readonly confirmationService = inject(ConfirmationService);

  readonly salesReturnsTable = input.required<SalesReturnsTableComponent>();

  deleteSelectedSaleReturns(): void {
    const selection = this.salesReturnsTable().selectedSaleReturns();
    if (!selection || selection.length === 0) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Eliminar devoluciones',
      message: `
          ¿Está seguro de que desea eliminar las ${selection.length} devoluciones seleccionadas?
          <ul class='mt-2 mb-0'>
            ${selection.map((item) => `<li>• <b>Devolución #${item.id}</b></li>`).join('')}
          </ul>
        `,
      accept: () => {
        const ids = selection.map((item) => item.id);
        this.saleReturnStore.deleteAllById(ids);
      },
    });
  }

  exportCSV(): void {
    const headers = [
      'ID',
      'Venta Original',
      'Cliente',
      'Empleado',
      'Monto',
      'Razón',
      'Fecha',
    ];

    const csvData = this.saleReturnStore
      .entities()
      .map((item: SaleReturnInfo) => [
        item.id,
        item.originalSaleId,
        item.customer?.fullName || 'N/A',
        item.employee?.name || 'N/A',
        item.totalReturnAmount,
        item.reason,
        new Date(item.createdAt).toLocaleDateString('es-CO'),
      ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        row
          .map((cell) =>
            typeof cell === 'string' &&
            (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
              ? `"${cell.replace(/"/g, '""')}"`
              : cell,
          )
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'devoluciones.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
