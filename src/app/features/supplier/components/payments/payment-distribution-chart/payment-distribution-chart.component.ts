import { Component, computed, inject } from '@angular/core';
import { PaymentStore } from '@features/supplier/stores/payment.store';
import { TooltipItem } from 'chart.js/auto';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-payment-distribution-chart',
  imports: [ChartModule, SkeletonModule, CardModule],
  template: `
    <p-card styleClass="h-full flex flex-col shadow-md">
      <ng-template pTemplate="title">
        <h5 class="text-lg font-semibold mb-0 text-gray-700 dark:text-gray-300">
          Distribución de Pagos por Proveedor
        </h5>
      </ng-template>
      <ng-template pTemplate="content">
        @if (chartDataLoaded() && pieChartData(); as chartData) {
          <div
            class="flex-grow flex items-center justify-center pt-4"
            style="position: relative; min-height: 250px;"
          >
            <p-chart
              type="pie"
              [data]="chartData"
              [options]="pieChartOptions"
            ></p-chart>
          </div>
          @if (
            chartData.labels &&
            chartData.labels.length > 0 &&
            chartData.datasets &&
            chartData.datasets.length > 0 &&
            chartData.datasets[0].backgroundColor
          ) {
            <div class="mt-4 border-t pt-3 dark:border-gray-700">
              <div
                class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2"
              >
                Leyenda Personalizada:
              </div>
              <ul class="list-none p-0 m-0 flex flex-wrap gap-x-4 gap-y-2">
                @for (item of chartData.labels; track item; let i = $index) {
                  <li class="flex items-center">
                    <span
                      class="inline-block w-3 h-3 rounded-full mr-2"
                      [style.backgroundColor]="
                        chartData.datasets[0].backgroundColor![i]
                      "
                    ></span>
                    <span class="text-xs text-gray-500 dark:text-gray-400">{{
                      item
                    }}</span>
                  </li>
                }
              </ul>
            </div>
          }
        } @else if (paymentStore.isLoadingOrRefreshing()) {
          <div class="flex-grow flex items-center justify-center">
            <p-skeleton height="250px" width="100%"></p-skeleton>
          </div>
        } @else {
          <div
            class="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400"
          >
            <p>No hay datos suficientes para mostrar el gráfico.</p>
          </div>
        }
      </ng-template>
    </p-card>
  `,
})
export class PaymentDistributionChartComponent {
  readonly paymentStore = inject(PaymentStore);

  readonly pieChartData = computed(() => {
    const payments = this.paymentStore.entities();
    if (!payments || payments.length === 0) {
      return null;
    }

    const dataBySupplier: Record<string, number> = {};
    payments.forEach((payment) => {
      if (payment.supplierName && payment.amount) {
        dataBySupplier[payment.supplierName] =
          (dataBySupplier[payment.supplierName] || 0) + payment.amount;
      }
    });

    const labels = Object.keys(dataBySupplier);
    const data = Object.values(dataBySupplier);

    if (labels.length === 0) return null;

    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#AB47BC',
            '#FF7043',
            '#26A69A',
            '#EC407A',
            '#78909C',
          ],
          hoverBackgroundColor: [
            '#64B5F6',
            '#81C784',
            '#FFB74D',
            '#BA68C8',
            '#FF8A65',
            '#4DB6AC',
            '#F06292',
            '#90A4AE',
          ],
        },
      ],
    };
  });

  readonly chartDataLoaded = computed(() => !!this.pieChartData());

  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: 'bottom' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'pie'>) => {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed !== null) {
              label += new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(context.parsed);
            }
            return label;
          },
        },
      },
    },
  };
}
