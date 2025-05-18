import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { CustomerStore } from '@features/customer/stores/customer.store';
import { SaleInfo } from '@features/sales/models/sale.model';
import { SaleStore } from '@features/sales/stores/sale.store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

interface CustomerRanking {
  customer: CustomerInfo;
  purchaseCount: number;
  totalAmount: number;
}

interface ChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
    tension?: number;
  }[];
}

interface ChartTooltipContext {
  parsed: { y: number };
  label?: string;
  dataset: {
    data: number[];
  };
}

@Component({
  selector: 'app-customers-report',
  standalone: true,
  imports: [
    ChartModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    NgClass,
    TableModule,
    SkeletonModule,
    TooltipModule,
    SelectModule,
  ],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Ranking de Clientes Frecuentes</h2>

      <div class="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <p-card styleClass="h-full">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-3">
              <span class="font-medium text-sm">Periodo de Análisis</span>
              <div class="grid grid-cols-1 gap-3">
                <span class="p-float-label w-full">
                  <p-datePicker
                    [ngModel]="dateRange()[0]"
                    [showIcon]="true"
                    [maxDate]="dateRange()[1] || today"
                    dateFormat="dd/mm/yy"
                    styleClass="w-full"
                    inputId="startDate"
                    (onSelect)="updateDateRange(0, $event)"
                  ></p-datePicker>
                  <label for="startDate">Fecha Inicial</label>
                </span>

                <span class="p-float-label w-full">
                  <p-datePicker
                    [ngModel]="dateRange()[1]"
                    [showIcon]="true"
                    [minDate]="dateRange()[0]"
                    [maxDate]="today"
                    dateFormat="dd/mm/yy"
                    styleClass="w-full"
                    inputId="endDate"
                    (onSelect)="updateDateRange(1, $event)"
                  ></p-datePicker>
                  <label for="endDate">Fecha Final</label>
                </span>

                <div class="flex gap-2">
                  <button
                    pButton
                    type="button"
                    label="Aplicar"
                    icon="pi pi-filter"
                    (click)="applyDateFilter()"
                    [disabled]="!(dateRange()[0] && dateRange()[1])"
                    class="flex-grow"
                    aria-label="Aplicar filtro de fechas"
                  ></button>
                  <button
                    pButton
                    type="button"
                    label="Limpiar"
                    icon="pi pi-times"
                    class="p-button-outlined p-button-secondary flex-grow"
                    (click)="clearFilters()"
                    [disabled]="!(dateRange()[0] || dateRange()[1])"
                    aria-label="Limpiar filtros"
                  ></button>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <span class="font-medium text-sm"
                >Cantidad de clientes a mostrar</span
              >
              <p-select
                [options]="limitOptions"
                [ngModel]="customerLimitSignal()"
                (onChange)="applyRankingLimit($event)"
                styleClass="w-full"
                placeholder="Seleccionar"
                inputId="customerLimit"
              ></p-select>
            </div>

            @if (isFiltered()) {
              <div class="text-sm text-gray-500 mt-1 p-2 bg-gray-50 rounded">
                <strong>Filtros aplicados:</strong>
                @if (dateRange()[0] && dateRange()[1]) {
                  <div>
                    {{ dateRange()[0] | date: 'dd/MM/yyyy' }} -
                    {{ dateRange()[1] | date: 'dd/MM/yyyy' }}
                  </div>
                }
                @if (customerLimitSignal()) {
                  <div>Top {{ customerLimitSignal() }} clientes</div>
                }
              </div>
            }
          </div>
        </p-card>

        <p-card styleClass="h-full" header="Total de Ventas por Cliente">
          @if (saleStore.loading() || customerStore.loading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="200px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div
              class="chart-container"
              style="position: relative; height:220px;"
            >
              <p-chart
                type="bar"
                [data]="totalAmountChartData()"
                [options]="totalAmountChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>

        <p-card styleClass="h-full" header="Frecuencia de Compras por Cliente">
          @if (saleStore.loading() || customerStore.loading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="200px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div
              class="chart-container"
              style="position: relative; height:220px;"
            >
              <p-chart
                type="bar"
                [data]="frequencyChartData()"
                [options]="frequencyChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>
      </div>

      <p-card header="Distribución de Ventas" styleClass="mb-6">
        @if (saleStore.loading() || customerStore.loading()) {
          <div class="flex justify-center py-8">
            <p-skeleton height="200px" width="100%"></p-skeleton>
          </div>
        } @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              class="chart-container"
              style="position: relative; height:300px;"
            >
              <p-chart
                type="pie"
                [data]="pieChartData()"
                [options]="pieChartOptions"
              ></p-chart>
            </div>
            <div
              class="chart-container"
              style="position: relative; height:300px;"
            >
              <p-chart
                type="line"
                [data]="lineChartData()"
                [options]="lineChartOptions"
              ></p-chart>
            </div>
          </div>
        }
      </p-card>

      <p-card header="Ranking de Clientes">
        @if (saleStore.loading() || customerStore.loading()) {
          <div class="flex flex-col gap-3 py-3">
            <p-skeleton height="2.5rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
          </div>
        } @else {
          <p-table
            [value]="customerRankingData()"
            [tableStyle]="{ 'min-width': '50rem' }"
            styleClass="p-datatable-sm p-datatable-striped"
            [paginator]="true"
            [rows]="10"
          >
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 5%">Posición</th>
                <th style="width: 30%">Cliente</th>
                <th style="width: 25%">Total Compras</th>
                <th style="width: 25%">Monto Total</th>
                <th style="width: 15%">Última Compra</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-customer let-i="rowIndex">
              <tr>
                <td>
                  <span
                    [ngClass]="{
                      'bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full':
                        i === 0,
                      'bg-gray-100 text-gray-800 font-bold px-3 py-1 rounded-full':
                        i === 1,
                      'bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-full':
                        i === 2,
                      'px-3 py-1': i > 2,
                    }"
                    >{{ i + 1 }}</span
                  >
                </td>
                <td>{{ customer.customer.fullName }}</td>
                <td>{{ customer.purchaseCount }}</td>
                <td>{{ customer.totalAmount | currency }}</td>
                <td>
                  {{
                    lastPurchaseDate(customer.customer.id) | date: 'dd/MM/yyyy'
                  }}
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center p-4">
                  No se encontraron clientes con compras en el período
                  seleccionado.
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>
  `,
})
export class CustomersReportComponent implements OnInit {
  public saleStore = inject(SaleStore);
  public customerStore = inject(CustomerStore);

  dateRange = signal<Date[]>([
    null as unknown as Date,
    null as unknown as Date,
  ]);

  today = new Date();
  limitOptions = [
    { label: 'Top 5', value: 5 },
    { label: 'Top 10', value: 10 },
    { label: 'Top 15', value: 15 },
    { label: 'Top 20', value: 20 },
    { label: 'Todos', value: 999 },
  ];

  customerLimitSignal = signal<number>(10);

  customerRankingData = computed(() => {
    const sales = this.filteredSales();
    const customers = this.customerStore.entities();

    if (!sales.length || !customers.length) {
      return [];
    }

    const customerMap = new Map<number, CustomerRanking>();

    sales.forEach((sale) => {
      const customerId = sale.customer.id;
      const currentRecord = customerMap.get(customerId);

      if (currentRecord) {
        customerMap.set(customerId, {
          ...currentRecord,
          purchaseCount: currentRecord.purchaseCount + 1,
          totalAmount: currentRecord.totalAmount + sale.finalAmount,
        });
      } else {
        const customer = customers.find((c) => c.id === customerId);
        if (customer) {
          customerMap.set(customerId, {
            customer,
            purchaseCount: 1,
            totalAmount: sale.finalAmount,
          });
        }
      }
    });

    const ranking = Array.from(customerMap.values())
      .sort((a, b) => b.purchaseCount - a.purchaseCount)
      .slice(0, this.customerLimitSignal());

    return ranking;
  });

  frequencyChartData = computed<ChartDataset>(() => {
    const ranking = this.customerRankingData();

    return {
      labels: ranking.map((item) => this.truncateName(item.customer.fullName)),
      datasets: [
        {
          label: 'Número de Compras',
          data: ranking.map((item) => item.purchaseCount),
          backgroundColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#26C6DA',
            '#7E57C2',
            '#EC407A',
            '#AB47BC',
            '#26A69A',
            '#D4E157',
            '#FF7043',
          ],
        },
      ],
    };
  });

  totalAmountChartData = computed<ChartDataset>(() => {
    const ranking = this.customerRankingData();

    return {
      labels: ranking.map((item) => this.truncateName(item.customer.fullName)),
      datasets: [
        {
          label: 'Monto Total ($)',
          data: ranking.map((item) => item.totalAmount),
          backgroundColor: [
            '#26A69A',
            '#42A5F5',
            '#7E57C2',
            '#FFA726',
            '#66BB6A',
            '#EC407A',
            '#FF7043',
            '#AB47BC',
            '#26C6DA',
            '#D4E157',
          ],
        },
      ],
    };
  });

  pieChartData = computed<ChartDataset>(() => {
    const ranking = this.customerRankingData().slice(0, 5);

    return {
      labels: ranking.map((item) => this.truncateName(item.customer.fullName)),
      datasets: [
        {
          label: 'Ventas por Cliente',
          data: ranking.map((item) => item.totalAmount),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#8A2BE2',
            '#20B2AA',
            '#FF6347',
            '#6495ED',
          ],
        },
      ],
    };
  });

  lineChartData = computed<ChartDataset>(() => {
    const top3Customers = this.customerRankingData().slice(0, 3);
    const months = this.getMonthsInRange();
    const chartDatasets: {
      label: string;
      data: number[];
      borderColor: string;
      fill: boolean;
      tension: number;
    }[] = [];

    const colors = ['#FF6384', '#36A2EB', '#FFCE56'];

    top3Customers.forEach((customer, index) => {
      const customerSales = this.filteredSales().filter(
        (sale) => sale.customer.id === customer.customer.id,
      );

      const monthlySales = months.map((month) => {
        const filtered = customerSales.filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return (
            saleDate.getMonth() === month.getMonth() &&
            saleDate.getFullYear() === month.getFullYear()
          );
        });
        return filtered.reduce((sum, sale) => sum + sale.finalAmount, 0);
      });

      chartDatasets.push({
        label: this.truncateName(customer.customer.fullName),
        data: monthlySales,
        borderColor: colors[index],
        fill: false,
        tension: 0.4,
      });
    });

    return {
      labels: months.map((date) => this.formatMonth(date)),
      datasets: chartDatasets,
    };
  });

  frequencyChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Frecuencia de Compras',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `${context.parsed.y} compras`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Compras',
        },
      },
    },
  };

  totalAmountChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Total de Ventas',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `$${context.parsed.y.toFixed(2)}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Monto Total ($)',
        },
      },
    },
  };

  pieChartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribución de Ventas por Cliente (Top 5)',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            const value = context.parsed.y;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage = ((value * 100) / total).toFixed(2);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  lineChartOptions = {
    plugins: {
      title: {
        display: true,
        text: 'Evolución de Ventas (Top 3 Clientes)',
        font: {
          size: 16,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Monto de Ventas ($)',
        },
      },
    },
  };

  ngOnInit() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 3);
    this.dateRange.set([startDate, endDate]);

    this.fetchSalesByDateRange();

    this.customerStore.findAll();
  }

  updateDateRange(index: number, date: Date): void {
    const currentRange = [...this.dateRange()];
    currentRange[index] = date;
    this.dateRange.set(currentRange);
  }

  applyDateFilter() {
    if (this.dateRange()[0] && this.dateRange()[1]) {
      this.fetchSalesByDateRange();
    }
  }

  applyRankingLimit(event: SelectChangeEvent) {
    if (event && event.value !== undefined) {
      this.customerLimitSignal.set(event.value);
    }
  }

  clearFilters() {
    this.dateRange.set([null as unknown as Date, null as unknown as Date]);
    this.customerLimitSignal.set(10);

    this.saleStore.findAll();
  }

  isFiltered() {
    return (
      this.dateRange()[0] ||
      this.dateRange()[1] ||
      this.customerLimitSignal() !== 10
    );
  }

  private fetchSalesByDateRange() {
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];
    if (start && end) {
      const startStr = this.formatDate(start);
      const endStr = this.formatDate(end);
      this.saleStore.findByDateRange({ startDate: startStr, endDate: endStr });
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private filteredSales(): SaleInfo[] {
    const sales = this.saleStore.entities();

    const start = this.dateRange()[0];
    const end = this.dateRange()[1];

    if (!start || !end) {
      return sales;
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });

    return filteredSales;
  }

  public lastPurchaseDate(customerId: number): Date | null {
    const customerSales = this.filteredSales()
      .filter((sale) => sale.customer.id === customerId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    return customerSales.length > 0
      ? new Date(customerSales[0].createdAt)
      : null;
  }

  private truncateName(name: string): string {
    return name.length > 15 ? `${name.substring(0, 15)}...` : name;
  }

  private getMonthsInRange(): Date[] {
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];
    if (!start || !end) {
      const result = [];
      const endDate = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(endDate.getMonth() - i);
        result.push(date);
      }
      return result;
    }

    const months = [];
    const current = new Date(start);
    current.setDate(1);

    while (current <= end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  }

  private formatMonth(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      year: 'numeric',
    };
    return date.toLocaleDateString('es-ES', options);
  }
}
