import { Component, inject, viewChild } from '@angular/core';
import { PaymentStore } from '@features/supplier/stores/payment.store';
import { PaymentDialogComponent } from './payment-dialog/payment-dialog.component';
import { PaymentDistributionChartComponent } from './payment-distribution-chart/payment-distribution-chart.component';
import { PaymentStatsComponent } from './payment-stats/payment-stats.component';
import { PaymentTableComponent } from './payment-table/payment-table.component';
import { PaymentToolbarComponent } from './payment-toolbar/payment-toolbar.component';

@Component({
  selector: 'app-payments',
  imports: [
    PaymentStatsComponent,
    PaymentToolbarComponent,
    PaymentTableComponent,
    PaymentDialogComponent,
    PaymentDistributionChartComponent,
  ],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-6">Pagos a Proveedores</h1>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        <div class="col-12 md:col-span-8">
          <app-payment-stats />
        </div>
        <div class="col-12 md:col-span-4">
          <app-payment-distribution-chart />
        </div>
      </div>

      <app-payment-toolbar class="mb-4" [paymentTable]="paymentTable" />
      <app-payment-table #paymentTable />

      <app-payment-dialog />
    </div>
  `,
})
export class PaymentsComponent {
  readonly paymentStore = inject(PaymentStore);
  paymentTable = viewChild.required(PaymentTableComponent);
}
