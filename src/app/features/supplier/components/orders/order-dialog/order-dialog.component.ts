import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
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
    DatePickerModule,
    TableModule,
    TooltipModule,
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
      [style]="{ width: '95vw', maxWidth: '1200px' }"
      [header]="dialogHeader()"
      modal
    >
      <form [formGroup]="orderForm" class="flex flex-col gap-4 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="
              orderForm.get('supplierId')?.invalid &&
              orderForm.get('supplierId')?.touched
            "
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
                appendTo="body"
              />
            </p-inputgroup>
            @if (
              orderForm.get('supplierId')?.invalid &&
              orderForm.get('supplierId')?.touched
            ) {
              <small class="text-red-500">El proveedor es obligatorio.</small>
            }
          </div>

          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="
              orderForm.get('deliveryDate')?.invalid &&
              orderForm.get('deliveryDate')?.touched
            "
          >
            <label for="deliveryDate" class="font-bold">Fecha de Entrega</label>
            <p-datePicker
              id="deliveryDate"
              formControlName="deliveryDate"
              [showIcon]="true"
              dateFormat="dd/mm/yy"
              [minDate]="minDeliveryDate"
              appendTo="body"
              [showOnFocus]="true"
              (onSelect)="onDeliveryDateSelected($event)"
            />
            @if (
              orderForm.get('deliveryDate')?.invalid &&
              orderForm.get('deliveryDate')?.touched
            ) {
              <small class="text-red-500"
                >La fecha de entrega es obligatoria.</small
              >
            }
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg m-0">Productos</h3>
            @if (!viewMode()) {
              <p-button
                label="Agregar Producto"
                icon="pi pi-plus"
                (onClick)="addItem()"
                [disabled]="viewMode() || !productStore.entities().length"
              ></p-button>
            }
          </div>

          <div formArrayName="items">
            <p-table
              [value]="tableRows()"
              [tableStyle]="{ width: '100%' }"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th class="w-1/3">Producto</th>
                  <th class="w-1/8">Cantidad</th>
                  <th class="w-1/8">Precio Unitario</th>
                  <th class="w-1/8">Subtotal</th>
                  @if (!viewMode()) {
                    <th class="w-12 text-center">Acciones</th>
                  }
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row let-i="rowIndex">
                @if (!row.isSummary) {
                  <tr [formGroupName]="row.formGroupIndex">
                    <td class="p-2">
                      <p-select
                        formControlName="productId"
                        [options]="productStore.entities()"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Seleccionar Producto"
                        [filter]="true"
                        filterBy="name"
                        (onChange)="
                          onProductChange(row.formGroupIndex, $event.value)
                        "
                        [style]="{ width: '100%' }"
                        appendTo="body"
                      />
                    </td>
                    <td class="p-2">
                      <p-inputNumber
                        formControlName="quantity"
                        [min]="1"
                        [showButtons]="true"
                        buttonLayout="horizontal"
                        step="1"
                        (onInput)="updateItemSubtotal(row.formGroupIndex)"
                        fluid
                        [style]="{ minWidth: '130px' }"
                      />
                    </td>
                    <td class="p-2">
                      <p-inputNumber
                        formControlName="unitPrice"
                        mode="currency"
                        currency="COP"
                        locale="es-CO"
                        (onInput)="updateItemSubtotal(row.formGroupIndex)"
                        maxFractionDigits="0"
                        [style]="{ width: '100%' }"
                      />
                    </td>
                    <td class="p-2">
                      <p-inputNumber
                        [ngModel]="
                          itemsArray.at(row.formGroupIndex).get('subtotal')
                            ?.value
                        "
                        [ngModelOptions]="{ standalone: true }"
                        mode="currency"
                        currency="COP"
                        locale="es-CO"
                        [readonly]="true"
                        [disabled]="true"
                        maxFractionDigits="0"
                        [style]="{ width: '100%' }"
                      />
                    </td>
                    @if (!viewMode()) {
                      <td class="p-2 text-center w-12">
                        <p-button
                          icon="pi pi-trash"
                          severity="danger"
                          (onClick)="removeItem(row.formGroupIndex)"
                          size="small"
                        />
                      </td>
                    }
                  </tr>
                } @else {
                  @if (row.type === 'total') {
                    <tr>
                      <td colspan="3" class="p-2 text-right font-bold text-lg">
                        Total:
                      </td>
                      <td colspan="@if (viewMode()) {1} @else {2}" class="p-2">
                        <p-inputNumber
                          [ngModel]="orderForm.get('totalAmount')?.value"
                          [ngModelOptions]="{ standalone: true }"
                          mode="currency"
                          currency="COP"
                          locale="es-CO"
                          [readonly]="true"
                          [disabled]="true"
                          maxFractionDigits="0"
                          [style]="{ width: '100%' }"
                          styleClass="font-bold"
                        />
                      </td>
                    </tr>
                  }
                }
              </ng-template>
            </p-table>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          [label]="viewMode() ? 'Cerrar' : 'Cancelar'"
          icon="pi pi-times"
          styleClass="p-button-text"
          (onClick)="purchaseOrderStore.closeOrderDialog()"
        />

        @if (!viewMode()) {
          <p-button
            label="Guardar"
            icon="pi pi-check"
            (onClick)="
              orderForm.valid ? saveOrder() : orderForm.markAllAsTouched()
            "
            [disabled]="
              purchaseOrderStore.loading() ||
              orderForm.invalid ||
              orderForm.pristine
            "
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

  readonly viewMode = computed(() => {
    return this.purchaseOrderStore.viewOnly();
  });

  readonly dialogHeader = computed(() => {
    const selectedOrder = this.purchaseOrderStore.selectedOrder();
    if (selectedOrder) {
      return this.viewMode()
        ? `Ver Pedido #${selectedOrder.orderNumber}`
        : `Editar Pedido #${selectedOrder.orderNumber}`;
    }
    return 'Registrar Nuevo Pedido';
  });

  readonly itemsCountSignal = signal(0);

  readonly tableRows = computed(() => {
    this.itemsCountSignal();

    const itemRows = this.itemsArray.controls.map((_, i) => ({
      isSummary: false,
      formGroupIndex: i,
    }));

    const summaryRows = [{ isSummary: true, type: 'total' }];

    return [...itemRows, ...summaryRows];
  });

  readonly orderForm: FormGroup = this.fb.group({
    supplierId: [null, Validators.required],
    deliveryDate: [new Date(), Validators.required],
    totalAmount: [0, Validators.min(0)],
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
      const viewOnly = this.viewMode();

      untracked(() => {
        if (order) {
          while (this.itemsArray.length) {
            this.itemsArray.removeAt(0);
          }

          this.itemsCountSignal.set(0);

          const deliveryDate = order.deliveryDate
            ? new Date(order.deliveryDate)
            : null;

          this.orderForm.patchValue({
            supplierId: order.supplier?.id,
            deliveryDate,
            totalAmount: order.totalAmount,
          });

          if (order.items && order.items.length > 0) {
            order.items.forEach((item) => {
              const itemGroup = this.fb.group({
                id: [item.id],
                productId: [
                  { value: item.product.id, disabled: viewOnly },
                  Validators.required,
                ],
                quantity: [
                  { value: item.quantity, disabled: viewOnly },
                  [Validators.required, Validators.min(1)],
                ],
                unitPrice: [
                  { value: item.unitPrice, disabled: viewOnly },
                  [Validators.required, Validators.min(0)],
                ],
                subtotal: [
                  item.totalPrice,
                  [Validators.required, Validators.min(0)],
                ],
              });

              this.itemsArray.push(itemGroup);
            });
          }

          this.itemsCountSignal.set(this.itemsArray.length);
          this.updateTotals();
          this.orderForm.markAsPristine();

          if (viewOnly) {
            this.orderForm.disable();
          }
        } else {
          this.orderForm.enable();

          this.orderForm.reset({
            supplierId: null,
            deliveryDate: new Date(),
            totalAmount: 0,
          });

          while (this.itemsArray.length > 0) {
            this.itemsArray.removeAt(0);
          }

          this.itemsCountSignal.set(0);
          this.addItem();
        }
      });
    });

    this.orderForm
      .get('items')
      ?.valueChanges.subscribe(() => this.updateTotals());
  }

  onDeliveryDateSelected(event: Date): void {
    this.orderForm.get('deliveryDate')?.setValue(event);
    this.orderForm.markAsDirty();
  }

  addItem(): void {
    const newItem = this.fb.group({
      productId: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0, [Validators.required, Validators.min(0)]],
    });

    if (this.viewMode()) {
      newItem.disable();
    }

    this.itemsArray.push(newItem);
    this.itemsCountSignal.set(this.itemsArray.length);
    this.updateTotals();
    this.orderForm.markAsDirty();
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
      this.itemsCountSignal.set(this.itemsArray.length);
      this.updateTotals();
      this.orderForm.markAsDirty();
    }
  }

  onProductChange(index: number, productId: number): void {
    if (!productId) return;

    const product = this.productStore
      .entities()
      .find((p) => p.id === productId);

    if (product) {
      const itemGroup = this.itemsArray.at(index);
      itemGroup.patchValue({
        unitPrice: product.costPrice,
      });
      this.updateItemSubtotal(index);
    }
  }

  updateItemSubtotal(index: number): void {
    const itemGroup = this.itemsArray.at(index);
    const quantity = itemGroup.get('quantity')?.value ?? 0;
    const unitPrice = itemGroup.get('unitPrice')?.value ?? 0;

    const subtotal = quantity * unitPrice;
    itemGroup.get('subtotal')?.setValue(subtotal);

    this.updateTotals();
    this.orderForm.markAsDirty();
  }

  updateTotals(): void {
    let total = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      const itemGroup = this.itemsArray.at(i);
      total += itemGroup.get('subtotal')?.value ?? 0;
    }

    this.orderForm.get('totalAmount')?.setValue(total);
  }

  formatDateToISO(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  }

  saveOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.getRawValue();

    const orderData: PurchaseOrderData = {
      supplierId: formValue.supplierId,
      deliveryDate: this.formatDateToISO(formValue.deliveryDate) ?? undefined,
      items: formValue.items.map(
        (item: PurchaseOrderItemData & { id?: number; subtotal?: number }) => {
          const itemData: PurchaseOrderItemData = {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          };

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
  }
}
