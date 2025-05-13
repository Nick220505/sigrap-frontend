import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { StepsModule } from 'primeng/steps';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { TooltipModule } from 'primeng/tooltip';

interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  description: string;
  location: string;
}

interface OrderTracking {
  id: string;
  supplier: string;
  orderDate: string;
  shipDate: string;
  estimatedArrival: string;
  status: string;
  total: string;
  shippingMethod: string;
  trackingNumber: string;
  trackingEvents: TrackingEvent[];
}

@Component({
  selector: 'app-tracking',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    TagModule,
    TimelineModule,
    StepsModule,
    TooltipModule,
  ],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Seguimiento de Pedidos</h1>

      <div class="grid">
        <div class="col-12 lg:col-8">
          <p-card header="Pedidos en Tránsito" styleClass="mb-4">
            <div class="overflow-x-auto">
              <p-table
                [value]="ordersInTransit"
                [tableStyle]="{ 'min-width': '50rem' }"
                styleClass="p-datatable-sm"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th>ID Pedido</th>
                    <th>Proveedor</th>
                    <th>Fecha Envío</th>
                    <th>Est. Llegada</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-order>
                  <tr>
                    <td>{{ order.id }}</td>
                    <td>{{ order.supplier }}</td>
                    <td>{{ order.shipDate }}</td>
                    <td>{{ order.estimatedArrival }}</td>
                    <td>
                      <p-tag
                        [severity]="getStatusSeverity(order.status)"
                        [value]="order.status"
                      />
                    </td>
                    <td>
                      <div class="flex gap-1 justify-center">
                        <p-button
                          icon="pi pi-eye"
                          styleClass="p-button-rounded p-button-text"
                          (onClick)="selectOrder(order)"
                          pTooltip="Ver detalles"
                          tooltipPosition="top"
                        />
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </p-card>
        </div>

        <div class="col-12 lg:col-4">
          <p-card header="Resumen" styleClass="mb-4">
            <div class="flex flex-col gap-3">
              <div class="flex justify-between">
                <span class="font-semibold">Total pedidos activos:</span>
                <span>6</span>
              </div>
              <div class="flex justify-between">
                <span class="font-semibold">En tránsito:</span>
                <span>3</span>
              </div>
              <div class="flex justify-between">
                <span class="font-semibold">En preparación:</span>
                <span>2</span>
              </div>
              <div class="flex justify-between">
                <span class="font-semibold">Con retraso:</span>
                <span class="text-red-500 font-bold">1</span>
              </div>
              <div class="flex justify-between">
                <span class="font-semibold">Entregados (este mes):</span>
                <span>8</span>
              </div>
            </div>
          </p-card>
        </div>
      </div>

      @if (selectedOrder()) {
        <p-card header="Detalle de Seguimiento" styleClass="mt-4">
          <div class="grid">
            <div class="col-12 md:col-5 lg:col-4">
              <h4 class="text-xl font-semibold mt-0 mb-2">
                Información del Pedido
              </h4>
              <div class="flex flex-col gap-2">
                <div class="flex justify-between">
                  <span class="font-medium">ID Pedido:</span>
                  <span>{{ selectedOrder()?.id }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Proveedor:</span>
                  <span>{{ selectedOrder()?.supplier }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Fecha de pedido:</span>
                  <span>{{ selectedOrder()?.orderDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Fecha de envío:</span>
                  <span>{{ selectedOrder()?.shipDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Est. de llegada:</span>
                  <span>{{ selectedOrder()?.estimatedArrival }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Método de envío:</span>
                  <span>{{ selectedOrder()?.shippingMethod }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Número de rastreo:</span>
                  <span>{{ selectedOrder()?.trackingNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Total:</span>
                  <span>{{ selectedOrder()?.total }}</span>
                </div>
              </div>
            </div>

            <div class="col-12 md:col-7 lg:col-8">
              <h4 class="text-xl font-semibold mt-0 mb-2">Estado del Envío</h4>
              <p-timeline
                [value]="selectedOrder()?.trackingEvents || []"
                layout="vertical"
              >
                <ng-template pTemplate="content" let-event>
                  <div class="flex flex-col gap-1">
                    <small class="text-xs text-gray-500">{{
                      event.date
                    }}</small>
                    <span class="font-medium">{{ event.status }}</span>
                    <p class="text-sm m-0">{{ event.description }}</p>
                    <span class="text-sm text-gray-500">{{
                      event.location
                    }}</span>
                  </div>
                </ng-template>
                <ng-template pTemplate="opposite" let-event>
                  <p-tag
                    [severity]="getEventSeverity(event.status)"
                    [value]="event.time"
                  />
                </ng-template>
              </p-timeline>
            </div>
          </div>
        </p-card>
      }
    </div>
  `,
})
export class TrackingComponent {
  ordersInTransit: OrderTracking[] = [
    {
      id: 'ORD-002',
      supplier: 'Tai Loy',
      orderDate: '2024-04-20',
      shipDate: '2024-04-22',
      estimatedArrival: '2024-04-30',
      status: 'En Tránsito',
      total: 'S/ 3,480.50',
      shippingMethod: 'Transporte Terrestre',
      trackingNumber: 'TL-5678-90',
      trackingEvents: [
        {
          date: '22 Abril, 2024',
          time: '09:30',
          status: 'Enviado',
          description:
            'El pedido ha sido enviado desde el almacén del proveedor',
          location: 'Lima, Perú',
        },
        {
          date: '23 Abril, 2024',
          time: '14:15',
          status: 'En Tránsito',
          description: 'El pedido está en camino',
          location: 'Carretera Central, Perú',
        },
        {
          date: '25 Abril, 2024',
          time: '08:45',
          status: 'En Distribución',
          description: 'El pedido está en proceso de distribución local',
          location: 'Lima, Perú',
        },
      ],
    },
    {
      id: 'ORD-005',
      supplier: 'Office Depot',
      orderDate: '2024-05-01',
      shipDate: '2024-05-03',
      estimatedArrival: '2024-05-10',
      status: 'En Preparación',
      total: 'S/ 2,340.25',
      shippingMethod: 'Envío Aéreo',
      trackingNumber: 'OD-1234-56',
      trackingEvents: [
        {
          date: '01 Mayo, 2024',
          time: '11:20',
          status: 'Pedido Recibido',
          description: 'El pedido ha sido recibido por el proveedor',
          location: 'Ciudad de México, México',
        },
        {
          date: '03 Mayo, 2024',
          time: '16:40',
          status: 'En Preparación',
          description: 'El pedido está siendo preparado para el envío',
          location: 'Ciudad de México, México',
        },
      ],
    },
    {
      id: 'ORD-006',
      supplier: 'Artesco',
      orderDate: '2024-04-28',
      shipDate: '2024-04-30',
      estimatedArrival: '2024-05-05',
      status: 'Con Retraso',
      total: 'S/ 1,750.00',
      shippingMethod: 'Transporte Terrestre',
      trackingNumber: 'AR-9012-34',
      trackingEvents: [
        {
          date: '28 Abril, 2024',
          time: '10:05',
          status: 'Pedido Recibido',
          description: 'El pedido ha sido recibido por el proveedor',
          location: 'Lima, Perú',
        },
        {
          date: '30 Abril, 2024',
          time: '14:30',
          status: 'En Preparación',
          description: 'El pedido está siendo preparado para el envío',
          location: 'Lima, Perú',
        },
        {
          date: '02 Mayo, 2024',
          time: '09:15',
          status: 'Enviado',
          description:
            'El pedido ha sido enviado desde el almacén del proveedor',
          location: 'Lima, Perú',
        },
        {
          date: '04 Mayo, 2024',
          time: '18:20',
          status: 'Con Retraso',
          description:
            'El envío presenta un retraso debido a condiciones climáticas',
          location: 'Carretera Central, Perú',
        },
      ],
    },
  ];

  readonly selectedOrder = signal<OrderTracking | null>(null);

  selectOrder(order: OrderTracking): void {
    this.selectedOrder.set(order);
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Entregado':
        return 'success';
      case 'En Tránsito':
        return 'info';
      case 'En Preparación':
        return 'warning';
      case 'Con Retraso':
        return 'danger';
      default:
        return 'info';
    }
  }

  getEventSeverity(status: string): string {
    switch (status) {
      case 'Entregado':
        return 'success';
      case 'Enviado':
        return 'success';
      case 'En Tránsito':
        return 'info';
      case 'En Distribución':
        return 'info';
      case 'En Preparación':
        return 'warning';
      case 'Pedido Recibido':
        return 'success';
      case 'Con Retraso':
        return 'danger';
      default:
        return 'info';
    }
  }
}
