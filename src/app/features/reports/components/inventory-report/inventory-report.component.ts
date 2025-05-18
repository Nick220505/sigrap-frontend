import { DecimalPipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryInfo } from '@features/inventory/models/category.model';
import { ProductInfo } from '@features/inventory/models/product.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import { SaleInfo } from '@features/sales/models/sale.model';
import { SaleStore } from '@features/sales/stores/sale.store';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressBarModule } from 'primeng/progressbar';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

interface ProductInventoryData {
  product: ProductInfo;
  stockPercentage: number;
  stockStatus: 'normal' | 'low' | 'critical';
  turnover: number;
  sales: number;
  restockNeeded: boolean;
}

interface CategoryInventoryData {
  category: CategoryInfo;
  productCount: number;
  totalStock: number;
  averageStock: number;
  lowStockCount: number;
}

interface ChartDataset {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

interface ChartTooltipContext {
  parsed: { y: number };
  label?: string;
  dataset: {
    label: string;
  };
}

@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [
    ChartModule,
    CardModule,
    ButtonModule,
    DatePickerModule,
    FormsModule,
    DecimalPipe,
    NgClass,
    TableModule,
    SkeletonModule,
    TooltipModule,
    ToolbarModule,
    DropdownModule,
    SelectButtonModule,
    ProgressBarModule,
  ],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Estado del Inventario</h2>

      <p-toolbar styleClass="mb-6">
        <ng-template pTemplate="start">
          <div class="flex flex-wrap items-center gap-3">
            <p-selectButton
              [options]="stockViewOptions"
              [(ngModel)]="selectedStockView"
              optionLabel="label"
              optionValue="value"
            ></p-selectButton>
          </div>
        </ng-template>

