import { CommonModule } from '@angular/common';
import { Component, effect, inject, model } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryStore } from '@features/categories/store/category.store';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CreateProductDto, Product } from '../../models/product.model';
import { ProductStore } from '../../store/product.store';

@Component({
  selector: 'app-product-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [style]="{ width: '500px' }"
      [header]="inputProduct() ? 'Editar Producto' : 'Crear Producto'"
      [modal]="true"
      (onHide)="closeDialog()"
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
            [ngClass]="{ 'ng-dirty ng-invalid': nameControlInvalid }"
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
              placeholder="0.00"
              [min]="0"
              [mode]="'currency'"
              [currency]="'USD'"
              [locale]="'en-US'"
              [ngClass]="{ 'ng-dirty ng-invalid': costPriceControlInvalid }"
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
              placeholder="0.00"
              [min]="0"
              [mode]="'currency'"
              [currency]="'USD'"
              [locale]="'en-US'"
              [ngClass]="{ 'ng-dirty ng-invalid': salePriceControlInvalid }"
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
          <p-dropdown
            id="category"
            formControlName="category"
            [options]="categoryStore.entities()"
            optionLabel="name"
            placeholder="Seleccione una categoría"
            [filter]="true"
            filterBy="name"
            [showClear]="true"
            appendTo="body"
            fluid
          />
        </div>

        <div class="flex items-center gap-2 mt-2">
          <p-checkbox
            id="active"
            formControlName="active"
            [binary]="true"
            inputId="active"
          />
          <label for="active" class="font-medium cursor-pointer">Activo</label>
        </div>
      </form>
      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="closeDialog()"
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
  `,
})
export class ProductDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly productStore = inject(ProductStore);
  readonly categoryStore = inject(CategoryStore);

  visible = model(false);
  inputProduct = model<Product | null>(null);

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    category: [null],
    active: [true],
  });

  constructor() {
    effect(() => {
      const inputProduct = this.inputProduct();
      if (inputProduct) {
        this.productForm.patchValue({
          ...inputProduct,
          category: inputProduct.category || null,
        });
      } else {
        this.productForm.reset({
          name: '',
          description: '',
          costPrice: 0,
          salePrice: 0,
          category: null,
          active: true,
        });
      }
    });
  }

  saveProduct(): void {
    const formValue = this.productForm.value;

    const productData: CreateProductDto = {
      name: formValue.name,
      description: formValue.description,
      costPrice: formValue.costPrice,
      salePrice: formValue.salePrice,
      active: formValue.active,
      category: formValue.category ? { id: formValue.category.id } : undefined,
    };

    const id = this.inputProduct()?.id;
    if (id) {
      this.productStore.update({ id, productData });
    } else {
      this.productStore.create(productData);
    }
    this.closeDialog();
  }

  closeDialog() {
    this.visible.set(false);
    this.inputProduct.set(null);
  }
}
