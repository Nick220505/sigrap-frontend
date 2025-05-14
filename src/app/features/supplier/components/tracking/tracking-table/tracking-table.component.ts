import { DatePipe, UpperCasePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PurchaseOrderInfo } from '../../../models/purchase-order.model';

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
    @if (isLoading()) {
      <div class="flex justify-center items-center h-40">
        <p-progressSpinner />
      </div>
    } @else if (orders().length > 0) {
      <div class="overflow-x-auto">
        <p-table
          [value]="orders()"
          [tableStyle]="{ 'min-width': '50rem' }"
          styleClass="p-datatable-sm"
          dataKey="id"
        >
          <ng-template pTemplate="caption">
            <div class="text-xl font-semibold p-3 bg-gray-50 rounded-t-md">
              Pedidos Activos
            </div>
          </ng-template>
          <ng-template pTemplate="header">
            <tr>
              <th>ID Pedido</th>
              <th>Proveedor</th>
              <th>Fecha Pedido</th>
              <th>Est. Llegada</th>
              <th>Estado</th>
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
              <td colspan="6" class="text-center py-4">
                No hay pedidos activos para seguimiento.
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    } @else {
      <div class="p-3 bg-gray-50 rounded-md">
        <p class="text-center text-gray-500 py-4">
          No hay pedidos activos para seguimiento.
        </p>
      </div>
    }
  `,
})
export class TrackingTableComponent {
  orders = input.required<PurchaseOrderInfo[]>();
  isLoading = input<boolean>(false);
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
