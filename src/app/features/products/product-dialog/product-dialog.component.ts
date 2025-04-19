import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
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
          @let nameControlInvalid =
            productForm.get('name')?.invalid &&
            productForm.get('name')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="nameControlInvalid"
          >
            <label for="name" class="font-bold">Nombre</label>
            <input
              type="text"
              pInputText
              id="name"
              formControlName="name"
              placeholder="Ingrese el nombre"
              [ngClass]="{ 'ng-dirty ng-invalid': nameControlInvalid }"
              required
              fluid
            />
            @if (nameControlInvalid) {
              <small class="text-red-500">El nombre es obligatorio.</small>
            }
          </div>
          @let categoryControlInvalid =
            productForm.get('category')?.invalid &&
            productForm.get('category')?.touched;
          <div
            class="flex flex-col gap-2 border rounded p-3"
            [style.border-color]="
              categoryControlInvalid
                ? 'text-red-500'
                : 'var(--p-inputtext-border-color)'
            "
          >
            <span class="font-bold">Categoría</span>
            <div class="grid grid-cols-12 gap-x-4 gap-y-2 pt-1">
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category1"
                  name="category"
                  value="Accesorios"
                  formControlName="category"
                  required
                />
                <label for="category1">Accesorios</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category2"
                  name="category"
                  value="Ropa"
                  formControlName="category"
                  required
                />
                <label for="category2">Ropa</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category3"
                  name="category"
                  value="Electrónicos"
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
            @if (categoryControlInvalid) {
              <small class="text-red-500 mt-1"
                >La categoría es obligatoria.</small
              >
            }
          </div>
          <div class="grid grid-cols-12 gap-4">
            @let priceControlInvalid =
              productForm.get('price')?.invalid &&
              productForm.get('price')?.touched;
            <div
              class="flex flex-col col-span-6 gap-2"
              [class.p-invalid]="priceControlInvalid"
            >
              <label for="price" class="font-bold">Precio</label>
              <p-inputnumber
                id="price"
                formControlName="price"
                mode="currency"
                currency="USD"
                locale="en-US"
                placeholder="Ingrese el precio"
                [ngClass]="{ 'ng-dirty ng-invalid': priceControlInvalid }"
                required
                fluid
              />
              @if (priceControlInvalid) {
                <small class="text-red-500">El precio es obligatorio.</small>
              }
            </div>
            <div class="flex flex-col col-span-6 gap-2">
              <label for="quantity" class="font-bold">Cantidad</label>
              <p-inputnumber
                id="quantity"
                formControlName="quantity"
                placeholder="Ingrese la cantidad"
                fluid
              />
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
          (click)="
            productForm.valid ? saveProduct() : productForm.markAllAsTouched()
          "
          [disabled]="productStore.isLoading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ProductDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly productStore = inject(ProductStore);

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    price: [0, Validators.required],
    quantity: [0],
  });
  isDialogVisible = signal(false);
  isEditMode = signal(false);

  constructor() {
    effect(() => {
      const isDialogVisible = this.productStore.selectIsDialogVisible();
      const selectedProduct = this.productStore.selectSelectedProductForEdit();
      this.isDialogVisible.set(isDialogVisible);
      this.isEditMode.set(!!selectedProduct);
      if (selectedProduct) {
        this.productForm.patchValue(selectedProduct);
      } else {
        this.productForm.reset();
      }
    });
  }

  saveProduct(): void {
    const productData = this.productForm.value;
    const id = this.productStore.selectSelectedProductForEdit()?.id;
    if (id) {
      this.productStore.updateProduct({ id, productData });
    } else {
      this.productStore.addProduct(productData);
    }
  }
}
