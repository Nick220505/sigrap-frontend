import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Product } from '../services/product.service';
import { ProductStore } from '../store/product.store';

interface StatusItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-product-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    RadioButtonModule,
    SelectModule,
  ],
  template: `
    <p-dialog
      [(visible)]="isDialogVisible"
      [style]="{ width: '450px' }"
      header="Detalles del Producto"
      [modal]="true"
      (onHide)="hideDialog()"
    >
      <ng-template #content>
        <div class="flex flex-col gap-6">
          <div>
            <label for="name" class="block mb-3 font-bold">Nombre</label>
            <input
              type="text"
              pInputText
              id="name"
              [(ngModel)]="_product().name"
              required
              fluid
            />
            @if (submitted() && !_product().name) {
              <small class="text-red-500">El nombre es obligatorio.</small>
            }
          </div>
          <div>
            <label for="description" class="block mb-3 font-bold"
              >Descripción</label
            >
            <textarea
              id="description"
              pTextarea
              [(ngModel)]="_product().description"
              required
              rows="3"
              cols="20"
              fluid
            ></textarea>
          </div>

          <div>
            <label for="inventoryStatus" class="block mb-3 font-bold"
              >Estado de Inventario</label
            >
            <p-select
              [(ngModel)]="_product().inventoryStatus"
              inputId="inventoryStatus"
              [options]="statuses"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona un Estado"
              fluid
            />
          </div>

          <div>
            <span class="block mb-4 font-bold">Categoría</span>
            <div class="grid grid-cols-12 gap-4">
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category1"
                  name="category"
                  value="Accessories"
                  [(ngModel)]="_product().category"
                />
                <label for="category1">Accesorios</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category2"
                  name="category"
                  value="Clothing"
                  [(ngModel)]="_product().category"
                />
                <label for="category2">Ropa</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category3"
                  name="category"
                  value="Electronics"
                  [(ngModel)]="_product().category"
                />
                <label for="category3">Electrónicos</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category4"
                  name="category"
                  value="Fitness"
                  [(ngModel)]="_product().category"
                />
                <label for="category4">Fitness</label>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <label for="price" class="block mb-3 font-bold">Precio</label>
              <p-inputnumber
                id="price"
                [(ngModel)]="_product().price"
                mode="currency"
                currency="USD"
                locale="en-US"
                fluid
              />
            </div>
            <div class="col-span-6">
              <label for="quantity" class="block mb-3 font-bold"
                >Cantidad</label
              >
              <p-inputnumber
                id="quantity"
                [(ngModel)]="_product().quantity"
                fluid
              />
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="hideDialog()"
          (keydown.enter)="hideDialog()"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="saveProduct()"
          (keydown.enter)="saveProduct()"
          [disabled]="productStore.isLoading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ProductDialogComponent {
  readonly productStore = inject(ProductStore);

  readonly _product = signal<Product>({});
  submitted = signal(false);

  isDialogVisible = signal(false);

  isEditMode = computed(() => !!this._product().id);

  statuses: StatusItem[] = [
    { label: 'EN STOCK', value: 'INSTOCK' },
    { label: 'POCO STOCK', value: 'LOWSTOCK' },
    { label: 'SIN STOCK', value: 'OUTOFSTOCK' },
  ];

  constructor() {
    effect(() => {
      const storeVisible = this.productStore.selectIsDialogVisible();
      const storeProduct = this.productStore.selectSelectedProductForEdit();

      this.isDialogVisible.set(storeVisible);

      if (storeVisible) {
        this._product.set(storeProduct ? { ...storeProduct } : {});
        this.submitted.set(false);
      } else {
        // Optionally reset local product when dialog closes externally (e.g., success)
        // this._product.set({});
      }
    });
  }

  hideDialog() {
    this.productStore.closeDialog();
  }

  saveProduct() {
    this.submitted.set(true);
    const currentProduct = this._product();

    if (currentProduct.name?.trim()) {
      if (this.isEditMode()) {
        this.productStore.updateProduct(currentProduct);
      } else {
        const newProductData = { ...currentProduct };
        delete newProductData.id;
        delete newProductData.code;
        this.productStore.addProduct(newProductData);
      }
    } else {
      console.warn('Product name is required.');
    }
  }
}
