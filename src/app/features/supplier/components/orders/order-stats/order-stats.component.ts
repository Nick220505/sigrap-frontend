import { Component, computed, inject } from '@angular/core';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order.store';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-order-stats',
  imports: [CardModule],
  template: `
    <div class="p-4">
      <div class="flex flex-wrap gap-4 mb-6">
        <p-card class="w-full md:w-80">
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Pedidos en Proceso</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">
                {{ ordersInProgressCount() }}
              </span>
              <i
                class="pi pi-shopping-cart text-2xl bg-blue-100 p-3 rounded-full text-blue-600"
              ></i>
            </div>
          </div>
        </p-card>

        <p-card class="w-full md:w-80">
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Pedidos Completados</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">
                {{ ordersCompletedCount() }}
              </span>
              <i
                class="pi pi-check-circle text-2xl bg-green-100 p-3 rounded-full text-green-600"
              ></i>
            </div>
          </div>
        </p-card>

        <p-card class="w-full md:w-80">
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Pedidos Pendientes</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">{{ ordersPendingCount() }}</span>
              <i
                class="pi pi-clock text-2xl bg-yellow-100 p-3 rounded-full text-yellow-600"
              ></i>
            </div>
          </div>
        </p-card>
      </div>
    </div>
  `,
})
export class OrderStatsComponent {
  private readonly purchaseOrderStore = inject(PurchaseOrderStore);

  readonly ordersInProgressCount = computed(() => {
    return this.purchaseOrderStore
      .entities()
      .filter(
        (order) => order.status === 'CONFIRMED' || order.status === 'SHIPPED',
      ).length;
  });

  readonly ordersCompletedCount = computed(() => {
    return this.purchaseOrderStore
      .entities()
      .filter((order) => order.status === 'DELIVERED').length;
  });

  readonly ordersPendingCount = computed(() => {
    return this.purchaseOrderStore
      .entities()
      .filter((order) => order.status === 'DRAFT').length;
  });
}
