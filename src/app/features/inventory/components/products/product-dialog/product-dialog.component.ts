import { Component, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductData } from '@features/inventory/models/product.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
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
    InputGroupModule,
    InputGroupAddonModule,
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
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-box"></i>
            </p-inputgroup-addon>
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
          </p-inputgroup>

          @if (nameControlInvalid) {
            <small class="text-red-500">El nombre es obligatorio.</small>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold">Descripción</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-align-left"></i>
            </p-inputgroup-addon>
            <textarea
              rows="3"
              pTextarea
              id="description"
              formControlName="description"
              placeholder="Ingrese una descripción (opcional)"
              class="w-full"
              fluid
            ></textarea>
          </p-inputgroup>
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

        <div class="grid grid-cols-2 gap-4">
          @let stockControlInvalid =
            productForm.get('stock')?.invalid &&
            productForm.get('stock')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="stockControlInvalid"
          >
            <label for="stock" class="font-bold">Stock</label>
            <p-inputNumber
              id="stock"
              formControlName="stock"
              placeholder="0"
              min="0"
              step="1"
              showButtons
              buttonLayout="horizontal"
              [class.ng-dirty]="stockControlInvalid"
              [class.ng-invalid]="stockControlInvalid"
              required
              fluid
            />
            @if (stockControlInvalid) {
              <small class="text-red-500">
                El stock es obligatorio y debe ser un número positivo.
              </small>
            }
          </div>

          @let minimumStockThresholdControlInvalid =
            productForm.get('minimumStockThreshold')?.invalid &&
            productForm.get('minimumStockThreshold')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="minimumStockThresholdControlInvalid"
          >
            <label for="minimumStockThreshold" class="font-bold"
              >Stock Mínimo</label
            >
            <p-inputNumber
              id="minimumStockThreshold"
              formControlName="minimumStockThreshold"
              placeholder="0"
              min="0"
              step="1"
              showButtons
              buttonLayout="horizontal"
              [class.ng-dirty]="minimumStockThresholdControlInvalid"
              [class.ng-invalid]="minimumStockThresholdControlInvalid"
              required
              fluid
            />
            @if (minimumStockThresholdControlInvalid) {
              <small class="text-red-500">
                El stock mínimo es obligatorio y debe ser un número positivo.
              </small>
            }
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="category" class="font-bold">Categoría</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-tag"></i>
            </p-inputgroup-addon>
            <p-select
              id="category"
              formControlName="categoryId"
              [options]="categoryStore.entities()"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccione una categoría"
              filter
              filterBy="name"
              appendTo="body"
              styleClass="w-full"
            />
          </p-inputgroup>
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
    stock: [0, [Validators.required, Validators.min(0)]],
    minimumStockThreshold: [0, [Validators.required, Validators.min(0)]],
    categoryId: [null],
  });

  constructor() {
    effect(() => {
      const product = this.productStore.selectedProduct();
      untracked(() => {
        if (product) {
          const formValue = {
            ...product,
            categoryId: product.category?.id > 0 ? product.category?.id : null,
          };
          this.productForm.patchValue(formValue);
        } else {
          this.productForm.reset();
        }
      });
    });
  }

  saveProduct(): void {
    const productData: ProductData = this.productForm.value;
    const id = this.productStore.selectedProduct()?.id;
    if (id) {
      this.productStore.update({ id, productData });
    } else {
      this.productStore.create(productData);
    }
    this.productStore.closeProductDialog();
  }
}
