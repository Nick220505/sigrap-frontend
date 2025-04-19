import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '@features/products/models/product.model';
import { ProductStore } from '@features/products/store/product.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-product-table',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    ConfirmDialogModule,
  ],
  template: `
    @if (productStore.getError(); as error) {
      <div
        class="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded"
      >
        <p>Error al cargar productos:</p>
        <p>{{ error }}</p>
        <p-button
          label="Reintentar"
          (onClick)="productStore.loadAll()"
          styleClass="p-button-sm mt-2"
          [loading]="productStore.isLoading()"
        />
      </div>
    } @else {
      <p-table
        #dt
        [value]="productStore.getProducts()"
        [loading]="productStore.isLoading()"
        [rows]="10"
        [columns]="[
          { field: 'name', header: 'Nombre' },
          { field: 'price', header: 'Precio' },
          { field: 'category', header: 'Categoría' },
        ]"
        [paginator]="true"
        [globalFilterFields]="['name', 'category', 'price']"
        [tableStyle]="{ 'min-width': '55rem' }"
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
                    !productStore.productCount() || productStore.isLoading()
                  "
                />
              </p-iconfield>
              <div class="flex gap-2">
                <p-button
                  label="Nuevo"
                  icon="pi pi-plus"
                  severity="secondary"
                  (onClick)="productStore.openDialogForNew()"
                  pTooltip="Crear nuevo producto"
                  tooltipPosition="top"
                  [disabled]="productStore.isLoading()"
                />
                <p-button
                  label="Exportar"
                  icon="pi pi-upload"
                  severity="secondary"
                  (onClick)="dt.exportCSV()"
                  pTooltip="Exportar datos a CSV"
                  tooltipPosition="top"
                  [disabled]="
                    productStore.isLoading() || !productStore.productCount()
                  "
                />
              </div>
            </div>
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th scope="col" pSortableColumn="name" style="min-width: 16rem">
              Nombre
              <p-sortIcon field="name" />
            </th>
            <th scope="col" pSortableColumn="price" style="min-width: 8rem">
              Precio
              <p-sortIcon field="price" />
            </th>
            <th scope="col" pSortableColumn="category" style="min-width: 10rem">
              Categoría
              <p-sortIcon field="category" />
            </th>
            <th scope="col" style="width: 8rem">Acciones</th>
          </tr>
        </ng-template>
        <ng-template #body let-product>
          <tr>
            <td style="min-width: 16rem">{{ product.name }}</td>
            <td style="min-width: 8rem">
              {{ product.price | currency: 'USD' }}
            </td>
            <td style="min-width: 10rem">{{ product.category }}</td>
            <td style="width: 8rem">
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="productStore.openDialogForEdit(product)"
                pTooltip="Editar"
                tooltipPosition="top"
                [disabled]="productStore.isLoading()"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="deleteProduct(product)"
                pTooltip="Eliminar"
                tooltipPosition="top"
                [disabled]="productStore.isLoading()"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #empty>
          @if (!productStore.isLoading() && !productStore.productCount()) {
            <tr>
              <td [attr.colspan]="4" class="text-center py-4">
                No hay productos disponibles.
              </td>
            </tr>
          }
        </ng-template>
      </p-table>

      <p-confirmdialog [style]="{ width: '450px' }" />
    }
  `,
})
export class ProductTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly productStore = inject(ProductStore);

  deleteProduct({ id, name }: Product): void {
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
