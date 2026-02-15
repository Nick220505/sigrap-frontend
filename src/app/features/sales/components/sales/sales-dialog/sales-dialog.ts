import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { applyEach, form, max, min, required } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '@core/auth/stores/auth-store';
import { UserStore } from '@features/configuration/stores/user-store';
import { CustomerStore } from '@features/customer/stores/customer-store';
import { ProductStore } from '@features/inventory/stores/product-store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { SaleData } from '@features/sales/models/sale.model';
import { SaleStore } from '@features/sales/stores/sale-store';

@Component({
  selector: 'app-sales-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    InputGroupModule,
    InputGroupAddonModule,
    FormsModule,
    CurrencyPipe,
    TranslateModule,
  ],
  template: `
    <p-dialog
      [visible]="saleStore.dialogVisible()"
      (visibleChange)="
        $event ? saleStore.openSaleDialog() : saleStore.closeSaleDialog()
      "
      [style]="{ width: '95vw', maxWidth: '1200px' }"
      [header]="dialogHeader()"
      [modal]="true"
      [resizable]="false"
    >
      <form
        (submit)="$event.preventDefault(); saveSale()"
        class="flex flex-col gap-4 pt-4"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="customerId" class="font-bold">Customer</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-users"></i>
              </p-inputgroup-addon>
              <p-select
                id="customerId"
                [ngModel]="saleForm.customerId().value()"
                (ngModelChange)="saleForm.customerId().value.set($event)"
                [ngModelOptions]="{ standalone: true }"
                [options]="this.customerStore.entities()"
                optionLabel="fullName"
                optionValue="id"
                [placeholder]="'sales.sales.selectCustomer' | translate"
                [filter]="true"
                filterBy="fullName"
                styleClass="w-full"
                appendTo="body"
                [disabled]="viewMode()"
              ></p-select>
            </p-inputgroup>
          </div>

          <div class="flex flex-col gap-2">
            <label for="employeeId" class="font-bold">Employee</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-user"></i>
              </p-inputgroup-addon>
              <p-select
                id="employeeId"
                [ngModel]="saleForm.employeeId().value()"
                (ngModelChange)="saleForm.employeeId().value.set($event)"
                [ngModelOptions]="{ standalone: true }"
                [options]="this.userStore.entities()"
                optionLabel="name"
                optionValue="id"
                [placeholder]="'sales.sales.selectEmployee' | translate"
                [filter]="true"
                filterBy="name"
                styleClass="w-full"
                appendTo="body"
                [disabled]="viewMode()"
              ></p-select>
            </p-inputgroup>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg m-0">Products</h3>
            @if (!viewMode()) {
              <p-button
                [label]="'sales.sales.addProduct' | translate"
                icon="pi pi-plus"
                (click)="addItem()"
                [disabled]="viewMode()"
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
                <th class="w-1/4">Subtotal</th>
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
                      [ngModel]="saleForm.items[idx].productId().value()"
                      (ngModelChange)="
                        saleForm.items[idx].productId().value.set($event)
                      "
                      [ngModelOptions]="{ standalone: true }"
                      [options]="this.productStore.entities()"
                      optionLabel="name"
                      optionValue="id"
                      [placeholder]="'sales.sales.selectProduct' | translate"
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
                      [ngModel]="saleForm.items[idx].quantity().value()"
                      (ngModelChange)="
                        saleForm.items[idx].quantity().value.set($event)
                      "
                      [ngModelOptions]="{ standalone: true }"
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
                      [ngModel]="saleForm.items[idx].unitPrice().value()"
                      (ngModelChange)="
                        saleForm.items[idx].unitPrice().value.set($event)
                      "
                      [ngModelOptions]="{ standalone: true }"
                      [readonly]="true"
                      [disabled]="true"
                      maxFractionDigits="0"
                      [style]="{ width: '100%' }"
                    />
                  </td>
                  <td class="p-2">
                    {{
                      saleForm.items[idx].subtotal().value()
                        | currency: undefined : undefined : '1.0-0'
                    }}
                  </td>
                  @if (!viewMode()) {
                    <td class="p-2 text-center w-12">
                      <p-button
                        icon="pi pi-trash"
                        severity="danger"
                        (click)="removeItem(idx)"
                        size="small"
                      />
                    </td>
                  }
                </tr>
              } @else {
                @switch (row.type) {
                  @case ('total') {
                    <tr>
                      <td colspan="3" class="p-2 text-right font-bold">
                        Total:
                      </td>
                      <td class="p-2">
                        {{
                          saleForm.totalAmount().value()
                            | currency: undefined : undefined : '1.0-0'
                        }}
                      </td>
                      @if (!viewMode()) {
                        <td></td>
                      }
                    </tr>
                  }
                  @case ('tax') {
                    <tr>
                      <td colspan="3" class="p-2 text-right font-bold">
                        Tax (19% VAT):
                      </td>
                      <td class="p-2">
                        {{
                          saleForm.taxAmount().value()
                            | currency: undefined : undefined : '1.0-0'
                        }}
                      </td>
                      @if (!viewMode()) {
                        <td></td>
                      }
                    </tr>
                  }
                  @case ('combinedDiscount') {
                    <tr>
                      <td colspan="3" class="p-2 text-right font-bold">
                        Discount:
                      </td>
                      <td class="p-2">
                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div class="flex flex-col">
                            <label for="discountPercent" class="text-xs mb-1"
                              >Percentage</label
                            >
                            @if (!viewMode()) {
                              <p-inputNumber
                                id="discountPercent"
                                [ngModel]="saleForm.discountPercent().value()"
                                (ngModelChange)="
                                  saleForm.discountPercent().value.set($event)
                                "
                                [ngModelOptions]="{ standalone: true }"
                                suffix="%"
                                [min]="0"
                                [max]="100"
                                showButtons
                                buttonLayout="horizontal"
                                [step]="1"
                                (onInput)="updateDiscountFromPercentage()"
                                styleClass="w-full"
                                fluid
                                [style]="{ minWidth: '130px' }"
                              />
                            } @else {
                              {{ saleForm.discountPercent().value() }}%
                            }
                          </div>
                          <div class="flex flex-col">
                            <label for="discountAmount" class="text-xs mb-1"
                              >Amount</label
                            >
                            {{
                              saleForm.discountAmount().value()
                                | currency: undefined : undefined : '1.0-0'
                            }}
                          </div>
                        </div>
                      </td>
                      @if (!viewMode()) {
                        <td></td>
                      }
                    </tr>
                  }
                  @case ('finalTotal') {
                    <tr>
                      <td colspan="3" class="p-2 text-right font-bold text-lg">
                        Final Total:
                      </td>
                      <td class="p-2">
                        {{
                          saleForm.finalAmount().value()
                            | currency: undefined : undefined : '1.0-0'
                        }}
                      </td>
                      @if (!viewMode()) {
                        <td></td>
                      }
                    </tr>
                  }
                }
              }
            </ng-template>
          </p-table>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          [label]="'common.cancel' | translate"
          icon="pi pi-times"
          styleClass="p-button-text"
          (click)="saleStore.closeSaleDialog()"
        />
        @if (!viewMode()) {
          <p-button
            [label]="'common.save' | translate"
            icon="pi pi-check"
            (click)="
              saleForm().valid() ? saveSale() : saleForm().markAsTouched()
            "
            [disabled]="saleForm().invalid() || !saleForm().dirty()"
          />
        }
      </ng-template>
    </p-dialog>
  `,
})
export class SalesDialog {
  readonly saleStore = inject(SaleStore);
  readonly authStore = inject(AuthStore);
  readonly productStore = inject(ProductStore);
  readonly customerStore = inject(CustomerStore);
  readonly userStore = inject(UserStore);

