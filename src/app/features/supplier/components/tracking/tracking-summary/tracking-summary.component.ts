import { Component, computed, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { PurchaseOrderInfo } from '../../../models/purchase-order.model';

@Component({
  selector: 'app-tracking-summary',
  imports: [CardModule],
  template: `
    <p-card header="Resumen de Seguimiento" styleClass="h-full">
      <div class="flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-600">Pedidos Activos:</span>
          <span class="font-bold text-lg text-blue-600">{{
            activeOrdersCount()
          }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-600">En Tránsito:</span>
          <span class="font-bold text-lg text-cyan-600">{{
            inTransitCount()
          }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-600"
            >En Preparación/Confirmados:</span
          >
          <span class="font-bold text-lg text-amber-600">{{
            inPreparationOrConfirmedCount()
          }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="font-medium text-gray-600">Con Retraso (Ejemplo):</span>
          <span class="font-bold text-lg text-red-600">{{
            delayedCount()
          }}</span>
        </div>
        <!-- More detailed summary items can be added here -->
      </div>
    </p-card>
  `,
})
export class TrackingSummaryComponent {
  orders = input.required<PurchaseOrderInfo[]>();

  activeOrdersCount = computed(() => this.orders().length);
  inTransitCount = computed(
    () => this.orders().filter((o) => o.status === 'SHIPPED').length,
  );
  // Example: Combining statuses for a summary view
  inPreparationOrConfirmedCount = computed(
    () =>
      this.orders().filter(
        (o) =>
          o.status === 'IN_PROCESS' ||
          o.status === 'CONFIRMED' ||
          o.status === 'SUBMITTED',
      ).length,
  );
  // Delayed count would require more complex logic, e.g., comparing expectedDeliveryDate with today
  // For now, this is a placeholder.
  delayedCount = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.orders().filter(
      (o) =>
        o.expectedDeliveryDate &&
        o.expectedDeliveryDate < today &&
        o.status !== 'DELIVERED' &&
        o.status !== 'CANCELLED',
    ).length;
  });
}
