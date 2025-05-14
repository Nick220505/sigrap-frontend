import { Component, inject, input } from '@angular/core';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { OrderTableComponent } from '../order-table/order-table.component';

@Component({
  selector: 'app-order-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template pTemplate="start">
        <p-button
          label="Nuevo Pedido"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nuevo pedido"
          tooltipPosition="top"
          (onClick)="purchaseOrderStore.openOrderDialog()"
        />

        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar pedidos seleccionados"
          tooltipPosition="top"
          (onClick)="deleteSelectedOrders()"
          [disabled]="orderTable().selectedOrders().length === 0"
        />
      </ng-template>

      <ng-template pTemplate="end">
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar pedidos a CSV"
          tooltipPosition="top"
          (onClick)="orderTable().dt().exportCSV()"
          [disabled]="purchaseOrderStore.ordersCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class OrderToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly purchaseOrderStore = inject(PurchaseOrderStore);

  readonly orderTable = input.required<OrderTableComponent>();

  deleteSelectedOrders(): void {
    const orders = this.orderTable().selectedOrders();

    // Check if any of the selected orders are not in DRAFT status
    const nonDraftOrders = orders.filter((order) => order.status !== 'DRAFT');
    if (nonDraftOrders.length > 0) {
      this.confirmationService.confirm({
        header: 'Operación no permitida',
        message: 'Solo se pueden eliminar pedidos en estado Borrador.',
        acceptVisible: false,
        rejectLabel: 'Entendido',
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Eliminar pedidos',
      message: `
          ¿Está seguro de que desea eliminar los ${orders.length} pedidos seleccionados?
          <ul class='mt-2 mb-0'>
            ${orders.map(({ orderNumber }) => `<li>• <b>${orderNumber}</b></li>`).join('')}
          </ul>
        `,
      accept: () => {
        const ids = orders.map(({ id }) => id);
        this.purchaseOrderStore.deleteAllById(ids);
      },
    });
  }
}
