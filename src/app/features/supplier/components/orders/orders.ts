import { Component, inject, viewChild } from '@angular/core';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order-store';
import { OrderDialog } from './order-dialog/order-dialog';
import { OrderStats } from './order-stats/order-stats';
import { OrderTable } from './order-table/order-table';
import { OrderToolbar } from './order-toolbar/order-toolbar';

@Component({
  selector: 'app-orders',
  imports: [OrderStats, OrderToolbar, OrderTable, OrderDialog],
  template: `
    <app-order-stats />

    <app-order-toolbar [orderTable]="orderTable" />

    <app-order-table #orderTable />

    <app-order-dialog />
  `,
})
export class Orders {
  readonly purchaseOrderStore = inject(PurchaseOrderStore);
  readonly orderTable = viewChild.required(OrderTable);
}
