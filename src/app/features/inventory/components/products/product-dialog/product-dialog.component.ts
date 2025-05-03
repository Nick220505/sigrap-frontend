import { Component, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-product-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
  ],
  template: `
    <p-dialog
      [visible]="productStore.dialogVisible()"
      (visibleChange)="
        $event
          ? productStore.openProductDialog()
          : productStore.closeProductDialog()
      "
      [style]="{ width: '500px' }"
      [header]="
        productStore.selectedProduct() ? 'Editar Producto' : 'Crear Producto'
      "
      modal
    >
      <form [formGroup]="productForm" class="flex flex-col gap-4 pt-4">
        @let nameControlInvalid =
          productForm.get('name')?.invalid && productForm.get('name')?.touched;

        <div class="flex flex-col gap-2" [class.p-invalid]="nameControlInvalid">
          <label for="name" class="font-bold">Nombre</label>
          <p-iconfield>
            <p-inputicon class="pi pi-box" />
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
          </p-iconfield>

          @if (nameControlInvalid) {
            <small class="text-red-500">El nombre es obligatorio.</small>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold">Descripción</label>
          <div class="relative flex items-start">
            <i class="pi pi-align-left absolute left-3 top-3 text-gray-500"></i>
            <textarea
              rows="3"
              pTextarea
              id="description"
              formControlName="description"
              placeholder="Ingrese una descripción (opcional)"
              class="pl-9 w-full"
              fluid
            ></textarea>
          </div>
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
              maxFractionDigits="0"
              step="50"
              showButtons
              buttonLayout="horizontal"
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
              maxFractionDigits="0"
              step="50"
              showButtons
              buttonLayout="horizontal"
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
          <div class="relative">
            <i
              class="pi pi-tag absolute left-3 top-1/2 -translate-y-1/2 z-10 text-gray-500"
            ></i>
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
              styleClass="w-full pl-8"
              inputStyleClass="pl-8"
            />
          </div>
        </div>
      </form>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="productStore.closeProductDialog()"
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

  readonly productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    category: [null],
  });

  constructor() {
    effect(() => {
      const product = this.productStore.selectedProduct();
      untracked(() => {
        if (product) {
          this.productForm.patchValue(product);
        } else {
          this.productForm.reset();
        }
      });
    });
  }

  saveProduct(): void {
    const productData = this.productForm.value;
    const id = this.productStore.selectedProduct()?.id;
    if (id) {
      this.productStore.update({ id, productData });
    } else {
      this.productStore.create(productData);
    }
    this.productStore.closeProductDialog();
  }
}
