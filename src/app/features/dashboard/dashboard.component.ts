import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '@features/configuration/stores/user.store';
import { CustomerStore } from '@features/customer/stores/customer.store';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { SaleStore } from '@features/sales/stores/sale.store';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order.store';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

interface ChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
    tension?: number;
    type?: string;
  }[];
}

interface ProductSalesData {
  productName: string;
  quantity: number;
  totalAmount: number;
}

interface ProductWithStock {
  stock: number;
  minimumStockThreshold: number;
  category: {
    name: string;
  };
  name: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [
    ChartModule,
    CardModule,
    ButtonModule,
    TableModule,
    SkeletonModule,
    ProgressBarModule,
    CurrencyPipe,
  ],
  template: `
    <div class="p-4">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Panel de Control</h1>
        <div class="flex gap-2">
          <p-button
            label="Actualizar Datos"
            icon="pi pi-refresh"
            (onClick)="refreshData()"
            [loading]="isLoading()"
          ></p-button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <p-card styleClass="bg-blue-50 dark:bg-blue-900/30">
          <div class="flex flex-col items-center">
            <span
              class="text-blue-600 dark:text-blue-300 text-sm font-medium mb-1"
            >
              VENTAS DEL MES
            </span>
            @if (isLoading()) {
              <p-skeleton height="2.5rem" width="80%"></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {{ monthlySales() | currency: 'COP' : '$' : '1.0-0' }}
              </span>
            }
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ salesTrend() >= 0 ? '+' : '' }}{{ salesTrend() }}% vs mes
              anterior
            </div>
          </div>
        </p-card>

        <p-card styleClass="bg-green-50 dark:bg-green-900/30">
          <div class="flex flex-col items-center">
            <span
              class="text-green-600 dark:text-green-300 text-sm font-medium mb-1"
            >
              PRODUCTOS DISPONIBLES
            </span>
            @if (isLoading()) {
              <p-skeleton height="2.5rem" width="80%"></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {{ productStore.productsCount() }}
              </span>
            }
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ productWithLowStock() }} con stock bajo
            </div>
          </div>
        </p-card>

        <p-card styleClass="bg-amber-50 dark:bg-amber-900/30">
          <div class="flex flex-col items-center">
            <span
              class="text-amber-600 dark:text-amber-300 text-sm font-medium mb-1"
            >
              ÓRDENES PENDIENTES
            </span>
            @if (isLoading()) {
              <p-skeleton height="2.5rem" width="80%"></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {{ pendingOrders() }}
              </span>
            }
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Valor:
              {{ pendingOrdersValue() | currency: 'COP' : '$' : '1.0-0' }}
            </div>
          </div>
        </p-card>

        <p-card styleClass="bg-indigo-50 dark:bg-indigo-900/30">
          <div class="flex flex-col items-center">
            <span
              class="text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-1"
            >
              CLIENTES ACTIVOS
            </span>
            @if (isLoading()) {
              <p-skeleton height="2.5rem" width="80%"></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {{ activeCustomers() }}
              </span>
            }
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ newCustomers() }} nuevo(s) este mes
            </div>
          </div>
        </p-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <p-card header="Ventas vs Ganancias" styleClass="h-full">
          @if (isLoading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="300px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div style="height: 300px">
              <p-chart
                type="line"
                [data]="salesVsProfitChartData()"
                [options]="salesVsProfitChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>

        <p-card header="Productos Más Vendidos" styleClass="h-full">
          @if (isLoading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="300px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div style="height: 300px">
              <p-chart
                type="pie"
                [data]="topProductsChartData()"
                [options]="pieChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <p-card
          header="Niveles de Inventario por Categoría"
          styleClass="h-full"
        >
          @if (isLoading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="300px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div style="height: 300px">
              <p-chart
                type="bar"
                [data]="inventoryByCategoryChartData()"
                [options]="barChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>

        <p-card header="Ventas por Cliente" styleClass="h-full">
          @if (isLoading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="300px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div style="height: 300px">
              <p-chart
                type="doughnut"
                [data]="customerDistributionChartData()"
                [options]="doughnutChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <p-card header="Productos con Stock Crítico" styleClass="h-full">
          @if (isLoading()) {
            <div class="flex flex-col gap-2 py-2">
              <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            </div>
          } @else {
            <p-table
              [value]="criticalStockProducts()"
              styleClass="p-datatable-sm"
              [paginator]="true"
              [rows]="5"
              [showCurrentPageReport]="true"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Stock Actual</th>
                  <th>Nivel de Stock</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-product>
                <tr>
                  <td>{{ product.name }}</td>
                  <td>{{ product.category.name }}</td>
                  <td>{{ product.stock }}</td>
                  <td>
                    <p-progressBar
                      [value]="calculateStockPercentage(product)"
                      [showValue]="false"
                      [styleClass]="getStockProgressClass(product)"
                    ></p-progressBar>
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="4" class="text-center p-4">
                    No hay productos con stock crítico.
                  </td>
                </tr>
              </ng-template>
            </p-table>
            <div class="flex justify-end mt-4">
              <p-button
                label="Ver Reporte de Inventario"
                styleClass="p-button-sm p-button-outlined"
                (onClick)="navigateToReport('inventory')"
              ></p-button>
            </div>
          }
        </p-card>

        <p-card header="Ventas Recientes" styleClass="h-full">
          @if (isLoading()) {
            <div class="flex flex-col gap-2 py-2">
              <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
              <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            </div>
          } @else {
            <p-table
              [value]="recentSales()"
              styleClass="p-datatable-sm"
              [paginator]="true"
              [rows]="5"
              [showCurrentPageReport]="true"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-sale>
                <tr>
                  <td>{{ formatDateString(sale.createdAt) }}</td>
                  <td>{{ sale.customer?.fullName || 'Venta Directa' }}</td>
                  <td>{{ sale.items.length }}</td>
                  <td>
                    {{ sale.finalAmount | currency: 'COP' : '$' : '1.0-0' }}
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                <tr>
                  <td colspan="4" class="text-center p-4">
                    No hay ventas recientes.
                  </td>
                </tr>
              </ng-template>
            </p-table>
            <div class="flex justify-end mt-4">
              <p-button
                label="Ver Reporte de Ventas"
                styleClass="p-button-sm p-button-outlined"
                (onClick)="navigateToReport('sales')"
              ></p-button>
            </div>
          }
        </p-card>
      </div>

      <div class="flex flex-wrap justify-center gap-4 mt-8">
        <p-button
          label="Reporte de Ventas"
          icon="pi pi-chart-line"
          (onClick)="navigateToReport('sales')"
          styleClass="p-button-outlined"
        ></p-button>
        <p-button
          label="Reporte de Inventario"
          icon="pi pi-box"
          (onClick)="navigateToReport('inventory')"
          styleClass="p-button-outlined"
        ></p-button>
        <p-button
          label="Reporte Financiero"
          icon="pi pi-dollar"
          (onClick)="navigateToReport('financial')"
          styleClass="p-button-outlined"
        ></p-button>
        <p-button
          label="Reporte de Empleados"
          icon="pi pi-users"
          (onClick)="navigateToReport('employees')"
          styleClass="p-button-outlined"
        ></p-button>
        <p-button
          label="Reporte de Clientes"
          icon="pi pi-user"
          (onClick)="navigateToReport('customers')"
          styleClass="p-button-outlined"
        ></p-button>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private router = inject(Router);
  public productStore = inject(ProductStore);
  public categoryStore = inject(CategoryStore);
  public saleStore = inject(SaleStore);
  public saleReturnStore = inject(SaleReturnStore);
  public purchaseOrderStore = inject(PurchaseOrderStore);
  public supplierStore = inject(SupplierStore);
  public customerStore = inject(CustomerStore);
  public userStore = inject(UserStore);
  public attendanceStore = inject(AttendanceStore);

  today = new Date();

  isLoading = computed(() => {
    return (
      this.productStore.loading() ||
      this.categoryStore.loading() ||
      this.saleStore.loading() ||
      this.customerStore.loading() ||
      this.purchaseOrderStore.loading()
    );
  });

  monthlySales = computed(() => {
    const currentMonth = this.today.getMonth();
    const currentYear = this.today.getFullYear();

    return this.saleStore
      .entities()
      .filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate.getMonth() === currentMonth &&
          saleDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, sale) => sum + sale.finalAmount, 0);
  });

  salesTrend = computed(() => {
    const currentMonth = this.today.getMonth();
    const currentYear = this.today.getFullYear();
    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;

    if (previousMonth < 0) {
      previousMonth = 11;
      previousYear--;
    }

    const currentMonthSales = this.saleStore
      .entities()
      .filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate.getMonth() === currentMonth &&
          saleDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, sale) => sum + sale.finalAmount, 0);

    const previousMonthSales = this.saleStore
      .entities()
      .filter((sale) => {
        const saleDate = new Date(sale.createdAt);
        return (
          saleDate.getMonth() === previousMonth &&
          saleDate.getFullYear() === previousYear
        );
      })
      .reduce((sum, sale) => sum + sale.finalAmount, 0);

    if (previousMonthSales === 0) return 0;
    return Math.round(
      ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100,
    );
  });

  recentSales = computed(() => {
    return [...this.saleStore.entities()]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 10);
  });

  productWithLowStock = computed(() => {
    return this.productStore
      .entities()
      .filter((product) => product.stock <= product.minimumStockThreshold)
      .length;
  });

  criticalStockProducts = computed(() => {
    return this.productStore
      .entities()
      .filter((product) => product.stock <= product.minimumStockThreshold)
      .sort(
        (a, b) =>
          a.stock / a.minimumStockThreshold - b.stock / b.minimumStockThreshold,
      )
      .slice(0, 10);
  });

  pendingOrders = computed(() => {
    return this.purchaseOrderStore
      .entities()
      .filter((order) =>
        ['PENDING', 'SUBMITTED', 'CONFIRMED', 'SHIPPED'].includes(order.status),
      ).length;
  });

  pendingOrdersValue = computed(() => {
    return this.purchaseOrderStore
      .entities()
      .filter((order) =>
        ['PENDING', 'SUBMITTED', 'CONFIRMED', 'SHIPPED'].includes(order.status),
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);
  });

  activeCustomers = computed(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const recentCustomerIds = new Set(
      this.saleStore
        .entities()
        .filter(
          (sale) => new Date(sale.createdAt) >= threeMonthsAgo && sale.customer,
        )
        .map((sale) => sale.customer.id),
    );

    return recentCustomerIds.size;
  });

  newCustomers = computed(() => {
    const currentMonth = this.today.getMonth();
    const currentYear = this.today.getFullYear();

    const customerFirstPurchaseMap = new Map<number, Date>();

    this.saleStore.entities().forEach((sale) => {
      if (!sale.customer) return;

      const saleDate = new Date(sale.createdAt);
      const customerId = sale.customer.id;

      if (
        !customerFirstPurchaseMap.has(customerId) ||
        saleDate < customerFirstPurchaseMap.get(customerId)!
      ) {
        customerFirstPurchaseMap.set(customerId, saleDate);
      }
    });

    return Array.from(customerFirstPurchaseMap.values()).filter(
      (date) =>
        date.getMonth() === currentMonth && date.getFullYear() === currentYear,
    ).length;
  });

  topSellingProducts = computed(() => {
    const productMap = new Map<number, ProductSalesData>();

    this.saleStore.entities().forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.product.id;
        if (productMap.has(productId)) {
          const current = productMap.get(productId)!;
          productMap.set(productId, {
            productName: item.product.name,
            quantity: current.quantity + item.quantity,
            totalAmount: current.totalAmount + item.subtotal,
          });
        } else {
          productMap.set(productId, {
            productName: item.product.name,
            quantity: item.quantity,
            totalAmount: item.subtotal,
          });
        }
      });
    });

    return Array.from(productMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  });

  topProductsChartData = computed<ChartDataset>(() => {
    const topProducts = this.topSellingProducts();

    return {
      labels: topProducts.map((product) =>
        this.truncateText(product.productName, 15),
      ),
      datasets: [
        {
          label: 'Unidades Vendidas',
          data: topProducts.map((product) => product.quantity),
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

  salesVsProfitChartData = computed<ChartDataset>(() => {
    const labels = [];
    const salesData = [];
    const profitData = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      const monthYear = date.toLocaleDateString('es-ES', {
        month: 'short',
        year: 'numeric',
      });
      labels.push(monthYear);

      const monthSales = this.saleStore
        .entities()
        .filter((sale) => {
          const saleDate = new Date(sale.createdAt);
          return (
            saleDate.getMonth() === date.getMonth() &&
            saleDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((sum, sale) => sum + sale.finalAmount, 0);

      salesData.push(monthSales);

      profitData.push(monthSales * 0.3);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Ventas',
          data: salesData,
          borderColor: '#42A5F5',
          backgroundColor: 'rgba(66, 165, 245, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Ganancias',
          data: profitData,
          borderColor: '#66BB6A',
          backgroundColor: 'rgba(102, 187, 106, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  });

  inventoryByCategoryChartData = computed<ChartDataset>(() => {
    const categoryMap = new Map<number, { name: string; totalStock: number }>();

    this.productStore.entities().forEach((product) => {
      const categoryId = product.category.id;
      if (categoryMap.has(categoryId)) {
        const current = categoryMap.get(categoryId)!;
        categoryMap.set(categoryId, {
          name: product.category.name,
          totalStock: current.totalStock + product.stock,
        });
      } else {
        categoryMap.set(categoryId, {
          name: product.category.name,
          totalStock: product.stock,
        });
      }
    });

    const categories = Array.from(categoryMap.values()).sort(
      (a, b) => b.totalStock - a.totalStock,
    );

    return {
      labels: categories.map((cat) => this.truncateText(cat.name, 15)),
      datasets: [
        {
          label: 'Unidades en Stock',
          data: categories.map((cat) => cat.totalStock),
          backgroundColor: '#26C6DA',
        },
      ],
    };
  });

  customerDistributionChartData = computed<ChartDataset>(() => {
    const customerMap = new Map<
      number,
      { name: string; totalAmount: number }
    >();

    this.saleStore.entities().forEach((sale) => {
      if (!sale.customer) return;

      const customerId = sale.customer.id;
      if (customerMap.has(customerId)) {
        const current = customerMap.get(customerId)!;
        customerMap.set(customerId, {
          name: sale.customer.fullName,
          totalAmount: current.totalAmount + sale.finalAmount,
        });
      } else {
        customerMap.set(customerId, {
          name: sale.customer.fullName,
          totalAmount: sale.finalAmount,
        });
      }
    });

    const topCustomers = Array.from(customerMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);

    const topCustomersTotal = topCustomers.reduce(
      (sum, customer) => sum + customer.totalAmount,
      0,
    );
    const allCustomersTotal = Array.from(customerMap.values()).reduce(
      (sum, customer) => sum + customer.totalAmount,
      0,
    );
    const othersTotal = allCustomersTotal - topCustomersTotal;

    const labels = [...topCustomers.map((c) => this.truncateText(c.name, 15))];
    const data = [...topCustomers.map((c) => c.totalAmount)];

    if (othersTotal > 0) {
      labels.push('Otros');
      data.push(othersTotal);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Ventas por Cliente',
          data,
          backgroundColor: [
            '#FF7043',
            '#7E57C2',
            '#26A69A',
            '#FFA726',
            '#5C6BC0',
            '#78909C',
          ],
        },
      ],
    };
  });

  salesVsProfitChartOptions = {
    plugins: {
      legend: {
        position: 'top',
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
    },
  };

  pieChartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  barChartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Unidades',
        },
      },
    },
  };

  doughnutChartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    this.productStore.findAll();
    this.categoryStore.findAll();
    this.saleStore.findAll();
    this.customerStore.findAll();
    this.purchaseOrderStore.findAll();
    this.supplierStore.findAll();
  }

  navigateToReport(reportType: string) {
    switch (reportType) {
      case 'sales':
        this.router.navigate(['/reportes/ventas']);
        break;
      case 'inventory':
        this.router.navigate(['/reportes/inventario']);
        break;
      case 'financial':
        this.router.navigate(['/reportes/financieros']);
        break;
      case 'employees':
        this.router.navigate(['/reportes/empleados']);
        break;
      case 'customers':
        this.router.navigate(['/reportes/clientes']);
        break;
    }
  }

  calculateStockPercentage(product: ProductWithStock): number {
    if (product.minimumStockThreshold === 0) return 100;

    const optimalStock = product.minimumStockThreshold * 3;
    const percentage = (product.stock / optimalStock) * 100;
    return Math.min(percentage, 100);
  }

  getStockProgressClass(product: ProductWithStock): string {
    if (product.stock <= product.minimumStockThreshold * 0.5) {
      return 'bg-red-600';
    } else if (product.stock <= product.minimumStockThreshold) {
      return 'bg-amber-500';
    }
    return 'bg-emerald-500';
  }

  formatDateString(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString();
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }
}
