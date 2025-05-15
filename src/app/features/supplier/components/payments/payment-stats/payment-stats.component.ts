import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PaymentStore } from '@features/supplier/stores/payment.store';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-payment-stats',
  imports: [CardModule, SkeletonModule, CurrencyPipe],
  template: `
    <div class="flex flex-wrap gap-4">
      <p-card class="w-full md:w-80">
        @if (paymentStore.isLoadingOrRefreshing()) {
          <p-skeleton height="6rem" />
        } @else {
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Pagos Pendientes</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">
                {{
                  paymentStore.pendingPaymentsAmount()
                    | currency: 'COP' : 'S/' : '1.0-0'
                }}
              </span>
              <i
                class="pi pi-hourglass text-2xl bg-blue-100 p-3 rounded-full text-blue-600"
              ></i>
            </div>
            <div class="mt-1 text-sm text-gray-500">Próximos 30 días</div>
          </div>
        }
      </p-card>

      <p-card class="w-full md:w-80">
        @if (paymentStore.isLoadingOrRefreshing()) {
          <p-skeleton height="6rem" />
        } @else {
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Pagos Realizados</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">
                {{
                  paymentStore.completedPaymentsLast30DaysAmount()
                    | currency: 'COP' : 'S/' : '1.0-0'
                }}
              </span>
              <i
                class="pi pi-check-circle text-2xl bg-green-100 p-3 rounded-full text-green-600"
              ></i>
            </div>
            <div class="mt-1 text-sm text-gray-500">Últimos 30 días</div>
          </div>
        }
      </p-card>

      <p-card class="w-full md:w-80">
        @if (paymentStore.isLoadingOrRefreshing()) {
          <p-skeleton height="6rem" />
        } @else {
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Facturas Vencidas</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">
                {{ paymentStore.overdueInvoicesCount() }}
              </span>
              <i
                class="pi pi-exclamation-triangle text-2xl bg-yellow-100 p-3 rounded-full text-yellow-600"
              ></i>
            </div>
            <div class="mt-1 text-sm text-gray-500">
              Total:
              {{
                paymentStore.overdueInvoicesAmount()
                  | currency: 'COP' : 'S/' : '1.0-0'
              }}
            </div>
          </div>
        }
      </p-card>

      <p-card class="w-full md:w-80">
        @if (paymentStore.isLoadingOrRefreshing()) {
          <p-skeleton height="6rem" />
        } @else {
          <div class="flex flex-col gap-2">
            <h5 class="m-0 text-lg font-semibold">Próximos Pagos</h5>
            <div class="flex items-center justify-between">
              <span class="text-4xl font-bold">
                {{ paymentStore.upcomingPaymentsNext7DaysCount() }}
              </span>
              <i
                class="pi pi-calendar text-2xl bg-purple-100 p-3 rounded-full text-purple-600"
              ></i>
            </div>
            <div class="mt-1 text-sm text-gray-500">En los próximos 7 días</div>
          </div>
        }
      </p-card>
    </div>
  `,
})
export class PaymentStatsComponent {
  readonly paymentStore = inject(PaymentStore);
}