  private readonly model = signal<{
    customerId: number | null;
    employeeId: number | null;
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    discountPercent: number;
    finalAmount: number;
    items: {
      productId: number | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[];
  }>({
    customerId: null,
    employeeId: null,
    totalAmount: 0,
    taxAmount: 0,
    discountAmount: 0,
    discountPercent: 0,
    finalAmount: 0,
    items: [
      {
        productId: null,
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ],
  });

  readonly viewMode = computed(() => {
    const selectedSale = this.saleStore.selectedSale();
    return selectedSale !== null;
  });

  readonly dialogHeader = computed(() => {
    const selectedSale = this.saleStore.selectedSale();
    if (selectedSale) {
      return `Sale #${selectedSale.id}`;
    }
    return 'Register New Sale';
  });

  readonly saleForm = form(this.model, (m) => {
    required(m.customerId, { message: 'validation.required' });
    required(m.employeeId, { message: 'validation.required' });
    min(m.totalAmount, 0);
    min(m.taxAmount, 0);
    min(m.discountAmount, 0);
    min(m.discountPercent, 0);
    max(m.discountPercent, 100);
    min(m.finalAmount, 0);

    applyEach(m.items, (i) => {
      required(i.productId);
      min(i.quantity, 1);
      min(i.unitPrice, 0);
      min(i.subtotal, 0);
    });
  });

  readonly tableRows = computed(() => {
    const itemRows = Array.from(
      { length: this.saleForm.items.length },
      (_: unknown, i: number) => ({
        isSummary: false,
        formGroupIndex: i,
      }),
    );

    const summaryRows = [
      { isSummary: true, type: 'total' },
      { isSummary: true, type: 'tax' },
      { isSummary: true, type: 'combinedDiscount' },
      { isSummary: true, type: 'finalTotal' },
    ];

    return [...itemRows, ...summaryRows];
  });

  private readonly IVA_RATE = 0.19;

  constructor() {
    effect(() => {
      const currentEmployees = this.userStore.entities();
      const loggedInUser = this.authStore.user();

      if (this.viewMode()) {
        return;
      }

      const v = this.saleForm().value();
      if (currentEmployees.length > 0 && v.employeeId == null) {
        const employeeId = loggedInUser?.id
          ? currentEmployees.some((e) => e.id === loggedInUser.id)
            ? loggedInUser.id
            : currentEmployees[0].id
          : currentEmployees[0].id;

        this.saleForm().value.set({
          ...v,
          employeeId,
        });
      }
    });

    effect(() => {
      const selectedSale = this.saleStore.selectedSale();

      untracked(() => {
        if (selectedSale) {
          const discountPercent =
            selectedSale.totalAmount > 0
              ? Math.round(
                  (selectedSale.discountAmount / selectedSale.totalAmount) *
                    100,
                )
              : 0;

          this.saleForm().reset({
            customerId: selectedSale.customer.id,
            employeeId: selectedSale.employee.id,
            totalAmount: selectedSale.totalAmount,
            taxAmount: selectedSale.taxAmount,
            discountAmount: selectedSale.discountAmount,
            discountPercent,
            finalAmount: selectedSale.finalAmount,
            items: selectedSale.items.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              subtotal: item.subtotal,
            })),
          });
        } else {
          const currentEmployees = this.userStore.entities();
          const loggedInUser = this.authStore.user();
          const employeeId =
            loggedInUser?.id &&
            currentEmployees.some((e) => e.id === loggedInUser.id)
              ? loggedInUser.id
              : (currentEmployees[0]?.id ?? null);

          this.saleForm().reset({
            customerId: null,
            employeeId,
            totalAmount: 0,
            taxAmount: 0,
            discountAmount: 0,
            discountPercent: 0,
            finalAmount: 0,
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
    const v = this.saleForm().value();
    this.saleForm().value.set({
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
    this.updateTotals();
  }

  removeItem(index: number): void {
    const v = this.saleForm().value();
    if (v.items.length <= 1) {
      return;
    }

    const nextItems = v.items.filter((_, i) => i !== index);
    this.saleForm().value.set({
      ...v,
      items: nextItems,
    });
    this.updateTotals();
  }

  onProductChange(index: number, productId: number): void {
    const product = this.productStore
      .entities()
      .find((p) => p.id === productId);
    if (!product) {
      return;
    }

    const v = this.saleForm().value();
    const nextItems = [...v.items];
    nextItems[index] = {
      ...nextItems[index],
      unitPrice: product.salePrice,
    };
    this.saleForm().value.set({
      ...v,
      items: nextItems,
    });
    this.updateItemSubtotal(index);
  }

  updateItemSubtotal(index: number): void {
    const v = this.saleForm().value();
    const nextItems = [...v.items];
    const current = nextItems[index];
    const subtotal = (current.quantity ?? 0) * (current.unitPrice ?? 0);
    nextItems[index] = { ...current, subtotal };
    this.saleForm().value.set({
      ...v,
      items: nextItems,
    });
    this.updateTotals();
  }

  updateTotals(): void {
    const v = this.saleForm().value();
    const total = v.items.reduce((sum, it) => sum + (it.subtotal ?? 0), 0);
    const taxAmount = Math.round(total * this.IVA_RATE);
    const discountAmount = Math.round((total * (v.discountPercent ?? 0)) / 100);
    const finalAmount = total + taxAmount - discountAmount;

    this.saleForm().value.set({
      ...v,
      totalAmount: total,
      taxAmount,
      discountAmount,
      finalAmount,
    });
  }

  updateDiscountFromPercentage(): void {
    this.updateTotals();
  }

  saveSale(): void {
    if (this.saleForm().invalid()) {
      this.saleForm().markAsTouched();
      return;
    }

    const formValue = this.saleForm().value();

    if (formValue.customerId == null || formValue.employeeId == null) {
      this.saleForm().markAsTouched();
      return;
    }

    if (formValue.items.some((i) => i.productId == null)) {
      this.saleForm().markAsTouched();
      return;
    }

    const saleData: SaleData = {
      totalAmount: formValue.totalAmount,
      taxAmount: formValue.taxAmount,
      discountAmount: formValue.discountAmount,
      finalAmount: formValue.finalAmount,
      customerId: formValue.customerId,
      employeeId: formValue.employeeId,
      items: formValue.items.map((item) => ({
        productId: item.productId!,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    };

    const selectedSale = this.saleStore.selectedSale();
    if (selectedSale) {
      this.saleStore.update({ id: selectedSale.id, saleData });
    } else {
      this.saleStore.create(saleData);
    }
  }
}
