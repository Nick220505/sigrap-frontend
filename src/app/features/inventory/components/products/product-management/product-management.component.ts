import { CommonModule } from '@angular/common';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '@features/inventory/models/product.model';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProductDialogComponent } from '@features/inventory/components/products/product-dialog/product-dialog.component';

@Component({
  selector: 'app-product-management',
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
    ProductDialogComponent,
    ToolbarModule,
    FileUploadModule,
    MessageModule,
  ],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nuevo producto"
          tooltipPosition="top"
          (onClick)="openProductDialog()"
        />
        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar productos seleccionados"
          tooltipPosition="top"
          (onClick)="
            selectedProducts().length > 1
              ? deleteSelectedProducts()
              : deleteProduct(selectedProducts()[0])
          "
          [disabled]="!selectedProducts().length"
        />
      </ng-template>
      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar productos a CSV"
          tooltipPosition="top"
          (onClick)="dt.exportCSV()"
          [disabled]="!productStore.entities().length"
        />
      </ng-template>
    </p-toolbar>

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
      [rowsPerPageOptions]="[10, 25, 50]"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} productos"
      [globalFilterFields]="['name', 'description', 'category.name']"
      [tableStyle]="{ 'min-width': '70rem' }"
      [rowHover]="true"
      dataKey="id"
      [(selection)]="selectedProducts"
    >
      <ng-template #caption>
        <div class="flex items-center justify-between">
          <h5 class="m-0">Administrar Productos</h5>
          <p-iconfield>
            <p-inputicon>
              <i class="pi pi-search"></i>
            </p-inputicon>
            <input
              pInputText
              type="text"
              (input)="dt.filterGlobal($any($event.target).value, 'contains')"
              [(ngModel)]="searchValue"
              placeholder="Buscar..."
            />
          </p-iconfield>
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
                  placeholder="Filtrar por {{ column.header | lowercase }}"
                  pTooltip="Filtrar por {{ column.header | lowercase }}"
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
                (click)="clearAllFilters(dt)"
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
                {{
                  product[column.field] | currency: 'USD' : 'symbol' : '1.2-2'
                }}
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
              [rounded]="true"
              [outlined]="true"
              (click)="openProductDialog(product)"
              pTooltip="Editar producto"
              tooltipPosition="top"
              [disabled]="productStore.loading()"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              [rounded]="true"
              [outlined]="true"
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

    <app-product-dialog
      [(visible)]="dialogVisible"
      [(inputProduct)]="selectedProduct"
    />

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class ProductManagementComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly productStore = inject(ProductStore);

  readonly dialogVisible = signal(false);
  readonly selectedProduct = signal<Product | null>(null);
  readonly searchValue = signal('');
  readonly selectedProducts = linkedSignal<Product[], Product[]>({
    source: this.productStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }) => id));
      return prevSelected.filter(({ id }) => entityIds.has(id));
    },
  });

  openProductDialog(product?: Product): void {
    this.selectedProduct.set(product ?? null);
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

  deleteSelectedProducts(): void {
    this.confirmationService.confirm({
      message: `
        ¿Está seguro de que desea eliminar los ${this.selectedProducts().length} productos seleccionados?
        <ul class='mt-2 mb-0'>
          ${this.selectedProducts()
            .map(({ name }) => `<li>• <b>${name}</b></li>`)
            .join('')}
        </ul>
      `,
      header: 'Eliminar productos',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        const ids = this.selectedProducts().map(({ id }) => id);
        this.productStore.deleteAllById(ids);
      },
    });
  }

  clearAllFilters(dt: Table): void {
    this.searchValue.set('');
    dt.clear();
  }
}
