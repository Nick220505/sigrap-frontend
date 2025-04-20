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
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CategoryStore } from '../../../categories/store/category.store';
import { ProductStore } from '../../store/product.store';

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
    InputSwitchModule,
    DropdownModule,
  ],
  template: `
    <p-dialog
      [(visible)]="isDialogVisible"
      [style]="{ width: '600px' }"
      [header]="isEditMode() ? 'Editar Producto' : 'Crear Producto'"
      [modal]="true"
      (onHide)="productStore.closeDialog()"
    >
      <form [formGroup]="productForm" class="flex flex-col gap-4 pt-4">
        @let nameInvalid =
          productForm.get('name')?.invalid && productForm.get('name')?.touched;
        <div class="flex flex-col gap-2" [class.p-invalid]="nameInvalid">
          <label for="name" class="font-bold">Nombre *</label>
          <input
            type="text"
            pInputText
            id="name"
            formControlName="name"
            placeholder="Ingrese el nombre del producto"
            [ngClass]="{ 'ng-dirty ng-invalid': nameInvalid }"
          />
          @if (nameInvalid) {
            <small class="text-red-500">El nombre es obligatorio</small>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold">Descripción</label>
          <textarea
            rows="3"
            pTextarea
            id="description"
            formControlName="description"
            placeholder="Ingrese la descripción del producto"
            fluid
          ></textarea>
        </div>

        <div class="grid grid-cols-2 gap-4">
          @let costPriceInvalid =
            productForm.get('costPrice')?.invalid &&
            productForm.get('costPrice')?.touched;
          <div class="flex flex-col gap-2" [class.p-invalid]="costPriceInvalid">
            <label for="costPrice" class="font-bold">Precio de Costo *</label>
            <p-inputNumber
              id="costPrice"
              formControlName="costPrice"
              mode="currency"
              currency="USD"
              locale="en-US"
              [minFractionDigits]="2"
              [ngClass]="{ 'ng-dirty ng-invalid': costPriceInvalid }"
            />
            @if (costPriceInvalid) {
              <small class="text-red-500"
                >El precio de costo es obligatorio</small
              >
            }
          </div>
          @let salePriceInvalid =
            productForm.get('salePrice')?.invalid &&
            productForm.get('salePrice')?.touched;
          <div class="flex flex-col gap-2" [class.p-invalid]="salePriceInvalid">
            <label for="salePrice" class="font-bold">Precio de Venta *</label>
            <p-inputNumber
              id="salePrice"
              formControlName="salePrice"
              mode="currency"
              currency="USD"
              locale="en-US"
              [minFractionDigits]="2"
              [ngClass]="{ 'ng-dirty ng-invalid': salePriceInvalid }"
            />
            @if (salePriceInvalid) {
              <small class="text-red-500"
                >El precio de venta es obligatorio</small
              >
            }
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="category" class="font-bold">Categoría</label>
          <p-dropdown
            id="category"
            formControlName="category"
            [options]="categoryStore.getCategories()"
            optionLabel="name"
            placeholder="Seleccione una categoría"
            [style]="{ width: '100%' }"
          ></p-dropdown>
        </div>

        <div class="flex flex-col gap-2">
          <label for="imageUrl" class="font-bold">URL de Imagen</label>
          <input
            type="text"
            pInputText
            id="imageUrl"
            formControlName="imageUrl"
            placeholder="Ingrese la URL de la imagen"
          />
        </div>

        <div class="flex items-center gap-2">
          <p-inputSwitch id="active" formControlName="active"></p-inputSwitch>
          <label for="active" class="font-bold">Activo</label>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button
            label="Cancelar"
            icon="pi pi-times"
            (click)="productStore.closeDialog()"
            styleClass="p-button-text"
          ></p-button>
          <p-button
            label="Guardar"
            icon="pi pi-check"
            (click)="
              productForm.valid ? saveProduct() : productForm.markAllAsTouched()
            "
            [loading]="productStore.isLoading()"
          ></p-button>
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class ProductDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly productStore = inject(ProductStore);
  readonly categoryStore = inject(CategoryStore);

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    imageUrl: [''],
    category: [null],
    active: [true],
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
        this.productForm.patchValue({
          ...selectedProduct,
          category: selectedProduct.category || null,
        });
      } else {
        this.productForm.reset({
          active: true,
          costPrice: 0,
          salePrice: 0,
        });
      }
    });
  }

  saveProduct(): void {
    const formValue = this.productForm.value;
    const productData = {
      ...formValue,
      category: formValue.category ? { id: formValue.category.id } : null,
    };

    const id = this.productStore.selectSelectedProductForEdit()?.id;
    if (id) {
      this.productStore.update({ id, productData });
    } else {
      this.productStore.create(productData);
    }
  }
}
