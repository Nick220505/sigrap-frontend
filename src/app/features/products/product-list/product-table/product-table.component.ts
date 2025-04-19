import { CommonModule } from '@angular/common';
import { Component, effect, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { Product } from '../../models/product.model';
import { ProductStore } from '../../store/product.store';

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
          (onClick)="productStore.loadProducts()"
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
          { field: 'inventoryStatus', header: 'Estado' },
        ]"
        [paginator]="true"
        [globalFilterFields]="['name', 'category', 'price', 'inventoryStatus']"
        [tableStyle]="{ 'min-width': '65rem' }"
        [selection]="productStore.getSelectedProductsFromIds()"
        (selectionChange)="productStore.setSelectedProducts($event)"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10, 20, 30]"
      >
        <ng-template #caption>
          <div class="flex items-center justify-between">
            <h5 class="m-0">Administrar Productos</h5>
            <p-iconfield>
              <p-inputicon styleClass="pi pi-search" />
              <input
                pInputText
                type="text"
                (input)="onGlobalFilter($event, dt)"
                placeholder="Buscar..."
                class="pl-8"
                [disabled]="
                  !productStore.productCount() || productStore.isLoading()
                "
              />
            </p-iconfield>
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th scope="col" style="width: 3rem">
              <p-tableHeaderCheckbox
                [disabled]="
                  !productStore.productCount() || productStore.isLoading()
                "
              />
            </th>
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
            <th
              scope="col"
              pSortableColumn="inventoryStatus"
              style="min-width: 10rem"
            >
              Estado
              <p-sortIcon field="inventoryStatus" />
            </th>
            <th scope="col" style="width: 8rem">Acciones</th>
          </tr>
        </ng-template>
        <ng-template #body let-product>
          <tr>
            <td style="width: 3rem">
              <p-tableCheckbox [value]="product" />
            </td>
            <td style="min-width: 16rem">{{ product.name }}</td>
            <td style="min-width: 8rem">
              {{ product.price | currency: 'USD' }}
            </td>
            <td style="min-width: 10rem">{{ product.category }}</td>
            <td style="min-width: 10rem">
              @switch (product.inventoryStatus) {
                @case ('INSTOCK') {
                  <p-tag value="EN STOCK" severity="success" />
                }
                @case ('LOWSTOCK') {
                  <p-tag value="POCO STOCK" severity="warn" />
                }
                @case ('OUTOFSTOCK') {
                  <p-tag value="SIN STOCK" severity="danger" />
                }
                @default {
                  <p-tag [value]="product.inventoryStatus" severity="info" />
                }
              }
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
  private readonly confirmationService = inject(ConfirmationService);
  readonly productStore = inject(ProductStore);

  readonly dt = viewChild<Table>('dt');

  constructor() {
    effect(() => {
      this.productStore.setTableInstance(this.dt() ?? null);
    });
  }

  onGlobalFilter(event: Event, table: Table): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  deleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas eliminar ' + product.name + '?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        if (product.id) {
          this.productStore.deleteProduct(product.id);
        }
      },
    });
  }
}
