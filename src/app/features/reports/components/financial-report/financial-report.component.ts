import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SaleReturnInfo } from '@features/sales/models/sale-return.model';
import { SaleInfo } from '@features/sales/models/sale.model';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { SaleStore } from '@features/sales/stores/sale.store';
import { PurchaseOrderInfo } from '@features/supplier/models/purchase-order.model';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order.store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

interface FinancialSummary {
  period: string;
  revenue: number;
  expenses: number;
  returns: number;
  profit: number;
  profitMargin: number;
}

interface MonthlySummary {
  month: string;
  revenue: number;
  expenses: number;
  returns: number;
  profit: number;
}

interface ChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    fill?: boolean;
    tension?: number;
    stack?: string;
    type?: string;
  }[];
}

interface ChartTooltipContext {
  parsed: { y: number };
  label?: string;
  dataset: {
    label: string;
    data: number[];
  };
}

interface PieChartTooltipContext {
  parsed: number;
  label?: string;
  dataset: {
    data: number[];
  };
}

@Component({
  selector: 'app-financial-report',
  imports: [
    ChartModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    FormsModule,
    CurrencyPipe,
    DecimalPipe,
    NgClass,
    TableModule,
    SkeletonModule,
    TooltipModule,
    ToolbarModule,
  ],
  template: `
    <div class="p-4" id="reportContent">
      <h2 class="text-2xl font-bold mb-4">Reportes Financieros</h2>

      <p-toolbar styleClass="mb-6">
        <ng-template #start>
          <div class="flex flex-wrap items-center gap-3 mr-3">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm whitespace-nowrap"
                >Fecha Inicial:</span
              >
              <p-datePicker
                [ngModel]="dateRange()[0]"
                [showIcon]="true"
                [maxDate]="dateRange()[1] || today"
                dateFormat="dd/mm/yy"
                styleClass="mr-2"
                inputId="startDate"
                (onSelect)="updateDateRange(0, $event)"
              ></p-datePicker>
            </div>

            <div class="flex items-center gap-2">
              <span class="font-medium text-sm whitespace-nowrap"
                >Fecha Final:</span
              >
              <p-datePicker
                [ngModel]="dateRange()[1]"
                [showIcon]="true"
                [minDate]="dateRange()[0]"
                [maxDate]="today"
                dateFormat="dd/mm/yy"
                inputId="endDate"
                (onSelect)="updateDateRange(1, $event)"
              ></p-datePicker>
            </div>
          </div>
        </ng-template>

        <ng-template #end>
          <div class="flex gap-2">
            <p-button
              label="Exportar PDF"
              icon="pi pi-file-pdf"
              styleClass="p-button-help"
              (onClick)="exportToPDF()"
              [loading]="isExporting()"
              pTooltip="Exportar reporte en PDF"
              tooltipPosition="top"
            ></p-button>
            <p-button
              label="Aplicar"
              icon="pi pi-filter"
              (onClick)="applyDateFilter()"
              [disabled]="!(dateRange()[0] && dateRange()[1])"
              pTooltip="Aplicar filtro de fechas"
              tooltipPosition="top"
            ></p-button>
            <p-button
              label="Limpiar"
              icon="pi pi-times"
              styleClass="p-button-outlined p-button-secondary"
              (onClick)="clearFilters()"
              [disabled]="!(dateRange()[0] || dateRange()[1])"
              pTooltip="Limpiar todos los filtros"
              tooltipPosition="top"
            ></p-button>
          </div>
        </ng-template>
      </p-toolbar>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <p-card styleClass="h-full">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Ingresos Totales</h3>
            @if (isDataLoading()) {
              <p-skeleton
                height="2rem"
                width="80%"
                styleClass="mb-2"
              ></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-green-600">{{
                totalRevenue() | currency: 'COP' : '$' : '1.0-0'
              }}</span>
            }
          </div>
        </p-card>

        <p-card styleClass="h-full">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Gastos Totales</h3>
            @if (isDataLoading()) {
              <p-skeleton
                height="2rem"
                width="80%"
                styleClass="mb-2"
              ></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-red-600">{{
                totalExpenses() | currency: 'COP' : '$' : '1.0-0'
              }}</span>
            }
          </div>
        </p-card>

        <p-card styleClass="h-full">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Utilidad</h3>
            @if (isDataLoading()) {
              <p-skeleton
                height="2rem"
                width="80%"
                styleClass="mb-2"
              ></p-skeleton>
            } @else {
              <span
                class="text-3xl font-bold"
                [ngClass]="{
                  'text-green-600': totalProfit() > 0,
                  'text-red-600': totalProfit() < 0,
                  'text-gray-600': totalProfit() === 0,
                }"
                >{{ totalProfit() | currency: 'COP' : '$' : '1.0-0' }}</span
              >
              <span
                class="text-lg mt-1"
                [ngClass]="{
                  'text-green-600': profitMargin() > 0,
                  'text-red-600': profitMargin() < 0,
                  'text-gray-600': profitMargin() === 0,
                }"
                >{{ profitMargin() | number: '1.1-1' }}%</span
              >
            }
          </div>
        </p-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <p-card styleClass="h-full" header="Tendencia Mensual de Utilidad">
          @if (isDataLoading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="300px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div
              class="chart-container"
              style="position: relative; height: 300px;"
            >
              <p-chart
                type="bar"
                [data]="monthlyProfitChartData()"
                [options]="monthlyProfitChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>

        <p-card styleClass="h-full" header="Comparativa de Ingresos y Gastos">
          @if (isDataLoading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="300px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div
              class="chart-container"
              style="position: relative; height: 300px;"
            >
              <p-chart
                type="line"
                [data]="revenueExpensesChartData()"
                [options]="revenueExpensesChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>
      </div>

      <p-card header="Distribución Financiera" styleClass="mb-6">
        @if (isDataLoading()) {
          <div class="flex justify-center py-8">
            <p-skeleton height="300px" width="100%"></p-skeleton>
          </div>
        } @else {
          <div
            class="chart-container"
            style="position: relative; height: 320px;"
          >
            <p-chart
              type="doughnut"
              [data]="distributionChartData()"
              [options]="distributionChartOptions"
            ></p-chart>
          </div>
        }
      </p-card>

      <p-card header="Resumen Financiero por Periodos">
        @if (isDataLoading()) {
          <div class="flex flex-col gap-3 py-3">
            <p-skeleton height="2.5rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
          </div>
        } @else {
          <p-table
            [value]="financialSummaries()"
            styleClass="p-datatable-sm p-datatable-striped"
            [paginator]="true"
            [rows]="10"
          >
            <ng-template pTemplate="header">
              <tr>
                <th>Periodo</th>
                <th>Ingresos</th>
                <th>Gastos</th>
                <th>Devoluciones</th>
                <th>Utilidad</th>
                <th>Margen de Utilidad</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-summary>
              <tr>
                <td>{{ summary.period }}</td>
                <td>{{ summary.revenue | currency: 'COP' : '$' : '1.0-0' }}</td>
                <td>
                  {{ summary.expenses | currency: 'COP' : '$' : '1.0-0' }}
                </td>
                <td>{{ summary.returns | currency: 'COP' : '$' : '1.0-0' }}</td>
                <td>
                  <span
                    [ngClass]="{
                      'text-green-600 font-medium': summary.profit > 0,
                      'text-red-600 font-medium': summary.profit < 0,
                    }"
                    >{{
                      summary.profit | currency: 'COP' : '$' : '1.0-0'
                    }}</span
                  >
                </td>
                <td>
                  <span
                    [ngClass]="{
                      'text-green-600 font-medium': summary.profitMargin > 0,
                      'text-red-600 font-medium': summary.profitMargin < 0,
                    }"
                    >{{ summary.profitMargin | number: '1.1-1' }}%</span
                  >
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center p-4">
                  No hay datos financieros disponibles para el período
                  seleccionado.
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>

    <!-- Hidden container for PDF export -->
    <div class="p-4" id="exportContent" style="display: none;">
      <h2 class="text-2xl font-bold mb-4">Reporte Financiero</h2>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="p-4 border rounded-lg bg-white">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Ingresos Totales</h3>
            <span class="text-3xl font-bold text-green-600">{{
              totalRevenue() | currency: 'COP' : '$' : '1.0-0'
            }}</span>
          </div>
        </div>

        <div class="p-4 border rounded-lg bg-white">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Gastos Totales</h3>
            <span class="text-3xl font-bold text-red-600">{{
              totalExpenses() | currency: 'COP' : '$' : '1.0-0'
            }}</span>
          </div>
        </div>

        <div class="p-4 border rounded-lg bg-white">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Utilidad</h3>
            <span
              class="text-3xl font-bold"
              [ngClass]="{
                'text-green-600': totalProfit() > 0,
                'text-red-600': totalProfit() < 0,
                'text-gray-600': totalProfit() === 0,
              }"
              >{{ totalProfit() | currency: 'COP' : '$' : '1.0-0' }}</span
            >
            <span
              class="text-lg mt-1"
              [ngClass]="{
                'text-green-600': profitMargin() > 0,
                'text-red-600': profitMargin() < 0,
                'text-gray-600': profitMargin() === 0,
              }"
              >{{ profitMargin() | number: '1.1-1' }}%</span
            >
          </div>
        </div>
      </div>

      <div class="mt-6 p-4 border rounded-lg bg-white">
        <h3 class="text-xl font-semibold mb-4">
          Resumen Financiero por Periodos
        </h3>
        <table class="w-full">
          <thead>
            <tr class="border-b">
              <th class="p-2 text-left">Periodo</th>
              <th class="p-2 text-right">Ingresos</th>
              <th class="p-2 text-right">Gastos</th>
              <th class="p-2 text-right">Devoluciones</th>
              <th class="p-2 text-right">Utilidad</th>
              <th class="p-2 text-right">Margen de Utilidad</th>
            </tr>
          </thead>
          <tbody>
            @for (summary of financialSummaries(); track summary.period) {
              <tr class="border-b">
                <td class="p-2">{{ summary.period }}</td>
                <td class="p-2 text-right">
                  {{ summary.revenue | currency: 'COP' : '$' : '1.0-0' }}
                </td>
                <td class="p-2 text-right">
                  {{ summary.expenses | currency: 'COP' : '$' : '1.0-0' }}
                </td>
                <td class="p-2 text-right">
                  {{ summary.returns | currency: 'COP' : '$' : '1.0-0' }}
                </td>
                <td class="p-2 text-right">
                  <span
                    [ngClass]="{
                      'text-green-600 font-medium': summary.profit > 0,
                      'text-red-600 font-medium': summary.profit < 0,
                    }"
                    >{{
                      summary.profit | currency: 'COP' : '$' : '1.0-0'
                    }}</span
                  >
                </td>
                <td class="p-2 text-right">
                  <span
                    [ngClass]="{
                      'text-green-600 font-medium': summary.profitMargin > 0,
                      'text-red-600 font-medium': summary.profitMargin < 0,
                    }"
                    >{{ summary.profitMargin | number: '1.1-1' }}%</span
                  >
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class FinancialReportComponent implements OnInit {
  saleStore = inject(SaleStore);
  saleReturnStore = inject(SaleReturnStore);
  purchaseOrderStore = inject(PurchaseOrderStore);

  dateRange = signal<Date[]>([
    null as unknown as Date,
    null as unknown as Date,
  ]);

  today = new Date();

  isDataLoading = computed(() => {
    return (
      this.saleStore.loading() ||
      this.saleReturnStore.loading() ||
      this.purchaseOrderStore.loading()
    );
  });

  filteredSales = computed<SaleInfo[]>(() => {
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

    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });
  });

  filteredSaleReturns = computed<SaleReturnInfo[]>(() => {
    const returns = this.saleReturnStore.entities();
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];

    if (!start || !end) {
      return returns;
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    return returns.filter((returnItem) => {
      const returnDate = new Date(returnItem.createdAt);
      return returnDate >= startDate && returnDate <= endDate;
    });
  });

  filteredPurchaseOrders = computed<PurchaseOrderInfo[]>(() => {
    const orders = this.purchaseOrderStore.entities();
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];

    if (!start || !end) {
      return orders.filter(
        (order) => order.status === 'DELIVERED' || order.status === 'PAID',
      );
    }

    const startDate = new Date(start);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt as string);
      return (
        orderDate >= startDate &&
        orderDate <= endDate &&
        (order.status === 'DELIVERED' || order.status === 'PAID')
      );
    });
  });

  totalRevenue = computed(() => {
    return this.filteredSales().reduce(
      (total, sale) => total + sale.finalAmount,
      0,
    );
  });

  totalReturns = computed(() => {
    return this.filteredSaleReturns().reduce(
      (total, returnItem) => total + returnItem.totalReturnAmount,
      0,
    );
  });

  totalExpenses = computed(() => {
    return this.filteredPurchaseOrders().reduce(
      (total, order) => total + order.totalAmount,
      0,
    );
  });

  totalProfit = computed(() => {
    return this.totalRevenue() - this.totalExpenses() - this.totalReturns();
  });

  profitMargin = computed(() => {
    const revenue = this.totalRevenue();
    if (revenue === 0) return 0;
    return (this.totalProfit() / revenue) * 100;
  });

  monthlySummaries = computed<MonthlySummary[]>(() => {
    const months = this.getMonthsInRange();
    if (months.length === 0) {
      return [];
    }

    const summaries = months.map((date) => {
      const monthStr = this.formatMonthKey(date);

      const monthlySales = this.getSalesByMonth(date);
      const monthlyReturns = this.getReturnsByMonth(date);
      const monthlyOrders = this.getOrdersByMonth(date);

      const revenue = monthlySales.reduce((sum, s) => sum + s.finalAmount, 0);
      const expenses = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const returns = monthlyReturns.reduce(
        (sum, r) => sum + r.totalReturnAmount,
        0,
      );
      const profit = revenue - expenses - returns;

      return {
        month: monthStr,
        revenue,
        expenses,
        returns,
        profit,
      };
    });

    return summaries.filter(
      (s) => s.revenue > 0 || s.expenses > 0 || s.returns > 0,
    );
  });

  financialSummaries = computed<FinancialSummary[]>(() => {
    const monthlySummary = this.monthlySummaries();

    const weeklyData = this.getWeeklySummaries();

    const allSummaries = [
      ...weeklyData.map((week) => ({
        period: week.label,
        revenue: week.revenue,
        expenses: week.expenses,
        returns: week.returns,
        profit: week.revenue - week.expenses - week.returns,
        profitMargin:
          week.revenue > 0
            ? ((week.revenue - week.expenses - week.returns) / week.revenue) *
              100
            : 0,
      })),
      ...monthlySummary.map((month) => ({
        period: this.formatMonthDisplay(month.month),
        revenue: month.revenue,
        expenses: month.expenses,
        returns: month.returns,
        profit: month.profit,
        profitMargin:
          month.revenue > 0 ? (month.profit / month.revenue) * 100 : 0,
      })),
    ];

    return allSummaries.sort((a, b) => {
      const aDate = this.extractDateFromPeriod(a.period);
      const bDate = this.extractDateFromPeriod(b.period);
      return bDate.getTime() - aDate.getTime();
    });
  });

  monthlyProfitChartData = computed<ChartDataset>(() => {
    const summaries = this.monthlySummaries();

    if (!summaries.length) {
      return {
        labels: [],
        datasets: [{ label: 'Utilidad', data: [] }],
      };
    }

    const sortedData = [...summaries].sort((a, b) =>
      this.compareDates(a.month, b.month),
    );

    return {
      labels: sortedData.map((item) => this.formatMonthDisplay(item.month)),
      datasets: [
        {
          type: 'line',
          label: 'Utilidad',
          data: sortedData.map((item) => item.profit),
          backgroundColor: sortedData.map((item) =>
            item.profit >= 0
              ? 'rgba(75, 192, 192, 0.2)'
              : 'rgba(255, 99, 132, 0.2)',
          ),
          borderColor: '#22c55e',
          fill: false,
          tension: 0.4,
        },
        {
          type: 'bar',
          label: 'Ingresos',
          data: sortedData.map((item) => item.revenue),
          backgroundColor: '#4CAF50',
          stack: 'stack0',
        },
        {
          type: 'bar',
          label: 'Gastos',
          data: sortedData.map((item) => item.expenses),
          backgroundColor: '#F44336',
          stack: 'stack1',
        },
        {
          type: 'bar',
          label: 'Devoluciones',
          data: sortedData.map((item) => item.returns),
          backgroundColor: '#FF9800',
          stack: 'stack2',
        },
      ],
    };
  });

  revenueExpensesChartData = computed<ChartDataset>(() => {
    const summaries = this.monthlySummaries();

    if (!summaries.length) {
      return {
        labels: [],
        datasets: [{ label: 'Ingresos', data: [] }],
      };
    }

    const sortedData = [...summaries].sort((a, b) =>
      this.compareDates(a.month, b.month),
    );

    return {
      labels: sortedData.map((item) => this.formatMonthDisplay(item.month)),
      datasets: [
        {
          label: 'Ingresos',
          data: sortedData.map((item) => item.revenue),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Gastos',
          data: sortedData.map((item) => item.expenses),
          borderColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  });

  distributionChartData = computed<ChartDataset>(() => {
    const revenue = this.totalRevenue();
    const returns = this.totalReturns();
    const expenses = this.totalExpenses();
    const profit = revenue - expenses - returns;

    const costOfGoods = expenses * 0.8;
    const operatingExpenses = expenses * 0.2;

    return {
      labels: [
        'Costo de Mercancía',
        'Gastos Operativos',
        'Devoluciones',
        'Utilidad',
      ],
      datasets: [
        {
          label: 'Distribución Financiera',
          data: [
            costOfGoods,
            operatingExpenses,
            returns,
            profit > 0 ? profit : 0,
          ],
          backgroundColor: ['#FF9800', '#9C27B0', '#F44336', '#4CAF50'],
        },
      ],
    };
  });

  monthlyProfitChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}`;
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
          text: 'Monto (COP)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Mes',
        },
      },
    },
  };

  revenueExpensesChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `${context.dataset.label}: ${context.parsed.y.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}`;
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
          text: 'Monto (COP)',
        },
      },
    },
  };

  distributionChartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: PieChartTooltipContext) => {
            const value = context.parsed ?? 0;
            const total = context.dataset.data.reduce(
              (acc: number, val: number) => acc + val,
              0,
            );
            const percentage =
              total > 0 ? ((value * 100) / total).toFixed(1) : '0';
            return `${context.label}: ${value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })} (${percentage}%)`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  ngOnInit() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    this.dateRange.set([startDate, endDate]);

    this.fetchData();
  }

  updateDateRange(index: number, date: Date): void {
    const currentRange = [...this.dateRange()];
    currentRange[index] = date;
    this.dateRange.set(currentRange);
  }

  applyDateFilter() {
    if (this.dateRange()[0] && this.dateRange()[1]) {
      this.fetchData();
    }
  }

  clearFilters() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    this.dateRange.set([startDate, endDate]);
    this.fetchData();
  }

  private fetchData() {
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];

    if (start && end) {
      const startStr = this.formatDate(start);
      const endStr = this.formatDate(end);

      this.saleStore.findAll();
      this.saleReturnStore.loadAll();
      this.purchaseOrderStore.findAll();

      setTimeout(() => {
        if (this.saleStore.entities().length === 0) {
          this.saleStore.findByDateRange({
            startDate: startStr,
            endDate: endStr,
          });
        }
      }, 500);
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private formatMonthDisplay(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('es-ES', {
      month: 'long',
      year: 'numeric',
    });
  }

  private getMonthsInRange(): Date[] {
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];
    if (!start || !end) {
      return [];
    }

    const months = [];
    const sales = this.filteredSales();
    const returns = this.filteredSaleReturns();
    const orders = this.filteredPurchaseOrders();

    if (sales.length === 0 && returns.length === 0 && orders.length === 0) {
      return [];
    }

    let earliestDate = start;

    if (sales.length > 0) {
      const earliestSale = sales.reduce((earliest, sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate < earliest ? saleDate : earliest;
      }, new Date());

      if (earliestSale < earliestDate) earliestDate = earliestSale;
    }

    if (returns.length > 0) {
      const earliestReturn = returns.reduce((earliest, ret) => {
        const returnDate = new Date(ret.createdAt);
        return returnDate < earliest ? returnDate : earliest;
      }, new Date());

      if (earliestReturn < earliestDate) earliestDate = earliestReturn;
    }

    if (orders.length > 0) {
      const earliestOrder = orders.reduce((earliest, order) => {
        const orderDate = new Date(order.createdAt as string);
        return orderDate < earliest ? orderDate : earliest;
      }, new Date());

      if (earliestOrder < earliestDate) earliestDate = earliestOrder;
    }

    const currentDate = new Date(earliestDate);
    currentDate.setDate(1);

    while (currentDate <= end) {
      months.push(new Date(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  private getSalesByMonth(date: Date): SaleInfo[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    return this.filteredSales().filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate.getFullYear() === year && saleDate.getMonth() === month;
    });
  }

  private getReturnsByMonth(date: Date): SaleReturnInfo[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    return this.filteredSaleReturns().filter((returnItem) => {
      const returnDate = new Date(returnItem.createdAt);
      return (
        returnDate.getFullYear() === year && returnDate.getMonth() === month
      );
    });
  }

  private getOrdersByMonth(date: Date): PurchaseOrderInfo[] {
    const year = date.getFullYear();
    const month = date.getMonth();

    return this.filteredPurchaseOrders().filter((order) => {
      const orderDate = new Date(order.createdAt as string);
      return orderDate.getFullYear() === year && orderDate.getMonth() === month;
    });
  }

  private compareDates(a: string, b: string): number {
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);

    if (yearA !== yearB) {
      return yearA - yearB;
    }
    return monthA - monthB;
  }

  private getWeeklySummaries(): {
    label: string;
    revenue: number;
    expenses: number;
    returns: number;
    startDate: Date;
    endDate: Date;
  }[] {
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];
    if (!start || !end) return [];

    const weeks: {
      label: string;
      revenue: number;
      expenses: number;
      returns: number;
      startDate: Date;
      endDate: Date;
    }[] = [];

    const sales = this.filteredSales();
    const returns = this.filteredSaleReturns();
    const orders = this.filteredPurchaseOrders();

    if (sales.length === 0 && returns.length === 0 && orders.length === 0) {
      return [];
    }

    let earliestDate = start;

    if (sales.length > 0) {
      const earliestSale = sales.reduce((earliest, sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate < earliest ? saleDate : earliest;
      }, new Date());

      if (earliestSale < earliestDate) earliestDate = earliestSale;
    }

    if (returns.length > 0) {
      const earliestReturn = returns.reduce((earliest, ret) => {
        const returnDate = new Date(ret.createdAt);
        return returnDate < earliest ? returnDate : earliest;
      }, new Date());

      if (earliestReturn < earliestDate) earliestDate = earliestReturn;
    }

    if (orders.length > 0) {
      const earliestOrder = orders.reduce((earliest, order) => {
        const orderDate = new Date(order.createdAt as string);
        return orderDate < earliest ? orderDate : earliest;
      }, new Date());

      if (earliestOrder < earliestDate) earliestDate = earliestOrder;
    }

    const firstDay = new Date(earliestDate);
    firstDay.setHours(0, 0, 0, 0);
    const currentWeekStart = new Date(firstDay);

    while (currentWeekStart <= end) {
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);
      currentWeekEnd.setHours(23, 59, 59, 999);

      if (currentWeekEnd > end) {
        currentWeekEnd.setTime(end.getTime());
      }

      const weekSales = sales.filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return saleDate >= currentWeekStart && saleDate <= currentWeekEnd;
      });

      const weekReturns = returns.filter((item) => {
        const returnDate = new Date(item.createdAt);
        return returnDate >= currentWeekStart && returnDate <= currentWeekEnd;
      });

      const weekOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt as string);
        return orderDate >= currentWeekStart && orderDate <= currentWeekEnd;
      });

      const weekRevenue = weekSales.reduce(
        (sum, sale) => sum + sale.finalAmount,
        0,
      );
      const weekExpenses = weekOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );
      const weekReturnsAmount = weekReturns.reduce(
        (sum, item) => sum + item.totalReturnAmount,
        0,
      );

      const startStr = currentWeekStart.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      });
      const endStr = currentWeekEnd.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      });

      if (weekRevenue > 0 || weekExpenses > 0 || weekReturnsAmount > 0) {
        weeks.push({
          label: `Sem ${startStr} - ${endStr}`,
          revenue: weekRevenue,
          expenses: weekExpenses,
          returns: weekReturnsAmount,
          startDate: new Date(currentWeekStart),
          endDate: new Date(currentWeekEnd),
        });
      }

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }

    return weeks;
  }

  private extractDateFromPeriod(period: string): Date {
    if (period.startsWith('Sem')) {
      const datePart = period.split(' ')[1].split('-')[0].trim();
      const [day, month] = datePart.split('/').map(Number);

      const year = new Date().getFullYear();
      return new Date(year, month - 1, day);
    } else {
      const monthNames = [
        'enero',
        'febrero',
        'marzo',
        'abril',
        'mayo',
        'junio',
        'julio',
        'agosto',
        'septiembre',
        'octubre',
        'noviembre',
        'diciembre',
      ];

      const parts = period.split(' ');
      const monthName = parts[0].toLowerCase();
      const year = parseInt(parts[1]);

      const monthIndex = monthNames.indexOf(monthName);
      if (monthIndex >= 0) {
        return new Date(year, monthIndex, 15);
      }

      return new Date();
    }
  }

  isExporting = signal(false);
  private applyCompatibleStyles(element: HTMLElement): void {
    const applyToElement = (el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const color = style.getPropertyValue('color');
      const backgroundColor = style.getPropertyValue('background-color');
      const borderColor = style.getPropertyValue('border-color');
      if (color.includes('oklch')) {
        el.style.color = this.convertToRGB(color);
      }
      if (backgroundColor.includes('oklch')) {
        el.style.backgroundColor = this.convertToRGB(backgroundColor);
      }
      if (borderColor.includes('oklch')) {
        el.style.borderColor = this.convertToRGB(borderColor);
      }
      if (el.classList.contains('p-card')) {
        el.style.backgroundColor = '#ffffff';
      }
    };

    applyToElement(element);
    const allElements = element.getElementsByTagName('*');
    for (const el of Array.from(allElements)) {
      applyToElement(el as HTMLElement);
    }
  }

  private convertToRGB(color: string): string {
    if (color.includes('oklch')) {
      return '#000000';
    }
    return color;
  }

  async exportToPDF() {
    try {
      this.isExporting.set(true);
      const exportContent = document.getElementById('exportContent');

      if (!exportContent) {
        throw new Error('Export content element not found');
      }

      const clone = exportContent.cloneNode(true) as HTMLElement;
      clone.style.display = 'block';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.width = '1024px';
      clone.style.backgroundColor = '#ffffff';
      document.body.appendChild(clone);
      this.applyCompatibleStyles(clone);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 1024,
        height: clone.offsetHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('exportContent');
          if (clonedElement) {
            clonedElement.style.width = '1024px';
          }
        },
      });

      document.body.removeChild(clone);

      const imgWidth = 208;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm');
      let position = 0;

      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight,
        '',
        'FAST',
      );
      heightLeft -= pageHeight;

      // Add subsequent pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(
          canvas.toDataURL('image/png', 1.0),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight,
          '',
          'FAST',
        );
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save('reporte-financiero.pdf');
    } catch (error) {
      console.error('Error al exportar el PDF:', error);
    } finally {
      this.isExporting.set(false);
    }
  }
}
