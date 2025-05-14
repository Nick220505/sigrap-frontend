import {
  CurrencyPipe,
  DatePipe,
  NgClass,
  UpperCasePipe,
} from '@angular/common';
import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import {
  PurchaseOrderInfo,
  PurchaseOrderTrackingEventInfo,
} from '../../../models/purchase-order.model';

@Component({
  selector: 'app-tracking-detail',
  imports: [
    CardModule,
    TimelineModule,
    TagModule,
    DatePipe,
    CurrencyPipe,
    NgClass,
    ProgressSpinnerModule,
    UpperCasePipe,
  ],
  template: `
    @if (order(); as selectedOrder) {
      <p-card
        header="Detalle de Seguimiento: {{ selectedOrder.orderNumber }}"
        styleClass="mt-4"
      >
        @if (isLoadingHistory()) {
          <div class="flex justify-center items-center h-40">
            <p-progressSpinner />
          </div>
        } @else {
          <div class="grid">
            <div class="col-12 md:col-5 lg:col-4">
              <h4 class="text-xl font-semibold mt-0 mb-2">
                Información del Pedido
              </h4>
              <div class="flex flex-col gap-2 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium">ID Pedido:</span>
                  <span>{{ selectedOrder.orderNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Proveedor:</span>
                  <span>{{ selectedOrder.supplier.name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Fecha de pedido:</span>
                  <span>{{
                    selectedOrder.orderDate | date: 'yyyy-MM-dd'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Fecha de envío:</span>
                  <span>{{
                    selectedOrder.shipDate
                      ? (selectedOrder.shipDate | date: 'yyyy-MM-dd')
                      : 'N/A'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Est. de llegada:</span>
                  <span>{{
                    selectedOrder.expectedDeliveryDate
                      ? (selectedOrder.expectedDeliveryDate
                        | date: 'yyyy-MM-dd')
                      : 'N/A'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Total:</span>
                  <span>{{
                    selectedOrder.totalAmount
                      | currency: 'COP' : 'symbol' : '1.0-0'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">Estado Actual:</span>
                  <p-tag
                    [severity]="
                      getPurchaseOrderStatusSeverity(selectedOrder.status)
                    "
                    [value]="selectedOrder.status | uppercase"
                  />
                </div>
              </div>
            </div>

            <div class="col-12 md:col-7 lg:col-8">
              <h4 class="text-xl font-semibold mt-0 mb-2">
                Historial del Envío
              </h4>
              @if (history().length > 0) {
                <p-timeline
                  [value]="history()"
                  layout="vertical"
                  align="alternate"
                >
                  <ng-template pTemplate="marker" let-event>
                    <span
                      class="custom-marker shadow-md flex items-center justify-center text-white rounded-full w-8 h-8"
                      [ngClass]="getTimelineEventMarkerClass(event.status)"
                    >
                      <i [class]="getTimelineEventIcon(event.status)"></i>
                    </span>
                  </ng-template>
                  <ng-template pTemplate="content" let-event>
                    <div
                      class="p-3 mb-3 border rounded-md shadow-sm bg-gray-50"
                    >
                      <div class="font-bold text-gray-700">
                        {{ event.status }}
                      </div>
                      <div class="text-xs text-gray-500 mb-1">
                        {{ event.eventTimestamp | date: 'dd MMM yyyy, HH:mm' }}
                      </div>
                      @if (event.description) {
                        <p class="text-sm m-0 text-gray-600">
                          {{ event.description }}
                        </p>
                      }
                      @if (event.location) {
                        <span class="text-xs text-gray-500"
                          ><i class="pi pi-map-marker mr-1"></i
                          >{{ event.location }}</span
                        >
                      }
                      @if (event.notes) {
                        <p class="text-xs m-0 mt-1 text-gray-500 italic">
                          Nota: {{ event.notes }}
                        </p>
                      }
                    </div>
                  </ng-template>
                </p-timeline>
              } @else {
                <p class="text-center text-gray-500 py-4">
                  No hay historial de seguimiento disponible para este pedido.
                </p>
              }
            </div>
          </div>
        }
      </p-card>
    } @else {
      <div class="p-4 text-center text-gray-500">
        Seleccione un pedido para ver los detalles de seguimiento.
      </div>
    }
  `,
})
export class TrackingDetailComponent {
  order = input<PurchaseOrderInfo | null>(null);
  history = input<PurchaseOrderTrackingEventInfo[]>([]);
  isLoadingHistory = input<boolean>(false);

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

  getTimelineEventIcon(eventStatus: string): string {
    const lowerStatus = eventStatus?.toLowerCase();
    if (
      lowerStatus?.includes('delivered') ||
      lowerStatus?.includes('entregado')
    )
      return 'pi pi-check-circle';
    if (lowerStatus?.includes('shipped') || lowerStatus?.includes('enviado'))
      return 'pi pi-truck';
    if (lowerStatus?.includes('created') || lowerStatus?.includes('creado'))
      return 'pi pi-plus-circle';
    if (
      lowerStatus?.includes('confirmed') ||
      lowerStatus?.includes('confirmado')
    )
      return 'pi pi-thumbs-up';
    if (
      lowerStatus?.includes('submitted') ||
      lowerStatus?.includes('submitido') ||
      lowerStatus?.includes('enviado a proveedor')
    )
      return 'pi pi-send';
    if (
      lowerStatus?.includes('cancelled') ||
      lowerStatus?.includes('cancelado')
    )
      return 'pi pi-times-circle';
    if (
      lowerStatus?.includes('updated') ||
      lowerStatus?.includes('actualizado')
    )
      return 'pi pi-pencil';
    return 'pi pi-info-circle';
  }

  getTimelineEventMarkerClass(eventStatus: string): string {
    const lowerStatus = eventStatus?.toLowerCase();
    if (
      lowerStatus?.includes('delivered') ||
      lowerStatus?.includes('entregado')
    )
      return 'bg-green-500';
    if (lowerStatus?.includes('shipped') || lowerStatus?.includes('enviado'))
      return 'bg-blue-500';
    if (lowerStatus?.includes('created') || lowerStatus?.includes('creado'))
      return 'bg-teal-500';
    if (
      lowerStatus?.includes('confirmed') ||
      lowerStatus?.includes('confirmado')
    )
      return 'bg-sky-500';
    if (
      lowerStatus?.includes('submitted') ||
      lowerStatus?.includes('submitido') ||
      lowerStatus?.includes('enviado a proveedor')
    )
      return 'bg-amber-500';
    if (
      lowerStatus?.includes('cancelled') ||
      lowerStatus?.includes('cancelado')
    )
      return 'bg-red-500';
    if (
      lowerStatus?.includes('updated') ||
      lowerStatus?.includes('actualizado')
    )
      return 'bg-purple-500';
    return 'bg-gray-500';
  }
}
