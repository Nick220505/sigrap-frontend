import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { applyEach, form, min, required } from '@angular/forms/signals';
import { CategoryStore } from '@features/inventory/stores/category-store';
import { ProductStore } from '@features/inventory/stores/product-store';
import { PurchaseOrderData } from '@features/supplier/models/purchase-order.model';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order-store';
import { SupplierStore } from '@features/supplier/stores/supplier-store';
import { CurrencyPipe } from '@angular/common';
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
    DatePickerModule,
    TableModule,
    TooltipModule,
    InputGroupModule,
    InputGroupAddonModule,
    FormsModule,
    CurrencyPipe,
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
      <form
        (submit)="$event.preventDefault(); saveOrder()"
        class="flex flex-col gap-4 pt-4"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="
              orderForm.supplierId().invalid() &&
              orderForm.supplierId().touched()
            "
          >
            <label for="supplierId" class="font-bold">Supplier</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-building"></i>
              </p-inputgroup-addon>
              <p-select
                id="supplierId"
                [ngModel]="orderForm.supplierId().value()"
                (ngModelChange)="orderForm.supplierId().value.set($event)"
                [options]="supplierStore.entities()"
                optionLabel="name"
                optionValue="id"
                placeholder="Select a supplier"
                filter
                filterBy="name"
                styleClass="w-full"
                appendTo="body"
                [disabled]="viewMode()"
              />
            </p-inputgroup>
            @if (
              orderForm.supplierId().invalid() &&
              orderForm.supplierId().touched()
            ) {
              <small class="text-red-500">Supplier is required.</small>
            }
          </div>

          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="
              orderForm.deliveryDate().invalid() &&
              orderForm.deliveryDate().touched()
            "
          >
            <label for="deliveryDate" class="font-bold">Delivery Date</label>
            <p-datePicker
              id="deliveryDate"
              inputId="deliveryDate"
              [ngModel]="orderForm.deliveryDate().value()"
              (ngModelChange)="orderForm.deliveryDate().value.set($event)"
              [showIcon]="true"
              appendTo="body"
              [showOnFocus]="true"
              [disabled]="viewMode()"
            />
            @if (
              orderForm.deliveryDate().invalid() &&
              orderForm.deliveryDate().touched()
            ) {
              <small class="text-red-500">Delivery date is required.</small>
            }
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg m-0">Products</h3>
            @if (!viewMode()) {
              <p-button
                label="Add Product"
                icon="pi pi-plus"
                (onClick)="addItem()"
                [disabled]="viewMode() || !productStore.entities().length"
              ></p-button>
            }
          </div>

          <p-table
            [value]="tableRows()"
            [tableStyle]="{ width: '100%' }"
            styleClass="p-datatable-sm"
          >
            <ng-template pTemplate="header">
              <tr>
                <th class="w-1/3">Product</th>
                <th class="w-1/8">Quantity</th>
                <th class="w-1/8">Unit Price</th>
                <th class="w-1/8">Subtotal</th>
                @if (!viewMode()) {
                  <th class="w-12 text-center">Actions</th>
                }
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-row let-i="rowIndex">
              @if (!row.isSummary) {
                @let idx = row.formGroupIndex;
                <tr>
                  <td class="p-2">
                    <p-select
                      [ngModel]="orderForm.items[idx].productId().value()"
                      (ngModelChange)="orderForm.items[idx].productId().value.set($event)"
                      [options]="productStore.entities()"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Select Product"
                      [filter]="true"
                      filterBy="name"
                      (onChange)="onProductChange(idx, $event.value)"
                      [style]="{ width: '100%' }"
                      appendTo="body"
                      [disabled]="viewMode()"
                    />
                  </td>
                  <td class="p-2">
                    <p-inputNumber
                      [ngModel]="orderForm.items[idx].quantity().value()"
                      (ngModelChange)="orderForm.items[idx].quantity().value.set($event)"
                      [min]="1"
                      [showButtons]="true"
                      buttonLayout="horizontal"
                      [step]="1"
                      (onInput)="updateItemSubtotal(idx)"
                      fluid
                      [style]="{ minWidth: '130px' }"
                      [disabled]="viewMode()"
                    />
                  </td>
                  <td class="p-2">
                    <p-inputNumber
                      [ngModel]="orderForm.items[idx].unitPrice().value()"
                      (ngModelChange)="orderForm.items[idx].unitPrice().value.set($event)"
                      mode="currency"
                      (onInput)="updateItemSubtotal(idx)"
                      maxFractionDigits="0"
                      [style]="{ width: '100%' }"
                      [disabled]="viewMode()"
                    />
                  </td>
                  <td class="p-2">
                    {{
                      orderForm.items[idx].subtotal().value()
                        | currency: undefined : undefined : '1.0-0'
                    }}
                  </td>
                  @if (!viewMode()) {
                    <td class="p-2 text-center w-12">
                      <p-button
                        icon="pi pi-trash"
                        severity="danger"
                        (onClick)="removeItem(idx)"
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
                      {{
                        orderForm.totalAmount().value()
                          | currency: undefined : undefined : '1.0-0'
                      }}
                    </td>
                  </tr>
                }
              }
            </ng-template>
          </p-table>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          @if (!viewMode()) {
            <p-button
              label="Save"
              icon="pi pi-check"
              (onClick)="
                orderForm().valid() ? saveOrder() : orderForm().markAsTouched()
              "
              [disabled]="
                purchaseOrderStore.loading() ||
                orderForm().invalid() ||
                !orderForm().dirty()
              "
            />
          }
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class OrderDialog {
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
        ? `View Order #${selectedOrder.id}`
        : `Edit Order #${selectedOrder.id}`;
    }
    return 'Register New Order';
  });

  private readonly model = signal<{
    supplierId: number | null;
    deliveryDate: Date | null;
    totalAmount: number;
    items: {
      id?: number;
      productId: number | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[];
  }>({
    supplierId: null,
    deliveryDate: new Date(),
    totalAmount: 0,
    items: [
      {
        productId: null,
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ],
  });

  readonly orderForm = form(this.model, (m) => {
    required(m.supplierId, { message: 'Supplier is required' });
    required(m.deliveryDate, { message: 'Delivery date is required' });
    min(m.totalAmount, 0);

    applyEach(m.items, (i) => {
      required(i.productId);
      min(i.quantity, 1);
      min(i.unitPrice, 0);
      min(i.subtotal, 0);
    });
  });

  readonly tableRows = computed(() => {
    const itemRows = Array.from(
      { length: this.orderForm.items.length },
      (_: unknown, i: number) => ({
        isSummary: false,
        formGroupIndex: i,
      }),
    );

    const summaryRows = [{ isSummary: true, type: 'total' }];

    return [...itemRows, ...summaryRows];
  });

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
          const deliveryDate = order.deliveryDate
            ? new Date(order.deliveryDate)
            : null;

          this.orderForm().reset({
            supplierId: order.supplier?.id ?? null,
            deliveryDate,
            totalAmount: order.totalAmount,
            items:
              order.items?.map((item) => ({
                id: item.id,
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.totalPrice,
              })) ?? [],
          });

          if (!order.items || order.items.length === 0) {
            this.addItem();
          }

          if (!viewOnly) {
            this.calculateSubtotals();
            this.updateTotals();
          }
        } else {
          this.orderForm().reset({
            supplierId: null,
            deliveryDate: new Date(),
            totalAmount: 0,
            items: [
              {
                productId: null,
                quantity: 1,
                unitPrice: 0,
                subtotal: 0,
              },
            ],
          });
        }
      });
    });
  }

  addItem(): void {
    const v = this.orderForm().value();
    this.orderForm().value.set({
      ...v,
      items: [
        ...v.items,
        {
          productId: null,
          quantity: 1,
          unitPrice: 0,
          subtotal: 0,
        },
      ],
    });
  }

  removeItem(index: number): void {
    const v = this.orderForm().value();
    if (v.items.length <= 1) return;

    const nextItems = v.items.filter((_, i) => i !== index);
    this.orderForm().value.set({
      ...v,
      items: nextItems,
      totalAmount: nextItems.reduce((sum, it) => sum + (it.subtotal ?? 0), 0),
    });
  }

  onProductChange(index: number, productId: number): void {
    if (!productId) return;

    const product = this.productStore
      .entities()
      .find((p) => p.id === productId);

    if (!product) return;

    const v = this.orderForm().value();
    const nextItems = [...v.items];
    nextItems[index] = {
      ...nextItems[index],
      unitPrice: product.costPrice,
    };
    this.orderForm().value.set({
      ...v,
      items: nextItems,
    });
    this.updateItemSubtotal(index);
  }

  calculateSubtotals(): void {
    const v = this.orderForm().value();
    const nextItems = v.items.map((it) => ({
      ...it,
      subtotal: (it.quantity ?? 0) * (it.unitPrice ?? 0),
    }));
    this.orderForm().value.set({
      ...v,
      items: nextItems,
      totalAmount: nextItems.reduce((sum, it) => sum + (it.subtotal ?? 0), 0),
    });
  }

  updateItemSubtotal(index: number, updateTotal = true): void {
    const v = this.orderForm().value();
    const nextItems = [...v.items];
    const current = nextItems[index];
    const subtotal = (current.quantity ?? 0) * (current.unitPrice ?? 0);
    nextItems[index] = { ...current, subtotal };

    this.orderForm().value.set({
      ...v,
      items: nextItems,
      totalAmount: updateTotal
        ? nextItems.reduce((sum, it) => sum + (it.subtotal ?? 0), 0)
        : v.totalAmount,
    });
  }

  updateTotals(): void {
    const v = this.orderForm().value();
    const total = v.items.reduce((sum, it) => sum + (it.subtotal ?? 0), 0);
    this.orderForm().value.set({
      ...v,
      totalAmount: total,
    });
  }

  formatDateToISO(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  }

  saveOrder(): void {
    if (this.orderForm().invalid()) {
      this.orderForm().markAsTouched();
      return;
    }

    const formValue = this.orderForm().value();

    if (formValue.supplierId == null) {
      this.orderForm().markAsTouched();
      return;
    }

    if (formValue.items.some((i) => i.productId == null)) {
      this.orderForm().markAsTouched();
      return;
    }

    const orderData: PurchaseOrderData = {
      supplierId: formValue.supplierId,
      deliveryDate: this.formatDateToISO(formValue.deliveryDate) ?? undefined,
      items: formValue.items.map((item) => ({
        id: item.id,
        productId: item.productId!,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
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
