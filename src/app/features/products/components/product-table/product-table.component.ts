import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductStore } from '@features/products/store/product.store';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputSwitchModule } from 'primeng/inputswitch';
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
    InputSwitchModule,
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
      @let columns =
        [
          { field: 'name', header: 'Nombre' },
          { field: 'costPrice', header: 'Precio de Costo ($)' },
          { field: 'salePrice', header: 'Precio de Venta ($)' },
          { field: 'category.name', header: 'Categoría' },
          { field: 'active', header: 'Estado' },
        ];
      <p-table
        #dt
        [value]="productStore.getActiveProducts()"
        [loading]="productStore.isLoading()"
        [rows]="10"
        [columns]="columns"
        [paginator]="true"
        [globalFilterFields]="['name', 'category.name']"
        [tableStyle]="{ 'min-width': '75rem' }"
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
            <th scope="col" pSortableColumn="name" style="min-width: 14rem">
              {{ columns[0].header }}
              <p-sortIcon field="name" />
            </th>
            <th scope="col" pSortableColumn="costPrice" style="min-width: 8rem">
              {{ columns[1].header }}
              <p-sortIcon field="costPrice" />
            </th>
            <th scope="col" pSortableColumn="salePrice" style="min-width: 8rem">
              {{ columns[2].header }}
              <p-sortIcon field="salePrice" />
            </th>
            <th
              scope="col"
              pSortableColumn="category.name"
              style="min-width: 10rem"
            >
              {{ columns[3].header }}
              <p-sortIcon field="category.name" />
            </th>
            <th scope="col" pSortableColumn="active" style="min-width: 6rem">
              {{ columns[4].header }}
              <p-sortIcon field="active" />
            </th>
            <th scope="col" style="width: 8rem">Acciones</th>
          </tr>
        </ng-template>
        <ng-template #body let-product>
          <tr>
            <td style="min-width: 14rem">{{ product.name }}</td>
            <td style="min-width: 8rem">
              {{ product.costPrice | currency: 'USD' }}
            </td>
            <td style="min-width: 8rem">
              {{ product.salePrice | currency: 'USD' }}
            </td>
            <td style="min-width: 10rem">
              {{ product.category?.name || '-' }}
            </td>
            <td style="min-width: 6rem">
              <p-inputSwitch
                [(ngModel)]="product.active"
                (onChange)="productStore.toggleStatus(product.id)"
                [disabled]="productStore.isLoading()"
              ></p-inputSwitch>
            </td>
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
                (click)="productStore.deleteWithConfirmation(product)"
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
              <td [attr.colspan]="6" class="text-center py-4">
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
  readonly productStore = inject(ProductStore);
}
