import { CommonModule } from '@angular/common';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Product } from '@features/inventory/models/product.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-products',
  imports: [
    CommonModule,
    ToastModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    ConfirmDialogModule,
    ToolbarModule,
    FileUploadModule,
    MessageModule,
    DialogModule,
    TextareaModule,
    ReactiveFormsModule,
    FormsModule,
    InputNumberModule,
    SelectModule,
  ],
  template: `
    <p-toast />
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

    <p-dialog
      [(visible)]="dialogVisible"
      [style]="{ width: '500px' }"
      [header]="selectedProduct() ? 'Editar Producto' : 'Crear Producto'"
      modal
    >
      <form [formGroup]="productForm" class="flex flex-col gap-4 pt-4">
        @let nameControlInvalid =
          productForm.get('name')?.invalid && productForm.get('name')?.touched;
        <div class="flex flex-col gap-2" [class.p-invalid]="nameControlInvalid">
          <label for="name" class="font-bold">Nombre</label>
          <input
            type="text"
            pInputText
            id="name"
            formControlName="name"
            placeholder="Ingrese el nombre del producto"
            [class.ng-dirty]="nameControlInvalid"
            [class.ng-invalid]="nameControlInvalid"
            required
            fluid
          />
          @if (nameControlInvalid) {
            <small class="text-red-500">El nombre es obligatorio.</small>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold">Descripción</label>
          <textarea
            rows="3"
            pTextarea
            id="description"
            formControlName="description"
            placeholder="Ingrese una descripción (opcional)"
            fluid
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          @let costPriceControlInvalid =
            productForm.get('costPrice')?.invalid &&
            productForm.get('costPrice')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="costPriceControlInvalid"
          >
            <label for="costPrice" class="font-bold">Precio de Costo</label>
            <p-inputNumber
              id="costPrice"
              formControlName="costPrice"
              placeholder="0"
              min="0"
              mode="currency"
              currency="COP"
              locale="es-CO"
              [class.ng-dirty]="costPriceControlInvalid"
              [class.ng-invalid]="costPriceControlInvalid"
              required
              fluid
            />
            @if (costPriceControlInvalid) {
              <small class="text-red-500">
                El precio de costo es obligatorio.
              </small>
            }
          </div>

          @let salePriceControlInvalid =
            productForm.get('salePrice')?.invalid &&
            productForm.get('salePrice')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="salePriceControlInvalid"
          >
            <label for="salePrice" class="font-bold">Precio de Venta</label>
            <p-inputNumber
              id="salePrice"
              formControlName="salePrice"
              placeholder="0"
              min="0"
              mode="currency"
              currency="COP"
              locale="es-CO"
              [class.ng-dirty]="salePriceControlInvalid"
              [class.ng-invalid]="salePriceControlInvalid"
              required
              fluid
            />
            @if (salePriceControlInvalid) {
              <small class="text-red-500">
                El precio de venta es obligatorio.
              </small>
            }
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="category" class="font-bold">Categoría</label>
          <p-select
            id="category"
            formControlName="category"
            [options]="categoryStore.entities()"
            optionLabel="name"
            placeholder="Seleccione una categoría"
            filter
            filterBy="name"
            showClear
            appendTo="body"
            styleClass="w-full"
          />
        </div>
      </form>
      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="dialogVisible.set(false)"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="
            productForm.valid ? saveProduct() : productForm.markAllAsTouched()
          "
          [disabled]="productStore.loading()"
        />
      </ng-template>
    </p-dialog>

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class ProductsComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  readonly productStore = inject(ProductStore);
  readonly categoryStore = inject(CategoryStore);

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

  readonly productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    category: [null],
  });

  openProductDialog(product?: Product): void {
    this.selectedProduct.set(product ?? null);
    if (product) {
      this.productForm.patchValue(product);
    } else {
      this.productForm.reset();
    }
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

  saveProduct(): void {
    const productData = this.productForm.value;
    const id = this.selectedProduct()?.id;
    if (id) {
      this.productStore.update({ id, productData });
    } else {
      this.productStore.create(productData);
    }
    this.dialogVisible.set(false);
  }
}
