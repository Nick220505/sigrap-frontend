import { Component, effect, inject, untracked } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import {
  PurchaseOrderData,
  PurchaseOrderItemData,
} from '@features/supplier/models/purchase-order.model';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order.store';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-order-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    TableModule,
    TooltipModule,
    SelectButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      [visible]="purchaseOrderStore.dialogVisible()"
      (visibleChange)="
        $event
          ? purchaseOrderStore.openOrderDialog()
          : purchaseOrderStore.closeOrderDialog()
      "
      [style]="{ width: '750px' }"
      [header]="
        purchaseOrderStore.selectedOrder() ? 'Editar Pedido' : 'Crear Pedido'
      "
      modal
    >
      <form [formGroup]="orderForm" class="flex flex-col gap-4 pt-4">
        <!-- Supplier Selection -->
        @let supplierControlInvalid =
          orderForm.get('supplierId')?.invalid &&
          orderForm.get('supplierId')?.touched;

        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="supplierControlInvalid"
        >
          <label for="supplierId" class="font-bold">Proveedor</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-building"></i>
            </p-inputgroup-addon>
            <p-select
              id="supplierId"
              formControlName="supplierId"
              [options]="supplierStore.entities()"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccione un proveedor"
              filter
              filterBy="name"
              styleClass="w-full"
              [disabled]="
                !!purchaseOrderStore.selectedOrder() &&
                purchaseOrderStore.selectedOrder()?.status !== 'DRAFT'
              "
            />
          </p-inputgroup>

          @if (supplierControlInvalid) {
            <small class="text-red-500">El proveedor es obligatorio.</small>
          }
        </div>

        <!-- Order Date -->
        @let orderDateControlInvalid =
          orderForm.get('orderDate')?.invalid &&
          orderForm.get('orderDate')?.touched;

        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="orderDateControlInvalid"
        >
          <label for="orderDate" class="font-bold">Fecha del Pedido</label>
          <p-calendar
            id="orderDate"
            formControlName="orderDate"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            styleClass="w-full"
            [class.ng-dirty]="orderDateControlInvalid"
            [class.ng-invalid]="orderDateControlInvalid"
            [disabled]="
              !!purchaseOrderStore.selectedOrder() &&
              purchaseOrderStore.selectedOrder()?.status !== 'DRAFT'
            "
          />

          @if (orderDateControlInvalid) {
            <small class="text-red-500"
              >La fecha del pedido es obligatoria.</small
            >
          }
        </div>

        <!-- Expected Delivery Date -->
        <div class="flex flex-col gap-2">
          <label for="expectedDeliveryDate" class="font-bold"
            >Fecha de Entrega Esperada</label
          >
          <p-calendar
            id="expectedDeliveryDate"
            formControlName="expectedDeliveryDate"
            [showIcon]="true"
            dateFormat="dd/mm/yy"
            styleClass="w-full"
            [minDate]="minDeliveryDate"
            [disabled]="
              !!purchaseOrderStore.selectedOrder() &&
              purchaseOrderStore.selectedOrder()?.status !== 'DRAFT'
            "
          />
        </div>

        <!-- Notes -->
        <div class="flex flex-col gap-2">
          <label for="notes" class="font-bold">Notas</label>
          <textarea
            pInputTextarea
            id="notes"
            formControlName="notes"
            rows="3"
            class="w-full"
            placeholder="Información adicional sobre el pedido"
            [disabled]="
              !!purchaseOrderStore.selectedOrder() &&
              purchaseOrderStore.selectedOrder()?.status !== 'DRAFT'
            "
          ></textarea>
        </div>

        <!-- Order Items -->
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="font-bold">Productos</span>
            <p-button
              icon="pi pi-plus"
              label="Agregar Producto"
              (onClick)="addItem()"
              [disabled]="
                !productStore.entities().length ||
                (!!purchaseOrderStore.selectedOrder() &&
                  purchaseOrderStore.selectedOrder()?.status !== 'DRAFT')
              "
              severity="secondary"
              size="small"
            />
          </div>

          <div formArrayName="items">
            @for (item of itemsArray.controls; track $index) {
              <div [formGroupName]="$index" class="p-4 border rounded-lg mb-3">
                <div class="flex justify-between items-center mb-3">
                  <h5 class="m-0">Producto {{ $index + 1 }}</h5>
                  <button
                    pButton
                    type="button"
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-danger p-button-text"
                    (click)="removeItem($index)"
                    [disabled]="
                      !!purchaseOrderStore.selectedOrder() &&
                      purchaseOrderStore.selectedOrder()?.status !== 'DRAFT'
                    "
                    pTooltip="Eliminar producto"
                    tooltipPosition="top"
                    aria-label="Eliminar producto"
                  ></button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Product -->
                  <div class="flex flex-col gap-2">
                    <span class="font-semibold">Producto</span>
                    <p-select
                      formControlName="productId"
                      [options]="productStore.entities()"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Seleccione un producto"
                      (onChange)="onProductChange($index, $event.value)"
                      filter
                      filterBy="name"
                      [showClear]="true"
                      [disabled]="
                        !!purchaseOrderStore.selectedOrder() &&
                        purchaseOrderStore.selectedOrder()?.status !== 'DRAFT'
                      "
                    />
                  </div>

                  <!-- Quantity -->
                  <div class="flex flex-col gap-2">
                    <span class="font-semibold">Cantidad</span>
                    <p-inputNumber
                      formControlName="quantity"
                      [min]="1"
                      [showButtons]="true"
                      [disabled]="
                        !!purchaseOrderStore.selectedOrder() &&
                        purchaseOrderStore.selectedOrder()?.status !== 'DRAFT'
                      "
                    />
                  </div>

                  <!-- Unit Price -->
                  <div class="flex flex-col gap-2">
                    <span class="font-semibold">Precio Unitario</span>
                    <p-inputNumber
                      formControlName="unitPrice"
                      mode="currency"
                      currency="COP"
                      locale="es-CO"
                      [min]="0"
                      [disabled]="
                        !!purchaseOrderStore.selectedOrder() &&
                        purchaseOrderStore.selectedOrder()?.status !== 'DRAFT'
                      "
                    />
                  </div>

                  <!-- Notes -->
                  <div class="flex flex-col gap-2">
                    <span class="font-semibold">Notas</span>
                    <input
                      type="text"
                      pInputText
                      formControlName="notes"
                      placeholder="Observaciones específicas"
                      [disabled]="
                        !!purchaseOrderStore.selectedOrder() &&
                        purchaseOrderStore.selectedOrder()?.status !== 'DRAFT'
                      "
                    />
                  </div>
                </div>
              </div>
            }

            @if (!itemsArray.controls.length) {
              <div
                class="p-4 border rounded-lg text-center text-gray-500 italic"
              >
                No hay productos en este pedido. Haga clic en "Agregar Producto"
                para añadir.
              </div>
            }
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="purchaseOrderStore.closeOrderDialog()"
        />

        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="orderForm.valid ? saveOrder() : orderForm.markAllAsTouched()"
          [disabled]="
            purchaseOrderStore.loading() ||
            (!!purchaseOrderStore.selectedOrder() &&
              purchaseOrderStore.selectedOrder()?.status !== 'DRAFT')
          "
        />
      </ng-template>
    </p-dialog>
  `,
})
export class OrderDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly purchaseOrderStore = inject(PurchaseOrderStore);
  readonly supplierStore = inject(SupplierStore);
  readonly productStore = inject(ProductStore);
  readonly categoryStore = inject(CategoryStore);

  readonly orderForm: FormGroup = this.fb.group({
    supplierId: [null, Validators.required],
    orderDate: [new Date(), Validators.required],
    expectedDeliveryDate: [null],
    notes: [''],
    items: this.fb.array([]),
  });

  get itemsArray(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  get minDeliveryDate(): Date {
    const currentDate = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(currentDate.getDate() + 1);
    return tomorrow;
  }

  constructor() {
    effect(() => {
      const order = this.purchaseOrderStore.selectedOrder();
      untracked(() => {
        if (order) {
          // Clear items array first
          while (this.itemsArray.length) {
            this.itemsArray.removeAt(0);
          }

          // Convert dates from string to Date objects
          const orderDate = order.orderDate ? new Date(order.orderDate) : null;
          const expectedDeliveryDate = order.expectedDeliveryDate
            ? new Date(order.expectedDeliveryDate)
            : null;

          // Patch the main form values
          this.orderForm.patchValue({
            supplierId: order.supplier?.id,
            orderDate,
            expectedDeliveryDate,
            notes: order.notes || '',
          });

          // Add each item to the form array
          if (order.items && order.items.length > 0) {
            order.items.forEach((item) => {
              this.itemsArray.push(
                this.fb.group({
                  id: [item.id],
                  productId: [item.product.id, Validators.required],
                  quantity: [
                    item.quantity,
                    [Validators.required, Validators.min(1)],
                  ],
                  unitPrice: [
                    item.unitPrice,
                    [Validators.required, Validators.min(0)],
                  ],
                  notes: [item.notes || ''],
                }),
              );
            });
          }
        } else {
          this.orderForm.reset({
            supplierId: null,
            orderDate: new Date(),
            expectedDeliveryDate: null,
            notes: '',
          });

          // Clear items
          while (this.itemsArray.length) {
            this.itemsArray.removeAt(0);
          }
        }
      });
    });
  }

  addItem(): void {
    this.itemsArray.push(
      this.fb.group({
        productId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
        notes: [''],
      }),
    );
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  onProductChange(index: number, productId: number): void {
    if (!productId) return;

    const product = this.productStore
      .entities()
      .find((p) => p.id === productId);
    if (product) {
      // Set default unit price to product cost price
      this.itemsArray.at(index).patchValue({
        unitPrice: product.costPrice,
      });
    }
  }

  formatDateToISO(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  saveOrder(): void {
    const formValue = this.orderForm.value;

    // Format dates to ISO string format (YYYY-MM-DD)
    const orderData: PurchaseOrderData = {
      supplierId: formValue.supplierId,
      orderDate: this.formatDateToISO(formValue.orderDate) as string,
      expectedDeliveryDate:
        this.formatDateToISO(formValue.expectedDeliveryDate) ?? undefined,
      notes: formValue.notes,
      items: formValue.items.map(
        (item: PurchaseOrderItemData & { id?: number }) => {
          const itemData: PurchaseOrderItemData = {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: item.notes,
          };

          // Include ID if it exists (for updates)
          if (item.id) {
            itemData.id = item.id;
          }

          return itemData;
        },
      ),
    };

    const orderId = this.purchaseOrderStore.selectedOrder()?.id;
    if (orderId) {
      this.purchaseOrderStore.update({ id: orderId, orderData });
    } else {
      this.purchaseOrderStore.create(orderData);
    }
    this.purchaseOrderStore.closeOrderDialog();
  }
}