        <ng-template pTemplate="end">
          <p-dropdown
            [options]="categoryOptions()"
            [(ngModel)]="selectedCategory"
            placeholder="Todas las Categorías"
            [showClear]="true"
            (onChange)="filterByCategory()"
          ></p-dropdown>
        </ng-template>
      </p-toolbar>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <p-card styleClass="h-full">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Productos en Inventario</h3>
            @if (isLoading()) {
              <p-skeleton
                height="2rem"
                width="80%"
                styleClass="mb-2"
              ></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-blue-600">{{
                totalProducts()
              }}</span>
            }
          </div>
        </p-card>

        <p-card styleClass="h-full">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Unidades en Stock</h3>
            @if (isLoading()) {
              <p-skeleton
                height="2rem"
                width="80%"
                styleClass="mb-2"
              ></p-skeleton>
            } @else {
              <span class="text-3xl font-bold text-indigo-600">{{
                totalStock()
              }}</span>
            }
          </div>
        </p-card>

        <p-card styleClass="h-full">
          <div class="flex flex-col items-center">
            <h3 class="text-xl font-semibold mb-2">Productos en Alerta</h3>
            @if (isLoading()) {
              <p-skeleton
                height="2rem"
                width="80%"
                styleClass="mb-2"
              ></p-skeleton>
            } @else {
              <span
                class="text-3xl font-bold"
                [ngClass]="{
                  'text-yellow-600': lowStockCount() > 0 && lowStockCount() < 5,
                  'text-red-600': lowStockCount() >= 5,
                }"
              >
                {{ lowStockCount() }}
              </span>
            }
          </div>
        </p-card>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <p-card styleClass="h-full" header="Distribución por Categoría">
          @if (isLoading()) {
            <div class="flex justify-center py-8">
              <p-skeleton height="300px" width="100%"></p-skeleton>
            </div>
          } @else {
            <div
              class="chart-container"
              style="position: relative; height: 300px;"
            >
              <p-chart
                type="pie"
                [data]="categoryDistributionChartData()"
                [options]="categoryChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>

        <p-card styleClass="h-full" header="Niveles de Stock por Categoría">
          @if (isLoading()) {
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
                [data]="categoryStockChartData()"
                [options]="stockChartOptions"
              ></p-chart>
            </div>
          }
        </p-card>
      </div>

      <p-card header="Estado de Inventario por Producto">
        @if (isLoading()) {
          <div class="flex flex-col gap-3 py-3">
            <p-skeleton height="2.5rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
          </div>
        } @else {
          <p-table
            [value]="displayedProducts()"
            styleClass="p-datatable-sm p-datatable-striped"
            [paginator]="true"
            [rows]="10"
            [sortField]="'product.stock'"
            [sortOrder]="-1"
          >
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="product.name">
                  Producto <p-sortIcon field="product.name"></p-sortIcon>
                </th>
                <th pSortableColumn="product.category.name">
                  Categoría
                  <p-sortIcon field="product.category.name"></p-sortIcon>
                </th>
                <th pSortableColumn="product.stock">
                  Stock <p-sortIcon field="product.stock"></p-sortIcon>
                </th>
                <th style="width: 25%">Nivel de Stock</th>
                <th pSortableColumn="sales">
                  Ventas <p-sortIcon field="sales"></p-sortIcon>
                </th>
                <th>Estado</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-product>
              <tr
                [ngClass]="{
                  'bg-red-50': product.stockStatus === 'critical',
                  'bg-yellow-50': product.stockStatus === 'low',
                }"
              >
                <td>{{ product.product.name }}</td>
                <td>{{ product.product.category.name }}</td>
                <td>{{ product.product.stock }}</td>
                <td>
                  <p-progressBar
                    [value]="product.stockPercentage"
                    [showValue]="false"
                    [styleClass]="getStockProgressClass(product.stockStatus)"
                  ></p-progressBar>
                </td>
                <td>{{ product.sales }}</td>
                <td>
                  <span
                    [ngClass]="{
                      'bg-green-100 text-green-800 px-2 py-1 rounded-lg':
                        product.stockStatus === 'normal',
                      'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg':
                        product.stockStatus === 'low',
                      'bg-red-100 text-red-800 px-2 py-1 rounded-lg':
                        product.stockStatus === 'critical',
                    }"
                  >
                    {{ getStockStatusLabel(product.stockStatus) }}
                  </span>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center p-4">
                  No hay productos disponibles en el inventario.
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>

      <p-card header="Estado de Inventario por Categoría" styleClass="mt-6">
        @if (isLoading()) {
          <div class="flex flex-col gap-3 py-3">
            <p-skeleton height="2.5rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton height="2rem" styleClass="mb-2"></p-skeleton>
          </div>
        } @else {
          <p-table
            [value]="categoryInventoryData()"
            styleClass="p-datatable-sm p-datatable-striped"
          >
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="category.name">
                  Categoría <p-sortIcon field="category.name"></p-sortIcon>
                </th>
                <th pSortableColumn="productCount">
                  Productos <p-sortIcon field="productCount"></p-sortIcon>
                </th>
                <th pSortableColumn="totalStock">
                  Stock Total <p-sortIcon field="totalStock"></p-sortIcon>
                </th>
                <th pSortableColumn="averageStock">
                  Promedio <p-sortIcon field="averageStock"></p-sortIcon>
                </th>
                <th pSortableColumn="lowStockCount">
                  En Alerta <p-sortIcon field="lowStockCount"></p-sortIcon>
                </th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-category>
              <tr [ngClass]="{ 'bg-yellow-50': category.lowStockCount > 0 }">
                <td>{{ category.category.name }}</td>
                <td>{{ category.productCount }}</td>
                <td>{{ category.totalStock }}</td>
                <td>{{ category.averageStock | number: '1.0-0' }}</td>
                <td>
                  <span
                    [ngClass]="{
                      'bg-green-100 text-green-800 px-2 py-1 rounded-lg':
                        category.lowStockCount === 0,
                      'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg':
                        category.lowStockCount > 0,
                    }"
                  >
                    {{ category.lowStockCount }}
                  </span>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="5" class="text-center p-4">
                  No hay categorías disponibles en el inventario.
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>
    </div>
  `,
})
export class InventoryReportComponent implements OnInit {
  public productStore = inject(ProductStore);
  public categoryStore = inject(CategoryStore);
  public saleStore = inject(SaleStore);

  stockViewOptions = [
    { label: 'Todos', value: 'all' },
    { label: 'Stock Bajo', value: 'low' },
    { label: 'Críticos', value: 'critical' },
  ];

  selectedStockView = 'all';
  selectedCategory: number | null = null;

  isLoading = computed(() => {
    return (
      this.productStore.loading() ||
      this.categoryStore.loading() ||
      this.saleStore.loading()
    );
  });

  filteredProducts = computed(() => {
    const products = this.productStore.entities();
    if (this.selectedCategory === null) {
      return products;
    }
    return products.filter(
      (product) => product.category.id === this.selectedCategory,
    );
  });

  productInventoryData = computed<ProductInventoryData[]>(() => {
    const products = this.filteredProducts();
    const sales = this.saleStore.entities();

    return products.map((product) => {
      const stockPercentage = this.calculateStockPercentage(product);
      const productSales = this.calculateProductSales(product, sales);
      const stockStatus = this.determineStockStatus(product);

      return {
        product,
        stockPercentage,
        stockStatus,
        turnover: productSales > 0 ? product.stock / productSales : 0,
        sales: productSales,
        restockNeeded: product.stock <= product.minimumStockThreshold,
      };
    });
  });

  displayedProducts = computed(() => {
    const data = this.productInventoryData();
    switch (this.selectedStockView) {
      case 'low':
        return data.filter(
          (p) => p.stockStatus === 'low' || p.stockStatus === 'critical',
        );
      case 'critical':
        return data.filter((p) => p.stockStatus === 'critical');
      default:
        return data;
    }
  });

  categoryInventoryData = computed<CategoryInventoryData[]>(() => {
    const categories = this.categoryStore.entities();
    const products = this.productStore.entities();

    return categories.map((category) => {
      const categoryProducts = products.filter(
        (p) => p.category.id === category.id,
      );
      const totalStock = categoryProducts.reduce((sum, p) => sum + p.stock, 0);
      const lowStockCount = categoryProducts.filter(
        (p) => p.stock <= p.minimumStockThreshold,
      ).length;

      return {
        category,
        productCount: categoryProducts.length,
        totalStock,
        averageStock:
          categoryProducts.length > 0
            ? totalStock / categoryProducts.length
            : 0,
        lowStockCount,
      };
    });
  });

  totalProducts = computed(() => {
    return this.filteredProducts().length;
  });

  totalStock = computed(() => {
    return this.filteredProducts().reduce(
      (sum, product) => sum + product.stock,
      0,
    );
  });

  lowStockCount = computed(() => {
    return this.filteredProducts().filter(
      (product) => product.stock <= product.minimumStockThreshold,
    ).length;
  });

  categoryOptions = computed(() => {
    const categories = this.categoryStore.entities();
    return categories.map((category) => ({
      label: category.name,
      value: category.id,
    }));
  });

  categoryDistributionChartData = computed<ChartDataset>(() => {
    const categoryData = this.categoryInventoryData();

    return {
      labels: categoryData.map((item) => item.category.name),
      datasets: [
        {
          label: 'Productos por Categoría',
          data: categoryData.map((item) => item.productCount),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#7FC8A9',
            '#9B5DE5',
            '#F15BB5',
            '#00BBF9',
          ],
        },
      ],
    };
  });

  categoryStockChartData = computed<ChartDataset>(() => {
    const categoryData = this.categoryInventoryData();

    return {
      labels: categoryData.map((item) => item.category.name),
      datasets: [
        {
          label: 'Stock Total',
          data: categoryData.map((item) => item.totalStock),
          backgroundColor: '#42A5F5',
        },
        {
          label: 'Productos en Alerta',
          data: categoryData.map((item) => item.lowStockCount),
          backgroundColor: '#FFA726',
        },
      ],
    };
  });

  categoryChartOptions = {
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            const value = context.parsed.y;
            return `${context.label}: ${value} productos`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  stockChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: (context: ChartTooltipContext) => {
            return `${context.dataset.label}: ${context.parsed.y} unidades`;
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
          text: 'Unidades',
        },
      },
    },
  };

  ngOnInit() {
    this.productStore.findAll();
    this.categoryStore.findAll();
    this.saleStore.findAll();
  }

  filterByCategory() {
    this.selectedStockView = 'all';
  }

  private calculateStockPercentage(product: ProductInfo): number {
    if (product.minimumStockThreshold === 0) return 100;

    const optimalStock = product.minimumStockThreshold * 3;
    const percentage = (product.stock / optimalStock) * 100;
    return Math.min(percentage, 100);
  }

  private calculateProductSales(
    product: ProductInfo,
    sales: SaleInfo[],
  ): number {
    let totalSales = 0;

    sales.forEach((sale) => {
      const saleItems = sale.items.filter(
        (item) => item.product.id === product.id,
      );
      saleItems.forEach((item) => {
        totalSales += item.quantity;
      });
    });

    return totalSales;
  }

  private determineStockStatus(
    product: ProductInfo,
  ): 'normal' | 'low' | 'critical' {
    if (product.stock <= product.minimumStockThreshold * 0.5) {
      return 'critical';
    } else if (product.stock <= product.minimumStockThreshold) {
      return 'low';
    }
    return 'normal';
  }

  getStockProgressClass(status: 'normal' | 'low' | 'critical'): string {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  }

  getStockStatusLabel(status: 'normal' | 'low' | 'critical'): string {
    switch (status) {
      case 'critical':
        return 'Crítico';
      case 'low':
        return 'Bajo';
      default:
        return 'Normal';
    }
  }
}
