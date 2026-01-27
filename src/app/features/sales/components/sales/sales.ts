import { Component, inject, viewChild } from '@angular/core';
import { SaleStore } from '@features/sales/stores/sale-store';
import { SalesDialog } from './sales-dialog/sales-dialog';
import { SalesTable } from './sales-table/sales-table';
import { SalesToolbar } from './sales-toolbar/sales-toolbar';

@Component({
  selector: 'app-sales',
  imports: [SalesToolbar, SalesTable, SalesDialog],
  template: `
    <app-sales-toolbar [salesTable]="salesTable" />

    <app-sales-table #salesTable />

    <app-sales-dialog />
  `,
})
export class Sales {
  readonly saleStore = inject(SaleStore);
  readonly salesTable = viewChild.required(SalesTable);
}
