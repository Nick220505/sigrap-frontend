import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PurchaseOrderInfo } from '../../../models/purchase-order.model';
import { OrderTrackingStore } from '../../../stores/order-tracking.store';

export const ORDER_STATUS_ES: Record<string, string> = {
  DRAFT: 'Borrador',
  SUBMITTED: 'Enviado',
  CONFIRMED: 'Confirmado',
  SHIPPED: 'Despachado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

@Component({
  selector: 'app-tracking-table',
  imports: [
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    DatePipe,
    UpperCasePipe,
    ProgressSpinnerModule,
  ],
  template: `
    @let columns =
      [
        { field: 'orderNumber', header: 'ID Pedido' },
        { field: 'supplierName', header: 'Proveedor' },
        { field: 'orderDate', header: 'Fecha Pedido' },
        { field: 'expectedDeliveryDate', header: 'Est. Llegada' },
        { field: 'status', header: 'Estado' },
      ];

    <div class="overflow-x-auto">
      <p-table
        [value]="store.trackableOrders()"
        [loading]="store.isLoadingOrders()"
        [tableStyle]="{ 'min-width': '50rem' }"
        styleClass="p-datatable-sm"
        dataKey="id"
      >
        <ng-template pTemplate="caption">
          <div
            class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full p-3"
          >
            <div class="self-start">
              <h5 class="m-0 text-left text-xl font-semibold">
                Pedidos Activos
              </h5>
            </div>
          </div>
        </ng-template>
        <ng-template pTemplate="header">
          <tr>
            @for (col of columns; track col.field) {
              <th>{{ col.header }}</th>
            }
            <th>Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-order>
          <tr>
            <td>{{ order.orderNumber }}</td>
            <td>{{ order.supplier.name }}</td>
            <td>{{ order.orderDate | date: 'yyyy-MM-dd' }}</td>
            <td>{{ order.expectedDeliveryDate | date: 'yyyy-MM-dd' }}</td>
            <td>
              <p-tag
                [severity]="getPurchaseOrderStatusSeverity(order.status)"
                [value]="getSpanishStatus(order.status) | uppercase"
              />
            </td>
            <td>
              <div class="flex gap-1 justify-center">
                <p-button
                  icon="pi pi-eye"
                  styleClass="p-button-rounded p-button-text"
                  (onClick)="viewOrderDetails.emit(order)"
                  pTooltip="Ver detalles"
                  tooltipPosition="top"
                />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="columns.length + 1" class="text-center py-4">
              No hay pedidos activos para seguimiento.
            </td>
          </tr>
        </ng-template>
        <ng-template pTemplate="loadingbody" let-columns>
          <tr>
            <td [attr.colspan]="columns.length + 1" class="text-center py-4">
              <p-progressSpinner
                styleClass="w-8 h-8"
                strokeWidth="4"
                animationDuration=".5s"
              />
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class TrackingTableComponent {
  readonly store = inject(OrderTrackingStore);
  viewOrderDetails = output<PurchaseOrderInfo>();

  getSpanishStatus(status: string): string {
    return ORDER_STATUS_ES[status?.toUpperCase()] || status;
  }

  getPurchaseOrderStatusSeverity(status: string): string {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
      case 'IN_PROCESS':
        return 'info';
      case 'CONFIRMED':
        return 'primary';
      case 'SUBMITTED':
        return 'warning';
      case 'DRAFT':
        return 'secondary';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
  }
}
