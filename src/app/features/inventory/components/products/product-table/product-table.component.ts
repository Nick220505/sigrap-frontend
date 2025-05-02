import { CurrencyPipe } from '@angular/common';
import {
  Component,
  inject,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '@features/inventory/models/product.model';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-product-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    ConfirmDialogModule,
    MessageModule,
    FormsModule,
    CurrencyPipe,
  ],
  template: `
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
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
      [globalFilterFields]="['name', 'description', 'category.name']"
      [tableStyle]="{ 'min-width': '70rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedProducts"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Administrar Productos</h5>
          </div>
          <div class="flex items-center w-full sm:w-auto">
            <p-iconfield class="w-full">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input
                pInputText
                type="text"
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                [(ngModel)]="searchValue"
                placeholder="Buscar..."
                class="w-full"
              />
            </p-iconfield>
          </div>
        </div>
      </ng-template>
      <ng-template #header>
        <tr>
          <th style="width: 3rem">
            <p-tableHeaderCheckbox />
          </th>
          @for (column of columns; track column.field) {
            <th pSortableColumn="{{ column.field }}">
              <div class="flex items-center gap-2">
                <span>{{ column.header }}</span>
                <p-sortIcon field="{{ column.field }}" />
                <p-columnFilter
                  type="text"
                  field="{{ column.field }}"
                  display="menu"
                  class="ml-auto"
                  placeholder="Filtrar por {{ column.header.toLowerCase() }}"
                  pTooltip="Filtrar por {{ column.header.toLowerCase() }}"
                  tooltipPosition="top"
                />
              </div>
            </th>
          }
          <th>
            <div class="flex items-center gap-2">
              <span>Acciones</span>
              <button
                type="button"
                pButton
                icon="pi pi-filter-slash"
                class="p-button-rounded p-button-text p-button-secondary"
                pTooltip="Limpiar todos los filtros"
                tooltipPosition="top"
                (click)="clearAllFilters()"
                aria-label="Limpiar todos los filtros"
              ></button>
            </div>
          </th>
        </tr>
      </ng-template>
      <ng-template #body let-product let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="product" />
          </td>
          @for (column of columns; track column.field) {
            <td>
              @if (
                column.field === 'costPrice' || column.field === 'salePrice'
              ) {
                {{ product[column.field] | currency: 'COP' : '$' : '1.0-0' }}
              } @else if (column.field === 'category.name') {
                {{ product.category?.name || 'Sin categoría' }}
              } @else if (column.field === 'description') {
                {{ product[column.field] || 'Sin descripción' }}
              } @else {
                {{ product[column.field] }}
              }
            </td>
          }
          <td>
            <p-button
              icon="pi pi-pencil"
              class="mr-2"
              rounded
              outlined
              (click)="openProductDialog(product)"
              pTooltip="Editar producto"
              tooltipPosition="top"
              [disabled]="productStore.loading()"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteProduct(product)"
              pTooltip="Eliminar producto"
              tooltipPosition="top"
              [disabled]="productStore.loading()"
            />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (productStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar productos:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="productStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="productStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron productos.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class ProductTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly productStore = inject(ProductStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly dialogVisible = model.required<boolean>();
  readonly selectedProduct = model<Product | null>(null);
  readonly searchValue = signal('');
  readonly selectedProducts = linkedSignal<Product[], Product[]>({
    source: this.productStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: Product) => id));
      return prevSelected.filter(({ id }: Product) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  openProductDialog(product: Product): void {
    this.selectedProduct.set(product);
    this.dialogVisible.set(true);
  }

  deleteProduct({ id, name }: Product): void {
    this.confirmationService.confirm({
      header: 'Eliminar producto',
      message: `¿Está seguro de que desea eliminar el producto <b>${name}</b>?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.productStore.delete(id),
    });
  }
}
