import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SaleInfo } from '../../../models/sale.model';
import { SaleStore } from '../../../stores/sale.store';
import { SalesTableComponent } from '../sales-table/sales-table.component';

@Component({
  selector: 'app-sales-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template pTemplate="start">
        <p-button
          label="Nueva Venta"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Registrar nueva venta"
          tooltipPosition="top"
          (onClick)="saleStore.openSaleDialog()"
        />

        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar ventas seleccionadas"
          tooltipPosition="top"
          (onClick)="deleteSelectedSales()"
          [disabled]="salesTable().selectedSales().length === 0"
        />
      </ng-template>

      <ng-template pTemplate="end">
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar ventas a CSV"
          tooltipPosition="top"
          (onClick)="salesTable().dt().exportCSV()"
          [disabled]="saleStore.salesCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class SalesToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly saleStore = inject(SaleStore);
  readonly salesTable = input.required<SalesTableComponent>();

  deleteSelectedSales(): void {
    const sales = this.salesTable().selectedSales();
    this.confirmationService.confirm({
      header: 'Eliminar ventas',
      message: `
          ¿Está seguro de que desea eliminar las ${sales.length} ventas seleccionadas?
          <ul class='mt-2 mb-0'>
            ${sales
              .map((sale: SaleInfo) => `<li>• <b>Venta #${sale.id}</b></li>`)
              .join('')}
          </ul>
        `,
      accept: () => {
        const ids = sales.map((sale: SaleInfo) => sale.id);
        ids.forEach((id: number) => this.saleStore.delete(id));
      },
    });
  }
}
