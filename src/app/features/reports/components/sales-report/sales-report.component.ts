import { CurrencyPipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductInfo } from '@features/inventory/models/product.model';
import { ProductStore } from '@features/inventory/stores/product.store';
import { SaleInfo } from '@features/sales/models/sale.model';
import { SaleStore } from '@features/sales/stores/sale.store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

interface ProductSalesData {
  product: ProductInfo;
  quantity: number;
  totalAmount: number;
}

interface DailySalesData {
  date: string;
  totalSales: number;
  totalAmount: number;
}

interface WeeklySalesData {
  weekStart: string;
  weekEnd: string;
  displayLabel: string;
  totalSales: number;
  totalAmount: number;
}

interface MonthlySalesData {
  month: string;
  totalSales: number;
  totalAmount: number;
}

interface ChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[] | string;
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

interface PieChartTooltipContext {
  parsed: number;
  label?: string;
  dataset: {
    data: number[];
  };
}

@Component({
  selector: 'app-sales-report',
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
    SelectModule,
    ToolbarModule,
  ],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Tendencia de Ventas</h2>

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

      <div class="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <p-card styleClass="h-full" header="Ventas Diarias">
          @if (saleStore.loading()) {
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
                [data]="dailySalesChartData()"
                [options]="dailySalesChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>

        <p-card styleClass="h-full" header="Ventas Semanales">
          @if (saleStore.loading()) {
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
                [data]="weeklySalesChartData()"
                [options]="weeklySalesChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>

        <p-card styleClass="h-full" header="Ventas Mensuales">
          @if (saleStore.loading()) {
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
                [data]="monthlySalesChartData()"
                [options]="monthlySalesChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>
      </div>

      <p-card header="Distribución de Ventas" styleClass="mb-6">
        @if (saleStore.loading()) {
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
                [data]="productDistributionChartData()"
                [options]="pieChartOptions"
              ></p-chart>
            </div>
            <div
              class="chart-container"
              style="position: relative; height:300px;"
            >
              <p-chart
                type="doughnut"
                [data]="productQuantityChartData()"
                [options]="doughnutChartOptions"
              ></p-chart>
            </div>
          </div>
        }
      </p-card>

      <div id="exportContent" style="display: none;">
        <p-card header="Productos Más Vendidos">
          <p-table
            [value]="topProductsData()"
            [tableStyle]="{ 'min-width': '50rem' }"
            styleClass="p-datatable-sm p-datatable-striped"
          >
            <ng-template pTemplate="header">
              <tr>
                <th style="width: 5%">Posición</th>
                <th style="width: 40%">Producto</th>
                <th style="width: 15%">Cantidad Vendida</th>
                <th style="width: 20%">Monto Total</th>
                <th style="width: 20%">% del Total</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-product let-i="rowIndex">
              <tr>
                <td>
                  <span>{{ i + 1 }}</span>
                </td>
                <td>{{ product.product.name }}</td>
                <td>{{ product.quantity }}</td>
                <td>
                  {{ product.totalAmount | currency: 'COP' : '$' : '1.0-0' }}
                </td>
                <td>
                  {{
                    (product.totalAmount / totalSalesAmount()) * 100
                      | number: '1.1-1'
                  }}%
                </td>
              </tr>
            </ng-template>
          </p-table>
        </p-card>
      </div>
    </div>
  `,
})
export class SalesReportComponent implements OnInit {
  public saleStore = inject(SaleStore);
  public productStore = inject(ProductStore);

  dateRange = signal<Date[]>([
    null as unknown as Date,
    null as unknown as Date,
  ]);

  today = new Date();
  isExporting = signal(false);

  topProductsData = computed(() => {
    const sales = this.filteredSales();
    if (!sales.length) {
      return [];
    }

    const productMap = new Map<number, ProductSalesData>();

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.product.id;
        const currentRecord = productMap.get(productId);

        if (currentRecord) {
          productMap.set(productId, {
            product: item.product,
            quantity: currentRecord.quantity + item.quantity,
            totalAmount: currentRecord.totalAmount + item.subtotal,
          });
        } else {
          productMap.set(productId, {
            product: item.product,
            quantity: item.quantity,
            totalAmount: item.subtotal,
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  });

  totalSalesAmount = computed(() => {
    return this.filteredSales().reduce(
      (total, sale) => total + sale.finalAmount,
      0,
    );
  });

  dailySalesChartData = computed<ChartDataset>(() => {
    const sales = this.filteredSales();
    if (!sales.length) {
      return {
        labels: [],
        datasets: [{ label: 'Ventas diarias', data: [] }],
      };
    }

    const dailyData = this.aggregateSalesByDay();
    const sortedData = [...dailyData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    return {
      labels: sortedData.map((item) => this.formatDate(new Date(item.date))),
      datasets: [
        {
          label: 'Monto de ventas',
          data: sortedData.map((item) => item.totalAmount),
          backgroundColor: '#42A5F5',
        },
      ],
    };
  });

  weeklySalesChartData = computed<ChartDataset>(() => {
    const sales = this.filteredSales();
    if (!sales.length) {
      return {
        labels: [],
        datasets: [{ label: 'Ventas semanales', data: [] }],
      };
    }

    const weeklyData = this.aggregateSalesByWeek();
    const sortedData = [...weeklyData].sort(
      (a, b) =>
        new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime(),
    );

    return {
      labels: sortedData.map((item) => item.displayLabel),
      datasets: [
        {
          label: 'Monto de ventas',
          data: sortedData.map((item) => item.totalAmount),
          backgroundColor: '#66BB6A',
        },
      ],
    };
  });

  monthlySalesChartData = computed<ChartDataset>(() => {
    const sales = this.filteredSales();
    if (!sales.length) {
      return {
        labels: [],
        datasets: [{ label: 'Ventas mensuales', data: [] }],
      };
    }

    const monthlyData = this.aggregateSalesByMonth();
    const sortedData = [...monthlyData].sort(
      (a, b) =>
        new Date(a.month + '-01').getTime() -
        new Date(b.month + '-01').getTime(),
    );

    return {
      labels: sortedData.map((item) => this.formatMonthDisplay(item.month)),
      datasets: [
        {
          label: 'Monto de ventas',
          data: sortedData.map((item) => item.totalAmount),
          backgroundColor: '#FFA726',
        },
      ],
    };
  });

  productDistributionChartData = computed<ChartDataset>(() => {
    const topProducts = this.topProductsData().slice(0, 5);

    return {
      labels: topProducts.map((item) => this.truncateName(item.product.name)),
      datasets: [
        {
          label: 'Distribución por producto',
          data: topProducts.map((item) => item.totalAmount),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
          ],
        },
      ],
    };
  });

  productQuantityChartData = computed<ChartDataset>(() => {
    const topProducts = this.topProductsData().slice(0, 5);

    return {
      labels: topProducts.map((item) => this.truncateName(item.product.name)),
      datasets: [
        {
          label: 'Cantidad vendida',
          data: topProducts.map((item) => item.quantity),
          backgroundColor: [
            '#FF6347',
            '#8A2BE2',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
          ],
        },
      ],
    };
  });

  dailySalesChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Ventas Diarias',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `$${context.parsed.y.toFixed(0)}`;
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
          text: 'Monto ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Fecha',
        },
      },
    },
  };

  weeklySalesChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Ventas Semanales',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `$${context.parsed.y.toFixed(0)}`;
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
          text: 'Monto ($)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Semana',
        },
      },
    },
  };

  monthlySalesChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Ventas Mensuales',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `$${context.parsed.y.toFixed(0)}`;
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
          text: 'Monto ($)',
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

  pieChartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribución por Producto (Top 5)',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: PieChartTooltipContext) => {
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage =
              total > 0 ? ((value * 100) / total).toFixed(2) : '0';
            return `${context.label || ''}: $${value.toFixed(0)} (${percentage}%)`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  doughnutChartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Cantidad de Productos Vendidos',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: PieChartTooltipContext) => {
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0,
            );
            const percentage =
              total > 0 ? ((value * 100) / total).toFixed(2) : '0';
            return `${context.label || ''}: ${value} unidades (${percentage}%)`;
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
    startDate.setMonth(startDate.getMonth() - 3);
    this.dateRange.set([startDate, endDate]);

    this.fetchSalesByDateRange();
    this.productStore.findAll();
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

  clearFilters() {
    this.dateRange.set([null as unknown as Date, null as unknown as Date]);
    this.saleStore.findAll();
  }

  private fetchSalesByDateRange() {
    const start = this.dateRange()[0];
    const end = this.dateRange()[1];
    if (start && end) {
      const startStr = this.formatDateISO(start);
      const endStr = this.formatDateISO(end);
      this.saleStore.findByDateRange({ startDate: startStr, endDate: endStr });
    }
  }

  private formatDateISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    });
  }

  private formatMonthDisplay(month: string): string {
    const [year, monthNum] = month.split('-');
    const date = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric',
    });
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getFirstDayOfWeek(date: Date): Date {
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
    return new Date(date.getFullYear(), date.getMonth(), diff);
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

    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }

  private aggregateSalesByDay(): DailySalesData[] {
    const sales = this.filteredSales();
    const dailyMap = new Map<string, DailySalesData>();

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const dateStr = saleDate.toISOString().split('T')[0];

      const currentData = dailyMap.get(dateStr);
      if (currentData) {
        dailyMap.set(dateStr, {
          date: dateStr,
          totalSales: currentData.totalSales + 1,
          totalAmount: currentData.totalAmount + sale.finalAmount,
        });
      } else {
        dailyMap.set(dateStr, {
          date: dateStr,
          totalSales: 1,
          totalAmount: sale.finalAmount,
        });
      }
    });

    return Array.from(dailyMap.values());
  }

  private aggregateSalesByWeek(): WeeklySalesData[] {
    const sales = this.filteredSales();
    const weeklyMap = new Map<string, WeeklySalesData>();

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const weekStart = this.getFirstDayOfWeek(saleDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekKey = weekStart.toISOString().split('T')[0];
      const displayLabel = `${this.formatDate(weekStart)} - ${this.formatDate(weekEnd)}`;

      const currentData = weeklyMap.get(weekKey);
      if (currentData) {
        weeklyMap.set(weekKey, {
          ...currentData,
          totalSales: currentData.totalSales + 1,
          totalAmount: currentData.totalAmount + sale.finalAmount,
        });
      } else {
        weeklyMap.set(weekKey, {
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          displayLabel,
          totalSales: 1,
          totalAmount: sale.finalAmount,
        });
      }
    });

    return Array.from(weeklyMap.values());
  }

  private aggregateSalesByMonth(): MonthlySalesData[] {
    const sales = this.filteredSales();
    const monthlyMap = new Map<string, MonthlySalesData>();

    sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt);
      const monthKey = `${saleDate.getFullYear()}-${String(saleDate.getMonth() + 1).padStart(2, '0')}`;

      const currentData = monthlyMap.get(monthKey);
      if (currentData) {
        monthlyMap.set(monthKey, {
          ...currentData,
          totalSales: currentData.totalSales + 1,
          totalAmount: currentData.totalAmount + sale.finalAmount,
        });
      } else {
        monthlyMap.set(monthKey, {
          month: monthKey,
          totalSales: 1,
          totalAmount: sale.finalAmount,
        });
      }
    });

    return Array.from(monthlyMap.values());
  }

  private truncateName(name: string): string {
    return name.length > 15 ? `${name.substring(0, 15)}...` : name;
  }

  private applyCompatibleStyles(element: HTMLElement): void {
    // Convert oklch colors to RGB
    const applyToElement = (el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const color = style.getPropertyValue('color');
      const backgroundColor = style.getPropertyValue('background-color');
      const borderColor = style.getPropertyValue('border-color');

      // Only convert if the color is in oklch format
      if (color.includes('oklch')) {
        el.style.color = this.convertToRGB(color);
      }
      if (backgroundColor.includes('oklch')) {
        el.style.backgroundColor = this.convertToRGB(backgroundColor);
      }
      if (borderColor.includes('oklch')) {
        el.style.borderColor = this.convertToRGB(borderColor);
      }

      // Ensure PrimeNG component backgrounds are set
      if (el.classList.contains('p-card')) {
        el.style.backgroundColor = '#ffffff';
      }
    };

    // Apply to main element
    applyToElement(element);

    // Apply to all child elements
    const allElements = element.getElementsByTagName('*');
    for (const el of Array.from(allElements)) {
      applyToElement(el as HTMLElement);
    }
  }

  private convertToRGB(color: string): string {
    // Simple conversion for oklch colors - you may need to adjust these values
    if (color.includes('oklch')) {
      return '#000000'; // Default to black if oklch
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

      // Create a clone and prepare it for PDF export
      const clone = exportContent.cloneNode(true) as HTMLElement;
      clone.style.display = 'block';
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.width = '1024px'; // Set fixed width for consistent rendering
      clone.style.backgroundColor = '#ffffff';
      document.body.appendChild(clone);

      // Apply compatible styles
      this.applyCompatibleStyles(clone);

      // Wait for styles and images to load
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture the content with specific dimensions
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

      // Clean up the clone
      document.body.removeChild(clone);

      // Create PDF with proper dimensions
      const imgWidth = 208; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm');
      let position = 0;

      // Add first page
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
      pdf.save('reporte-ventas.pdf');
    } catch (error) {
      console.error('Error al exportar el PDF:', error);
      throw error;
    } finally {
      this.isExporting.set(false);
    }
  }
}
