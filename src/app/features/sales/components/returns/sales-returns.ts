import { Component, inject, viewChild } from '@angular/core';
import { SaleReturnStore } from '@features/sales/stores/sale-return-store';
import { SalesReturnsDialog } from './sales-returns-dialog/sales-returns-dialog';
import { SalesReturnsTable } from './sales-returns-table/sales-returns-table';
import { SalesReturnsToolbar } from './sales-returns-toolbar/sales-returns-toolbar';

@Component({
  selector: 'app-sales-returns',
  imports: [SalesReturnsToolbar, SalesReturnsTable, SalesReturnsDialog],
  template: `
    <app-sales-returns-toolbar [salesReturnsTable]="salesReturnsTable" />

    <app-sales-returns-table #salesReturnsTable />

    <app-sales-returns-dialog />
  `,
})
export class SalesReturns {
  readonly saleReturnStore = inject(SaleReturnStore);
  readonly salesReturnsTable = viewChild.required(SalesReturnsTable);
}
