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
      header="Detalles del Producto"
      [modal]="true"
      (onHide)="hideDialog()"
    >
      <ng-template #content>
        <div class="flex flex-col gap-6">
          @if (product().image || !product().id) {
            <img
              [src]="
                product().image
                  ? 'https://primefaces.org/cdn/primeng/images/demo/product/' +
                    product().image
                  : 'assets/images/product-placeholder.svg'
              "
              [alt]="product().name || 'Nuevo Producto'"
              [title]="product().image ? 'Imagen del producto' : 'Placeholder'"
              class="block pb-4 m-auto w-32 h-32 object-contain rounded-md border border-gray-200"
            />
          }
          <div>
            <label for="name" class="block mb-3 font-bold">Nombre</label>
            <input
              type="text"
              pInputText
              id="name"
              [(ngModel)]="product().name"
              required
              fluid
            />
            @if (submitted() && !product().name) {
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
              [(ngModel)]="product().description"
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
              [(ngModel)]="product().inventoryStatus"
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
                  [(ngModel)]="product().category"
                />
                <label for="category1">Accesorios</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category2"
                  name="category"
                  value="Clothing"
                  [(ngModel)]="product().category"
                />
                <label for="category2">Ropa</label>
              </div>
              <div class="flex items-center col-span-6 gap-2">
                <p-radiobutton
                  id="category3"
                  name="category"
                  value="Electronics"
                  [(ngModel)]="product().category"
                />
                <label for="category3">Electrónicos</label>
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
              <label for="price" class="block mb-3 font-bold">Precio</label>
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
                >Cantidad</label
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
  submitted = signal(false);

  statuses: StatusItem[] = [
    { label: 'EN STOCK', value: 'INSTOCK' },
    { label: 'POCO STOCK', value: 'LOWSTOCK' },
    { label: 'SIN STOCK', value: 'OUTOFSTOCK' },
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
    this.submitted.set(false);
  }

  saveProduct() {
    this.submitted.set(true);

    if (this.product().name?.trim()) {
      this.saveProductEvent.emit(this._product());
      this.visible.set(false);
      this.submitted.set(false);
    }
  }
}
