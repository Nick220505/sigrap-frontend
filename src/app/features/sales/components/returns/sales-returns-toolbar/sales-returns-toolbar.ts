import { Component, inject, input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SaleReturnInfo } from '@features/sales/models/sale-return.model';
import { SaleReturnStore } from '@features/sales/stores/sale-return-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SalesReturnsTable } from '../sales-returns-table/sales-returns-table';

@Component({
  selector: 'app-sales-returns-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule, TranslateModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          [label]="'sales.returns.newButton' | translate"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          [pTooltip]="'sales.tooltips.createReturn' | translate"
          tooltipPosition="top"
          (onClick)="saleReturnStore.openReturnDialog()"
        />

        <p-button
          severity="danger"
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          outlined
          [pTooltip]="'sales.tooltips.deleteReturns' | translate"
          tooltipPosition="top"
          (onClick)="deleteSelectedSaleReturns()"
          [disabled]="salesReturnsTable().selectedSaleReturns().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          [label]="'sales.returns.exportButton' | translate"
          icon="pi pi-download"
          severity="secondary"
          [pTooltip]="'sales.tooltips.exportReturns' | translate"
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
  private readonly translateService = inject(TranslateService);

  readonly salesReturnsTable = input.required<SalesReturnsTable>();

  deleteSelectedSaleReturns(): void {
    const selection = this.salesReturnsTable().selectedSaleReturns();
    if (!selection || selection.length === 0) {
      return;
    }

    this.confirmationService.confirm({
      header: this.translateService.instant('common.confirmations.deleteHeaderPlural', { items: 'returns' }),
      message: `
        ${this.translateService.instant('common.confirmations.deleteMessagePlural', { count: selection.length, items: 'returns' })}
        <ul class='mt-2 mb-0'>
          ${selection.map((item) => `<li>• <b>${this.translateService.instant('common.returnNumber', { id: item.id })}</b></li>`).join('')}
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
