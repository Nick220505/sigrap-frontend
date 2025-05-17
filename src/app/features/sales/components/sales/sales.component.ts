import { Component, inject, viewChild } from '@angular/core';
import { SaleStore } from '../../stores/sale.store';
import { SalesDialogComponent } from './sales-dialog/sales-dialog.component';
import { SalesTableComponent } from './sales-table/sales-table.component';
import { SalesToolbarComponent } from './sales-toolbar/sales-toolbar.component';

@Component({
  selector: 'app-sales',
  imports: [SalesToolbarComponent, SalesTableComponent, SalesDialogComponent],
  template: `
    <app-sales-toolbar [salesTable]="salesTable" />

    <app-sales-table #salesTable />

    <app-sales-dialog />
  `,
})
export class SalesComponent {
  readonly saleStore = inject(SaleStore);
  readonly salesTable = viewChild.required(SalesTableComponent);
}
