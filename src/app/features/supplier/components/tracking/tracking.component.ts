import { Component, inject } from '@angular/core';
import { OrderTrackingStore } from '../../stores/order-tracking.store';
import { TrackingDetailComponent } from './tracking-detail/tracking-detail.component';
import { TrackingSummaryComponent } from './tracking-summary/tracking-summary.component';
import { TrackingTableComponent } from './tracking-table/tracking-table.component';

@Component({
  selector: 'app-tracking',
  imports: [
    TrackingTableComponent,
    TrackingDetailComponent,
    TrackingSummaryComponent,
  ],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-6 text-gray-800">
        Seguimiento de Pedidos a Proveedores
      </h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <app-tracking-table
            [orders]="store.trackableOrders()"
            [isLoading]="store.isLoadingOrders()"
            (viewOrderDetails)="store.selectOrderAndLoadHistory($event)"
          />
        </div>

        <div class="lg:col-span-1">
          <app-tracking-summary [orders]="store.trackableOrders()" />
        </div>
      </div>

      @if (store.hasSelectedOrder()) {
        <div class="mt-6">
          <app-tracking-detail
            [order]="store.selectedOrder()"
            [history]="store.trackingHistory()"
            [isLoadingHistory]="store.isLoadingHistory()"
          />
        </div>
      }
    </div>
  `,
})
export class TrackingComponent {
  readonly store = inject(OrderTrackingStore);
}
