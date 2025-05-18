import { Component, inject, viewChild } from '@angular/core';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { SalesReturnsDialogComponent } from './sales-returns-dialog/sales-returns-dialog.component';
import { SalesReturnsTableComponent } from './sales-returns-table/sales-returns-table.component';
import { SalesReturnsToolbarComponent } from './sales-returns-toolbar/sales-returns-toolbar.component';

@Component({
  selector: 'app-sales-returns',
  imports: [
    SalesReturnsToolbarComponent,
    SalesReturnsTableComponent,
    SalesReturnsDialogComponent,
  ],
  template: `
    <app-sales-returns-toolbar [salesReturnsTable]="salesReturnsTable" />

    <app-sales-returns-table #salesReturnsTable />

    <app-sales-returns-dialog />
  `,
})
export class SalesReturnsComponent {
  readonly saleReturnStore = inject(SaleReturnStore);
  readonly salesReturnsTable = viewChild.required(SalesReturnsTableComponent);
}
