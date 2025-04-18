import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Product } from '../models/product.model';
import { StatusItem } from '../models/status-item.model';
import { ProductStore } from '../store/product.store';

@Component({
  selector: 'app-product-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
      [header]="isEditMode() ? 'Editar Producto' : 'Crear Producto'"
      [modal]="true"
      (onHide)="productStore.closeDialog()"
    >
      <ng-template #content>
        <form [formGroup]="productForm" class="flex flex-col gap-6 pt-4">
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="
              productForm.get('name')?.invalid &&
              productForm.get('name')?.touched
            "
          >
            <label for="name" class="font-bold">Nombre</label>
            <input
              type="text"
              pInputText
              id="name"
              formControlName="name"
              required
              fluid
            />
            @if (
              productForm.get('name')?.invalid &&
              productForm.get('name')?.touched
            ) {
              <small class="text-red-500">El nombre es obligatorio.</small>
            }
          </div>
          <div class="flex flex-col gap-2">
            <label for="description" class="font-bold">Descripción</label>
            <textarea
              id="description"
              pTextarea
              formControlName="description"
              rows="3"
              cols="20"
              fluid
            ></textarea>
          </div>
          <div class="flex flex-col gap-2">
            <label for="inventoryStatus" class="font-bold"
              >Estado de Inventario</label
            >
            <p-select
              formControlName="inventoryStatus"
              inputId="inventoryStatus"
              [options]="statuses()"
              optionLabel="label"
              optionValue="value"
              placeholder="Selecciona un Estado"
              fluid
              appendTo="body"
            />
          </div>
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="
              productForm.get('category')?.invalid &&
              productForm.get('category')?.touched
            "
          >
            <span class="font-bold">Categoría</span>
            <div class="grid grid-cols-12 gap-x-4 gap-y-2 pt-1">
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category1"
                  name="category"
                  value="Accessories"
                  formControlName="category"
                  required
                />
                <label for="category1">Accesorios</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category2"
                  name="category"
                  value="Clothing"
                  formControlName="category"
                  required
                />
                <label for="category2">Ropa</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category3"
                  name="category"
                  value="Electronics"
                  formControlName="category"
                  required
                />
                <label for="category3">Electrónicos</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category4"
                  name="category"
                  value="Fitness"
                  formControlName="category"
                  required
                />
                <label for="category4">Fitness</label>
              </div>
            </div>
            @if (
              productForm.get('category')?.invalid &&
              productForm.get('category')?.touched
            ) {
              <small class="text-red-500">La categoría es obligatoria.</small>
            }
          </div>
          <div class="grid grid-cols-12 gap-4">
            <div
              class="flex flex-col col-span-6 gap-2"
              [class.p-invalid]="
                productForm.get('price')?.invalid &&
                productForm.get('price')?.touched
              "
            >
              <label for="price" class="font-bold">Precio</label>
              <p-inputnumber
                id="price"
                formControlName="price"
                mode="currency"
                currency="USD"
                locale="en-US"
                required
                fluid
              />
              @if (
                productForm.get('price')?.invalid &&
                productForm.get('price')?.touched
              ) {
                <small class="text-red-500">El precio es obligatorio.</small>
              }
            </div>
            <div class="flex flex-col col-span-6 gap-2">
              <label for="quantity" class="font-bold">Cantidad</label>
              <p-inputnumber id="quantity" formControlName="quantity" fluid />
            </div>
          </div>
        </form>
      </ng-template>
      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="productStore.closeDialog()"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="saveProduct()"
          [disabled]="productStore.isLoading() || productForm.invalid"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ProductDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly productStore = inject(ProductStore);

  productForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    inventoryStatus: [null as string | null],
    category: [null as string | null, Validators.required],
    price: [null as number | null, Validators.required],
    quantity: [0],
  });
  isDialogVisible = signal(false);
  isEditMode = signal(false);

  readonly statuses = signal<StatusItem[]>([
    { label: 'EN STOCK', value: 'INSTOCK' },
    { label: 'POCO STOCK', value: 'LOWSTOCK' },
    { label: 'SIN STOCK', value: 'OUTOFSTOCK' },
  ]);

  constructor() {
    effect(() => {
      const storeVisible = this.productStore.selectIsDialogVisible();
      const selectedProduct = this.productStore.selectSelectedProductForEdit();
      this.isDialogVisible.set(storeVisible);
      this.isEditMode.set(!!selectedProduct);
      if (selectedProduct) {
        this.productForm.patchValue(selectedProduct);
      } else {
        this.productForm.reset();
      }
    });
  }

  saveProduct() {
    const productData = this.productForm.getRawValue() as Omit<Product, 'id'>;
    const id = this.productStore.selectSelectedProductForEdit()?.id;
    if (id) {
      this.productStore.updateProduct({ id, productData });
    } else {
      this.productStore.addProduct(productData);
    }
  }
}
