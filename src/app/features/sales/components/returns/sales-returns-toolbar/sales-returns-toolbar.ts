import { Component, inject, input } from '@angular/core';
import { SaleReturnInfo } from '@features/sales/models/sale-return';
import { SaleReturnStore } from '@features/sales/stores/sale-return-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SalesReturnsTable } from '../sales-returns-table/sales-returns-table';

@Component({
  selector: 'app-sales-returns-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Register new return"
          tooltipPosition="top"
          (onClick)="saleReturnStore.openReturnDialog()"
        />

        <p-button
          severity="danger"
          label="Delete"
          icon="pi pi-trash"
          outlined
          pTooltip="Delete selected returns"
          tooltipPosition="top"
          (onClick)="deleteSelectedSaleReturns()"
          [disabled]="salesReturnsTable().selectedSaleReturns().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Export returns to CSV"
          tooltipPosition="top"
          (onClick)="exportCSV()"
          [disabled]="saleReturnStore.entities().length === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class SalesReturnsToolbar {
  readonly saleReturnStore = inject(SaleReturnStore);
  private readonly confirmationService = inject(ConfirmationService);

  readonly salesReturnsTable = input.required<SalesReturnsTable>();

  deleteSelectedSaleReturns(): void {
    const selection = this.salesReturnsTable().selectedSaleReturns();
    if (!selection || selection.length === 0) {
      return;
    }

    this.confirmationService.confirm({
      header: 'Delete returns',
      message: `
          Are you sure you want to delete the ${selection.length} selected returns?
          <ul class='mt-2 mb-0'>
            ${selection.map((item) => `<li>â€¢ <b>Return #${item.id}</b></li>`).join('')}
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
      'Original Sale',
      'Customer',
      'Employee',
      'Amount',
      'Reason',
      'Date',
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
        new Date(item.createdAt).toLocaleDateString('en-US'),
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
    link.setAttribute('download', 'returns.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

