import { Component, inject, viewChild } from '@angular/core';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order.store';
import { OrderDialogComponent } from './order-dialog/order-dialog.component';
import { OrderTableComponent } from './order-table/order-table.component';
import { OrderToolbarComponent } from './order-toolbar/order-toolbar.component';

@Component({
  selector: 'app-orders',
  imports: [OrderTableComponent, OrderDialogComponent, OrderToolbarComponent],
  template: `
    <app-order-toolbar [orderTable]="orderTable" />

    <app-order-table #orderTable />

    <app-order-dialog />
  `,
})
export class OrdersComponent {
  readonly purchaseOrderStore = inject(PurchaseOrderStore);
  readonly orderTable = viewChild.required(OrderTableComponent);
}
