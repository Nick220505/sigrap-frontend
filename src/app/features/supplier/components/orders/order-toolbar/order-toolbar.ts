import { Component, inject, input } from '@angular/core';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { OrderTable } from '../order-table/order-table';

@Component({
  selector: 'app-order-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template pTemplate="start">
        <p-button
          label="New Order"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Create new order"
          tooltipPosition="top"
          (onClick)="purchaseOrderStore.openOrderDialog()"
        />

        <p-button
          severity="danger"
          label="Delete"
          icon="pi pi-trash"
          outlined
          pTooltip="Delete selected orders"
          tooltipPosition="top"
          (onClick)="deleteSelectedOrders()"
          [disabled]="orderTable().selectedOrders().length === 0"
        />
      </ng-template>

      <ng-template pTemplate="end">
        <p-button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Export orders to CSV"
          tooltipPosition="top"
          (onClick)="orderTable().dt().exportCSV()"
          [disabled]="purchaseOrderStore.ordersCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class OrderToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  readonly purchaseOrderStore = inject(PurchaseOrderStore);

  readonly orderTable = input.required<OrderTable>();

  deleteSelectedOrders(): void {
    const orders = this.orderTable().selectedOrders();

    const nonDraftOrders = orders.filter((order) => order.status !== 'DRAFT');
    if (nonDraftOrders.length > 0) {
      this.confirmationService.confirm({
        header: 'Operation Not Allowed',
        message: 'Only orders in Draft status can be deleted.',
        acceptVisible: false,
        rejectLabel: 'Understood',
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Delete Orders',
      message: `
          Are you sure you want to delete the ${orders.length} selected orders?
          <ul class='mt-2 mb-0'>
            ${orders.map(({ id }) => `<li>• <b>Order #${id}</b></li>`).join('')}
          </ul>
        `,
      accept: () => {
        const ids = orders.map(({ id }) => id);
        this.purchaseOrderStore.deleteAllById(ids);
      },
    });
  }
}
