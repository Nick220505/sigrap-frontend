import { Component, computed, effect, inject, untracked } from '@angular/core';
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
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
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
    DatePickerModule,
    TableModule,
    TooltipModule,
    SelectButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    TextareaModule,
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
        purchaseOrderStore.viewOnly()
          ? 'Ver Pedido'
          : purchaseOrderStore.selectedOrder()
            ? 'Editar Pedido'
            : 'Crear Pedido'
      "
      modal
    >
      <form [formGroup]="orderForm" class="flex flex-col gap-4 pt-4">
        <!-- Supplier and Dates Row -->
        <div class="flex flex-col md:flex-row md:items-start">
          <!-- Supplier Selection -->
          @let supplierControlInvalid =
            orderForm.get('supplierId')?.invalid &&
            orderForm.get('supplierId')?.touched;

          <div
            class="flex flex-col gap-2 md:w-1/3 md:mr-8"
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
              />
            </p-inputgroup>

            @if (supplierControlInvalid) {
              <small class="text-red-500">El proveedor es obligatorio.</small>
            }
          </div>

          <!-- Dates Wrapper -->
          <div class="flex flex-col md:flex-row md:w-2/3 gap-4">
            <!-- Order Date -->
            @let orderDateControlInvalid =
              orderForm.get('orderDate')?.invalid &&
              orderForm.get('orderDate')?.touched;

            <div
              class="flex flex-col gap-2 md:w-1/2"
              [class.p-invalid]="orderDateControlInvalid"
            >
              <label for="orderDate" class="font-bold">Fecha del Pedido</label>
              <p-datePicker
                id="orderDate"
                formControlName="orderDate"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                [class.ng-dirty]="orderDateControlInvalid"
                [class.ng-invalid]="orderDateControlInvalid"
                styleClass="w-full"
              />

              @if (orderDateControlInvalid) {
                <small class="text-red-500"
                  >La fecha del pedido es obligatoria.</small
                >
              }
            </div>

            <!-- Expected Delivery Date -->
            <div class="flex flex-col gap-2 md:w-1/2">
              <label for="expectedDeliveryDate" class="font-bold"
                >Fecha de Entrega Esperada</label
              >
              <p-datePicker
                id="expectedDeliveryDate"
                formControlName="expectedDeliveryDate"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                [minDate]="minDeliveryDate"
                styleClass="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="flex flex-col gap-2">
          <label for="notes" class="font-bold">Notas</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-align-left"></i>
            </p-inputgroup-addon>
            <textarea
              rows="3"
              pTextarea
              id="notes"
              formControlName="notes"
              placeholder="Información adicional sobre el pedido"
              class="w-full"
              fluid
            ></textarea>
          </p-inputgroup>
        </div>

        <!-- Order Items -->
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="font-bold">Productos</span>
            @if (!purchaseOrderStore.viewOnly()) {
              <p-button
                icon="pi pi-plus"
                label="Agregar Producto"
                (onClick)="addItem()"
                [disabled]="isFormDisabled() || !productStore.entities().length"
                severity="secondary"
                size="small"
              />
            }
          </div>

          <div formArrayName="items">
            @for (item of itemsArray.controls; track $index) {
              <div [formGroupName]="$index" class="p-4 border rounded-lg mb-3">
                <div class="flex justify-between items-center mb-3">
                  <h5 class="m-0">Producto {{ $index + 1 }}</h5>
                  @if (!purchaseOrderStore.viewOnly()) {
                    <button
                      pButton
                      type="button"
                      icon="pi pi-trash"
                      class="p-button-rounded p-button-danger p-button-text"
                      (click)="removeItem($index)"
                      [disabled]="isFormDisabled()"
                      pTooltip="Eliminar producto"
                      tooltipPosition="top"
                      aria-label="Eliminar producto"
                    ></button>
                  }
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
                    />
                  </div>

                  <!-- Quantity -->
                  <div class="flex flex-col gap-2">
                    <span class="font-semibold">Cantidad</span>
                    <p-inputNumber
                      formControlName="quantity"
                      [min]="1"
                      [showButtons]="true"
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
                    />
                  </div>
                </div>
              </div>
            }

            @if (!itemsArray.controls.length) {
              <div
                class="p-4 border rounded-lg text-center text-gray-500 italic"
              >
                No hay productos en este pedido.
                @if (!purchaseOrderStore.viewOnly()) {
                  Haga clic en "Agregar Producto" para añadir.
                }
              </div>
            }
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          [label]="purchaseOrderStore.viewOnly() ? 'Cerrar' : 'Cancelar'"
          icon="pi pi-times"
          text
          (click)="purchaseOrderStore.closeOrderDialog()"
        />

        @if (!purchaseOrderStore.viewOnly()) {
          <p-button
            label="Guardar"
            icon="pi pi-check"
            (click)="
              orderForm.valid ? saveOrder() : orderForm.markAllAsTouched()
            "
            [disabled]="purchaseOrderStore.loading() || isFormDisabled()"
          />
        }
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

  readonly isFormDisabled = computed(() => {
    const order = this.purchaseOrderStore.selectedOrder();
    return (
      this.purchaseOrderStore.viewOnly() ||
      (!!order && order.status !== 'DRAFT')
    );
  });

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
      const disableForm = this.isFormDisabled();

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
            notes: order.notes ?? '',
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
                  notes: [item.notes ?? ''],
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

        // Programmatically enable/disable form controls
        if (disableForm) {
          this.orderForm.get('supplierId')?.disable();
          this.orderForm.get('orderDate')?.disable();
          this.orderForm.get('expectedDeliveryDate')?.disable();
          this.orderForm.get('notes')?.disable();
          this.itemsArray.controls.forEach((controlGroup) => {
            (controlGroup as FormGroup).controls['productId']?.disable();
            (controlGroup as FormGroup).controls['quantity']?.disable();
            (controlGroup as FormGroup).controls['unitPrice']?.disable();
            (controlGroup as FormGroup).controls['notes']?.disable();
          });
        } else {
          this.orderForm.get('supplierId')?.enable();
          this.orderForm.get('orderDate')?.enable();
          this.orderForm.get('expectedDeliveryDate')?.enable();
          this.orderForm.get('notes')?.enable();
          this.itemsArray.controls.forEach((controlGroup) => {
            (controlGroup as FormGroup).controls['productId']?.enable();
            (controlGroup as FormGroup).controls['quantity']?.enable();
            (controlGroup as FormGroup).controls['unitPrice']?.enable();
            (controlGroup as FormGroup).controls['notes']?.enable();
          });
        }
      });
    });
  }

  addItem(): void {
    const newItem = this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      notes: [''],
    });

    if (this.isFormDisabled()) {
      newItem.disable();
    }

    this.itemsArray.push(newItem);
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
    const formValue = this.orderForm.getRawValue(); // Use getRawValue to include disabled controls

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
