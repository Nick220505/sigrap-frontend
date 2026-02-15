import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, form, min, required } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { ProductData } from '@features/inventory/models/product.model';
import { CategoryStore } from '@features/inventory/stores/category-store';
import { ProductStore } from '@features/inventory/stores/product-store';
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
    InputGroupModule,
    InputGroupAddonModule,
    FormField,
    FormsModule,
    TranslateModule,
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
        productStore.selectedProduct() ? 'Edit Product' : 'Create Product'
      "
      modal
    >
      <form
        (submit)="$event.preventDefault(); onSubmit()"
        class="flex flex-col gap-4 pt-4"
      >
        @let nameInvalid =
          productForm.name().invalid() && productForm.name().touched();
        @let nameErrors = productForm.name().errors();

        <div class="flex flex-col gap-2" [class.p-invalid]="nameInvalid">
          <label for="name" class="font-bold">Name</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-box"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="name"
              [formField]="productForm.name"
              placeholder="Enter product name"
              [class.ng-dirty]="nameInvalid"
              [class.ng-invalid]="nameInvalid"
              fluid
            />
          </p-inputgroup>

          @if (nameInvalid) {
            <ul>
              @for (error of nameErrors; track error.kind) {
                <li class="text-red-500">{{ error.message }}</li>
              }
            </ul>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold">Description</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-align-left"></i>
            </p-inputgroup-addon>
            <textarea
              rows="3"
              id="description"
              [formField]="productForm.description"
              placeholder="Enter a description (optional)"
              class="w-full"
              fluid
            ></textarea>
          </p-inputgroup>
        </div>

        <div class="grid grid-cols-2 gap-4">
          @let costPriceInvalid =
            productForm.costPrice().invalid() &&
            productForm.costPrice().touched();
          @let costPriceErrors = productForm.costPrice().errors();

          <div class="flex flex-col gap-2" [class.p-invalid]="costPriceInvalid">
            <label for="costPrice" class="font-bold">Cost Price</label>
            <p-inputNumber
              id="costPrice"
              [ngModel]="productForm.costPrice().value()"
              (ngModelChange)="productForm.costPrice().value.set($event)"
              [ngModelOptions]="{ standalone: true }"
              placeholder="0"
              [min]="0"
              mode="currency"
              currency="USD"
              locale="en-US"
              [maxFractionDigits]="0"
              [step]="50"
              showButtons
              buttonLayout="horizontal"
              [class.ng-dirty]="costPriceInvalid"
              [class.ng-invalid]="costPriceInvalid"
              fluid
            />

            @if (costPriceInvalid) {
              <ul>
                @for (error of costPriceErrors; track error.kind) {
                  <li class="text-red-500">{{ error.message }}</li>
                }
              </ul>
            }
          </div>

          @let salePriceInvalid =
            productForm.salePrice().invalid() &&
            productForm.salePrice().touched();
          @let salePriceErrors = productForm.salePrice().errors();

          <div class="flex flex-col gap-2" [class.p-invalid]="salePriceInvalid">
            <label for="salePrice" class="font-bold">Sale Price</label>
            <p-inputNumber
              id="salePrice"
              [ngModel]="productForm.salePrice().value()"
              (ngModelChange)="productForm.salePrice().value.set($event)"
              [ngModelOptions]="{ standalone: true }"
              placeholder="0"
              [min]="0"
              mode="currency"
              currency="USD"
              locale="en-US"
              [maxFractionDigits]="0"
              [step]="50"
              showButtons
              buttonLayout="horizontal"
              [class.ng-dirty]="salePriceInvalid"
              [class.ng-invalid]="salePriceInvalid"
              fluid
            />

            @if (salePriceInvalid) {
              <ul>
                @for (error of salePriceErrors; track error.kind) {
                  <li class="text-red-500">{{ error.message }}</li>
                }
              </ul>
            }
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          @let stockInvalid =
            productForm.stock().invalid() && productForm.stock().touched();
          @let stockErrors = productForm.stock().errors();
          <div class="flex flex-col gap-2" [class.p-invalid]="stockInvalid">
            <label for="stock" class="font-bold">Stock</label>
            <p-inputNumber
              id="stock"
              [ngModel]="productForm.stock().value()"
              (ngModelChange)="productForm.stock().value.set($event)"
              [ngModelOptions]="{ standalone: true }"
              placeholder="0"
              [min]="0"
              [step]="1"
              showButtons
              buttonLayout="horizontal"
              [class.ng-dirty]="stockInvalid"
              [class.ng-invalid]="stockInvalid"
              fluid
            />
            @if (stockInvalid) {
              <ul>
                @for (error of stockErrors; track error.kind) {
                  <li class="text-red-500">{{ error.message }}</li>
                }
              </ul>
            }
          </div>

          @let minimumStockThresholdInvalid =
            productForm.minimumStockThreshold().invalid() &&
            productForm.minimumStockThreshold().touched();
          @let minimumStockThresholdErrors =
            productForm.minimumStockThreshold().errors();
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="minimumStockThresholdInvalid"
          >
            <label for="minimumStockThreshold" class="font-bold"
              >Minimum Stock</label
            >
            <p-inputNumber
              id="minimumStockThreshold"
              [ngModel]="productForm.minimumStockThreshold().value()"
              (ngModelChange)="productForm.minimumStockThreshold().value.set($event)"
              [ngModelOptions]="{ standalone: true }"
              placeholder="0"
              [min]="0"
              [step]="1"
              showButtons
              buttonLayout="horizontal"
              [class.ng-dirty]="minimumStockThresholdInvalid"
              [class.ng-invalid]="minimumStockThresholdInvalid"
              fluid
            />
            @if (minimumStockThresholdInvalid) {
              <ul>
                @for (error of minimumStockThresholdErrors; track error.kind) {
                  <li class="text-red-500">{{ error.message }}</li>
                }
              </ul>
            }
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="category" class="font-bold">Category</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-tag"></i>
            </p-inputgroup-addon>
            <p-select
              id="category"
              [ngModel]="productForm.categoryId().value()"
              (ngModelChange)="productForm.categoryId().value.set($event)"
              [ngModelOptions]="{ standalone: true }"
              [options]="categoryStore.entities()"
              optionLabel="name"
              optionValue="id"
              placeholder="Select a category"
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
          [label]="'common.cancel' | translate"
          icon="pi pi-times"
          text
          (onClick)="productStore.closeProductDialog()"
        />

        <p-button
          [label]="'common.save' | translate"
          icon="pi pi-check"
          type="submit"
          (onClick)="onSubmit()"
          [disabled]="productStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ProductDialog {
  readonly productStore = inject(ProductStore);
  readonly categoryStore = inject(CategoryStore);

  private readonly productModel = signal({
    name: '',
    description: '',
    costPrice: null as number | null,
    salePrice: null as number | null,
    stock: null as number | null,
    minimumStockThreshold: null as number | null,
    categoryId: null as number | null,
  });

  readonly productForm = form(this.productModel, (product) => {
    required(product.name, { message: 'validation.required' });

    required(product.costPrice, { message: 'validation.required' });
    min(product.costPrice, 0, { message: 'Cost price must be at least 0.' });

    required(product.salePrice, { message: 'validation.required' });
    min(product.salePrice, 0, { message: 'Sale price must be at least 0.' });

    required(product.stock, { message: 'validation.required' });
    min(product.stock, 0, { message: 'Stock must be at least 0.' });

    required(product.minimumStockThreshold, {
      message: 'validation.required',
    });
    min(product.minimumStockThreshold, 0, {
      message: 'Minimum stock must be at least 0.',
    });
  });

  constructor() {
    effect(() => {
      const product = this.productStore.selectedProduct();
      untracked(() => {
        if (product) {
          this.productModel.set({
            name: product.name,
            description: product.description ?? '',
            costPrice: product.costPrice,
            salePrice: product.salePrice,
            stock: product.stock,
            minimumStockThreshold: product.minimumStockThreshold,
            categoryId: product.category?.id > 0 ? product.category.id : null,
          });
        } else {
          this.productModel.set({
            name: '',
            description: '',
            costPrice: null,
            salePrice: null,
            stock: null,
            minimumStockThreshold: null,
            categoryId: null,
          });
        }
      });
    });
  }

  onSubmit(): void {
    if (this.productForm().valid()) {
      this.saveProduct();
      return;
    }

    this.productForm.name().markAsTouched();
    this.productForm.costPrice().markAsTouched();
    this.productForm.salePrice().markAsTouched();
    this.productForm.stock().markAsTouched();
    this.productForm.minimumStockThreshold().markAsTouched();
  }

  saveProduct(): void {
    const product = this.productForm().value();
    const productData: ProductData = {
      name: product.name,
      description: product.description || undefined,
      costPrice: product.costPrice!,
      salePrice: product.salePrice!,
      categoryId: product.categoryId ?? 0,
      stock: product.stock!,
      minimumStockThreshold: product.minimumStockThreshold!,
    };
    const id = this.productStore.selectedProduct()?.id;
    if (id) {
      this.productStore.update({ id, productData });
    } else {
      this.productStore.create(productData);
    }
    this.productStore.closeProductDialog();
  }
}
