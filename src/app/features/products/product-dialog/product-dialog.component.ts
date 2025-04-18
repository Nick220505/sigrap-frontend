import { CommonModule } from '@angular/common';
import { Component, effect, input, model, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { Product } from '../services/product.service';

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
      [(visible)]="visible"
      [style]="{ width: '450px' }"
      header="Product Details"
      [modal]="true"
      (onHide)="hideDialog()"
    >
      <ng-template #content>
        <div class="flex flex-col gap-6">
          @if (product().image) {
            <img
              [src]="
                'https://primefaces.org/cdn/primeng/images/demo/product/' +
                product().image
              "
              [alt]="product().name"
              title="Product image"
              class="block pb-4 m-auto"
            />
          }
          <div>
            <label for="name" class="block mb-3 font-bold">Name</label>
            <input
              type="text"
              pInputText
              id="name"
              [(ngModel)]="product().name"
              required
              fluid
            />
            @if (submitted) {
              <small class="text-red-500">Name is required.</small>
            }
          </div>
          <div>
            <label for="description" class="block mb-3 font-bold"
              >Description</label
            >
            <textarea
              id="description"
              pTextarea
              [(ngModel)]="product().description"
              required
              rows="3"
              cols="20"
              fluid
            ></textarea>
          </div>

          <div>
            <label for="inventoryStatus" class="block mb-3 font-bold"
              >Inventory Status</label
            >
            <p-select
              [(ngModel)]="product().inventoryStatus"
              inputId="inventoryStatus"
              [options]="statuses"
              optionLabel="label"
              optionValue="label"
              placeholder="Select a Status"
              fluid
            />
          </div>

          <div>
            <span class="block mb-4 font-bold">Category</span>
            <div class="grid grid-cols-12 gap-4">
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category1"
                  name="category"
                  value="Accessories"
                  [(ngModel)]="product().category"
                />
                <label for="category1">Accessories</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category2"
                  name="category"
                  value="Clothing"
                  [(ngModel)]="product().category"
                />
                <label for="category2">Clothing</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category3"
                  name="category"
                  value="Electronics"
                  [(ngModel)]="product().category"
                />
                <label for="category3">Electronics</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category4"
                  name="category"
                  value="Fitness"
                  [(ngModel)]="product().category"
                />
                <label for="category4">Fitness</label>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-12 gap-4">
            <div class="col-span-6">
              <label for="price" class="block mb-3 font-bold">Price</label>
              <p-inputnumber
                id="price"
                [(ngModel)]="product().price"
                mode="currency"
                currency="USD"
                locale="en-US"
                fluid
              />
            </div>
            <div class="col-span-6">
              <label for="quantity" class="block mb-3 font-bold"
                >Quantity</label
              >
              <p-inputnumber
                id="quantity"
                [(ngModel)]="product().quantity"
                fluid
              />
            </div>
          </div>
        </div>
      </ng-template>

      <ng-template #footer>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          text
          (click)="hideDialog()"
          (keydown.enter)="hideDialog()"
        />
        <p-button
          label="Save"
          icon="pi pi-check"
          (click)="saveProduct()"
          (keydown.enter)="saveProduct()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ProductDialogComponent {
  // Signal-based inputs
  visible = model<boolean>(false);
  productData = input<Product>({});

  // Signal-based outputs
  hideDialogEvent = output<void>();
  saveProductEvent = output<Product>();

  private readonly _product = signal<Product>({});
  product = this._product.asReadonly();
  submitted = false;

  statuses: StatusItem[] = [
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' },
  ];

  constructor() {
    // Initialize product data when productData input changes
    effect(() => {
      this._product.set(this.productData());
    });
  }

  hideDialog() {
    this.visible.set(false);
    this.hideDialogEvent.emit();
    this.submitted = false;
  }

  saveProduct() {
    this.submitted = true;

    if (this.product().name?.trim()) {
      this.saveProductEvent.emit(this._product());
      this.visible.set(false);
      this.submitted = false;
    }
  }
}
