import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Product } from '../../../models/product.model';
import { ProductStore } from '../../../stores/product.store';
import { ProductDialogComponent } from '../product-dialog/product-dialog.component';

@Component({
  selector: 'app-product-table',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    ConfirmDialogModule,
    TagModule,
    ProductDialogComponent,
  ],
  template: `
    @if (productStore.error(); as error) {
      <div
        class="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded"
      >
        <p>Error al cargar productos:</p>
        <p>{{ error }}</p>
        <p-button
          label="Reintentar"
          (onClick)="productStore.loadAll()"
          styleClass="p-button-sm mt-2"
          [loading]="productStore.loading()"
        />
      </div>
    } @else {
      @let columns =
        [
          { field: 'name', header: 'Nombre' },
          { field: 'description', header: 'Descripción' },
          { field: 'costPrice', header: 'Precio Costo' },
          { field: 'salePrice', header: 'Precio Venta' },
          { field: 'category.name', header: 'Categoría' },
        ];
      <p-table
        #dt
        [value]="productStore.entities()"
        [loading]="productStore.loading()"
        [rows]="10"
        [columns]="columns"
        [paginator]="true"
        [globalFilterFields]="['name', 'description', 'category.name']"
        [tableStyle]="{ 'min-width': '70rem' }"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10, 20, 30]"
      >
        <ng-template #caption>
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
          >
            <h5 class="text-xl font-semibold m-0">Administrar Productos</h5>
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <p-iconfield iconPosition="left">
                <p-inputicon class="pi pi-search" />
                <input
                  pInputText
                  type="text"
                  (input)="
                    dt.filterGlobal($any($event.target).value, 'contains')
                  "
                  placeholder="Buscar..."
                  class="w-full sm:w-auto"
                  [disabled]="
                    !productStore.productsCount() || productStore.loading()
                  "
                />
              </p-iconfield>
              <div class="flex gap-2">
                <p-button
                  label="Nuevo"
                  icon="pi pi-plus"
                  severity="secondary"
                  (onClick)="openProductDialog()"
                  pTooltip="Crear nuevo producto"
                  tooltipPosition="top"
                  [disabled]="productStore.loading()"
                />
                <p-button
                  label="Exportar"
                  icon="pi pi-upload"
                  severity="secondary"
                  (onClick)="dt.exportCSV()"
                  pTooltip="Exportar datos a CSV"
                  tooltipPosition="top"
                  [disabled]="
                    productStore.loading() || !productStore.productsCount()
                  "
                />
              </div>
            </div>
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th scope="col" pSortableColumn="name" style="min-width: 12rem">
              {{ columns[0].header }}
              <p-sortIcon field="name" />
            </th>
            <th
              scope="col"
              pSortableColumn="description"
              style="min-width: 14rem"
            >
              {{ columns[1].header }}
              <p-sortIcon field="description" />
            </th>
            <th scope="col" pSortableColumn="costPrice" style="width: 8rem">
              {{ columns[2].header }}
              <p-sortIcon field="costPrice" />
            </th>
            <th scope="col" pSortableColumn="salePrice" style="width: 8rem">
              {{ columns[3].header }}
              <p-sortIcon field="salePrice" />
            </th>
            <th
              scope="col"
              pSortableColumn="category.name"
              style="width: 10rem"
            >
              {{ columns[4].header }}
              <p-sortIcon field="category.name" />
            </th>
            <th scope="col" style="width: 8rem">Acciones</th>
          </tr>
        </ng-template>
        <ng-template #body let-product>
          <tr>
            <td style="min-width: 12rem">{{ product.name }}</td>
            <td style="min-width: 14rem">
              {{ product.description || 'Sin descripción' }}
            </td>
            <td style="width: 8rem">
              {{ product.costPrice | currency: 'USD' : 'symbol' : '1.2-2' }}
            </td>
            <td style="width: 8rem">
              {{ product.salePrice | currency: 'USD' : 'symbol' : '1.2-2' }}
            </td>
            <td style="width: 10rem">
              {{ product.category?.name || 'Sin categoría' }}
            </td>
            <td style="width: 8rem">
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="openProductDialog(product)"
                pTooltip="Editar"
                tooltipPosition="top"
                [disabled]="productStore.loading()"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="confirmDelete(product)"
                pTooltip="Eliminar"
                tooltipPosition="top"
                [disabled]="productStore.loading()"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #empty>
          @if (!productStore.loading() && !productStore.productsCount()) {
            <tr>
              <td [attr.colspan]="7" class="text-center py-4">
                No hay productos disponibles.
              </td>
            </tr>
          }
        </ng-template>
      </p-table>

      <app-product-dialog
        [(visible)]="dialogVisible"
        [(inputProduct)]="selectedProduct"
      />

      <p-confirmdialog [style]="{ width: '450px' }" />
    }
  `,
})
export class ProductTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly productStore = inject(ProductStore);

  dialogVisible = signal(false);
  selectedProduct = signal<Product | null>(null);

  openProductDialog(product?: Product) {
    this.selectedProduct.set(product ?? null);
    this.dialogVisible.set(true);
  }

  confirmDelete({ id, name }: Product): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el producto "${name}"?`,
      header: 'Eliminar producto',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.productStore.delete(id),
    });
  }
}
