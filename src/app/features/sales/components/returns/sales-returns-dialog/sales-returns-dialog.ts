import { CommonModule, CurrencyPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  FormField,
  applyEach,
  form,
  max,
  min,
  minLength,
  required,
} from '@angular/forms/signals';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';

import { AuthStore } from '@core/auth/stores/auth-store';
import { UserStore } from '@features/configuration/stores/user-store';
import { ProductStore } from '@features/inventory/stores/product-store';
import { SaleReturnStore } from '@features/sales/stores/sale-return-store';
import { SaleStore } from '@features/sales/stores/sale-store';

import { SaleReturnData } from '@features/sales/models/sale-return.model';
import { SaleInfo } from '@features/sales/models/sale.model';

@Component({
  selector: 'app-sales-returns-dialog',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TextareaModule,
    CurrencyPipe,
    InputGroupModule,
    InputGroupAddonModule,
    FormField,
    FormsModule,
  ],
  template: `
    <p-dialog
      [visible]="saleReturnStore.dialogVisible()"
      (visibleChange)="saleReturnStore.closeReturnDialog()"
      [style]="{ width: '95vw', maxWidth: '1000px' }"
      [header]="dialogHeader()"
      modal
      [resizable]="false"
    >
      <form
        (submit)="$event.preventDefault(); saveReturn()"
        class="flex flex-col gap-4 pt-4"
      >
        <div class="flex flex-col gap-2">
          <label for="originalSaleId" class="font-bold">Original Sale</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-shopping-cart"></i>
            </p-inputgroup-addon>
            @if (!viewMode()) {
              <p-select
                id="originalSaleId"
                [ngModel]="returnForm.originalSaleId().value()"
                (ngModelChange)="returnForm.originalSaleId().value.set($event)"
                [options]="saleStore.entities()"
                optionLabel="id"
                optionValue="id"
                placeholder="Select Original Sale"
                (onChange)="onOriginalSaleChange($event.value)"
                [filter]="true"
                styleClass="w-full"
                appendTo="body"
              ></p-select>
            } @else {
              <input
                id="originalSaleId"
                pInputText
                [value]="returnForm.originalSaleId().value()"
                disabled
              />
            }
          </p-inputgroup>
        </div>

        @if (selectedOriginalSale(); as originalSale) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="customerName" class="font-bold">Customer</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-user"></i>
                </p-inputgroup-addon>
                <input
                  id="customerName"
                  pInputText
                  [value]="originalSale.customer.fullName"
                  readonly
                  disabled
                />
              </p-inputgroup>
            </div>
            <div class="flex flex-col gap-2">
              <label for="employeeName" class="font-bold"
                >Employee (Original Sale)</label
              >
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-user-edit"></i>
                </p-inputgroup-addon>
                <input
                  id="employeeName"
                  pInputText
                  [value]="originalSale.employee.name"
                  readonly
                  disabled
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="reason" class="font-bold"
              >Return Reason <span class="text-red-500">*</span></label
            >
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-comment"></i>
              </p-inputgroup-addon>
              @if (!viewMode()) {
                <textarea
                  id="reason"
                  [formField]="returnForm.reason"
                  rows="3"
                  class="w-full"
                  [class.ng-invalid]="reasonInvalid()"
                  [class.ng-dirty]="reasonInvalid()"
                  placeholder="Enter the detailed reason for the return..."
                ></textarea>
              } @else {
                <textarea
                  id="reason"
                  [value]="returnForm.reason().value()"
                  rows="3"
                  class="w-full"
                  disabled
                ></textarea>
              }
            </p-inputgroup>
            @if (reasonInvalid()) {
              <small class="p-error">
                @if (reasonHasRequiredError()) {
                  Return reason is required.
                } @else if (reasonHasMinLengthError()) {
                  Reason must have at least 5 characters.
                }
              </small>
            }
          </div>

          <div class="flex flex-col gap-2">
            <h3 class="font-bold text-lg m-0">Products to Return</h3>
            <p-table
              [value]="itemIndexes()"
              [tableStyle]="{ 'min-width': '50rem' }"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Product</th>
                  <th>Original Price</th>
                  <th>Qty. Purchased</th>
                  <th>Qty. to Return</th>
                  <th>Return Subtotal</th>
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-idx>
                <tr>
                  <td>
                    {{
                      getProductName(
                        returnForm.items[idx].productId().value() ?? 0
                      )
                    }}
                  </td>
                  <td>
                    {{
                      returnForm.items[idx].unitPrice().value()
                        | currency: undefined : undefined : '1.0-0'
                    }}
                  </td>
                  <td>
                    {{ returnForm.items[idx].originalQuantity().value() }}
                  </td>
                  <td>
                    @if (!viewMode()) {
                      <p-inputNumber
                        [ngModel]="returnForm.items[idx].quantity().value()"
                        (ngModelChange)="returnForm.items[idx].quantity().value.set($event)"
                        [min]="0"
                        [max]="returnForm.items[idx].originalQuantity().value()"
                        [showButtons]="true"
                        buttonLayout="horizontal"
                        (onInput)="updateReturnItemSubtotal(idx)"
                      ></p-inputNumber>
                    } @else {
                      {{ returnForm.items[idx].quantity().value() }}
                    }
                  </td>
                  <td>
                    {{
                      returnForm.items[idx].subtotal().value()
                        | currency: undefined : undefined : '1.0-0'
                    }}
                  </td>
                </tr>
              </ng-template>
              <ng-template pTemplate="footer">
                <tr>
                  <td colspan="4" class="text-right font-bold">
                    Total Return:
                  </td>
                  <td class="font-bold text-xl">
                    {{
                      returnForm.totalReturnAmount().value()
                        | currency: undefined : undefined : '1.0-0'
                    }}
                  </td>
                </tr>
              </ng-template>
            </p-table>
          </div>
        }
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancel"
          icon="pi pi-times"
          styleClass="p-button-text"
          (click)="saleReturnStore.closeReturnDialog()"
        />
        @if (!viewMode()) {
          <p-button
            label="Save"
            icon="pi pi-check"
            (click)="
              returnForm().valid() ? saveReturn() : returnForm().markAsTouched()
            "
            [disabled]="
              returnForm().invalid() ||
              returnForm.items.length === 0 ||
              returnHasNoItems()
            "
          />
        }
      </ng-template>
    </p-dialog>
  `,
})
export class SalesReturnsDialog {
  readonly saleReturnStore = inject(SaleReturnStore);
  readonly saleStore = inject(SaleStore);
  readonly productStore = inject(ProductStore);
  private readonly authStore = inject(AuthStore);
  private readonly userStore = inject(UserStore);
  private readonly messageService = inject(MessageService);

  readonly selectedOriginalSale = signal<SaleInfo | null>(null);

  private readonly model = signal<{
    originalSaleId: number | null;
    employeeId: number | null;
    totalReturnAmount: number;
    reason: string;
    items: {
      productId: number | null;
      unitPrice: number;
      originalQuantity: number;
      quantity: number;
      subtotal: number;
    }[];
  }>({
    originalSaleId: null,
    employeeId: null,
    totalReturnAmount: 0,
    reason: '',
    items: [],
  });

  readonly viewMode = computed(
    () => this.saleReturnStore.selectedSaleReturn() !== null,
  );
  readonly dialogHeader = computed(() =>
    this.viewMode() ? 'Return Details' : 'New Return',
  );

  readonly itemIndexes = computed(() =>
    Array.from(
      { length: this.returnForm.items.length },
      (_: unknown, i: number) => i,
    ),
  );

  readonly reasonInvalid = computed(
    () =>
      this.returnForm.reason().invalid() && this.returnForm.reason().touched(),
  );

  readonly reasonHasRequiredError = computed(() =>
    this.returnForm
      .reason()
      .errors()
      .some((e) => e.kind === 'required'),
  );

  readonly reasonHasMinLengthError = computed(() =>
    this.returnForm
      .reason()
      .errors()
      .some((e) => e.kind === 'minLength'),
  );

  readonly returnForm = form(this.model, (m) => {
    required(m.originalSaleId);
    required(m.employeeId);
    required(m.reason);
    minLength(m.reason, 5);
    min(m.totalReturnAmount, 0);

    applyEach(m.items, (i) => {
      required(i.productId);
      min(i.unitPrice, 0);
      min(i.originalQuantity, 0);
      min(i.quantity, 0);
      max(i.quantity, ({ valueOf }) => valueOf(i.originalQuantity));
      min(i.subtotal, 0);
    });
  });

  constructor() {
    effect(() => {
      const loggedInUser = this.authStore.user();
      if (this.viewMode()) {
        return;
      }

      const v = this.returnForm().value();
      if (v.employeeId == null && this.userStore.entities().length > 0) {
        const employeeId =
          loggedInUser?.id != null &&
          this.userStore.entities().some((u) => u.id === loggedInUser.id)
            ? loggedInUser.id
            : (this.userStore.entities()[0]?.id ?? null);

        this.returnForm().value.set({
          ...v,
          employeeId,
        });
      }
    });

    effect(() => {
      const currentSaleReturn = this.saleReturnStore.selectedSaleReturn();
      untracked(() => {
        if (currentSaleReturn && this.viewMode()) {
          const originalSale = this.saleStore
            .entities()
            .find((s) => s.id === currentSaleReturn.originalSaleId);
          if (originalSale) {
            this.selectedOriginalSale.set(originalSale);
            this.returnForm().reset({
              originalSaleId: currentSaleReturn.originalSaleId,
              employeeId: currentSaleReturn.employee.id,
              totalReturnAmount: currentSaleReturn.totalReturnAmount ?? 0,
              reason: currentSaleReturn.reason ?? '',
              items: currentSaleReturn.items
                .map((item) => {
                  const originalSaleItem = originalSale.items.find(
                    (i) => i.product.id === item.product.id,
                  );
                  if (!originalSaleItem) {
                    return null;
                  }
                  return {
                    productId: item.product.id,
                    unitPrice: item.unitPrice,
                    originalQuantity: originalSaleItem.quantity,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                  };
                })
                .filter(
                  (
                    i,
                  ): i is {
                    productId: number;
                    unitPrice: number;
                    originalQuantity: number;
                    quantity: number;
                    subtotal: number;
                  } => i !== null,
                ),
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Original sale with ID ${currentSaleReturn.originalSaleId} not found.`,
            });
            this.saleReturnStore.closeReturnDialog();
          }
        } else {
          this.resetForm();
        }
      });
    });
  }

  resetForm(): void {
    this.selectedOriginalSale.set(null);
    let defaultEmployeeId: number | null = null;
    const loggedInUser = this.authStore.user();
    if (
      loggedInUser?.id != null &&
      this.userStore.entities().some((u) => u.id === loggedInUser.id)
    ) {
      defaultEmployeeId = loggedInUser.id;
    } else if (this.userStore.entities().length > 0) {
      defaultEmployeeId = this.userStore.entities()[0]?.id ?? null;
    }

    this.returnForm().reset({
      originalSaleId: null,
      employeeId: defaultEmployeeId,
      totalReturnAmount: 0,
      reason: '',
      items: [],
    });
  }

  onOriginalSaleChange(saleId: number | null): void {
    if (!saleId) {
      this.selectedOriginalSale.set(null);
      const v = this.returnForm().value();
      this.returnForm().value.set({
        ...v,
        items: [],
        totalReturnAmount: 0,
      });
      return;
    }

    const originalSale = this.saleStore.entities().find((s) => s.id === saleId);
    if (originalSale) {
      this.selectedOriginalSale.set(originalSale);
      const v = this.returnForm().value();
      this.returnForm().value.set({
        ...v,
        items: originalSale.items.map((item) => ({
          productId: item.product.id,
          unitPrice: item.unitPrice,
          originalQuantity: item.quantity,
          quantity: 0,
          subtotal: 0,
        })),
        totalReturnAmount: 0,
      });
    } else {
      this.selectedOriginalSale.set(null);
      const v = this.returnForm().value();
      this.returnForm().value.set({
        ...v,
        items: [],
        totalReturnAmount: 0,
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `Original sale with ID ${saleId} not found in local list. Make sure it is loaded.`,
      });
    }
  }

  updateReturnItemSubtotal(index: number): void {
    const v = this.returnForm().value();
    const nextItems = [...v.items];
    const current = nextItems[index];
    const subtotal = (current.quantity ?? 0) * (current.unitPrice ?? 0);
    nextItems[index] = { ...current, subtotal };

    const totalReturnAmount = nextItems.reduce(
      (sum, it) => sum + (it.subtotal ?? 0),
      0,
    );

    this.returnForm().value.set({
      ...v,
      items: nextItems,
      totalReturnAmount,
    });
  }

  getProductName(productId: number): string {
    return (
      this.productStore.entities().find((p) => p.id === productId)?.name ??
      'Unknown'
    );
  }

  getOriginalQuantity(productId: number): number {
    const itemInOriginalSale = this.selectedOriginalSale()?.items.find(
      (item) => item.product.id === productId,
    );
    return itemInOriginalSale?.quantity ?? 0;
  }

  returnHasNoItems(): boolean {
    const v = this.returnForm().value();
    return !v.items.some((it) => (it.quantity ?? 0) > 0);
  }

  saveReturn(): void {
    if (this.returnForm().invalid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Invalid form. Please check the fields.',
      });
      return;
    }

    const formValue = this.returnForm().value();
    if (!this.selectedOriginalSale()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No valid original sale selected.',
      });
      return;
    }

    if (formValue.originalSaleId == null || formValue.employeeId == null) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Invalid form. Please check the fields.',
      });
      return;
    }

    const saleReturnData: SaleReturnData = {
      originalSaleId: formValue.originalSaleId,
      customerId: this.selectedOriginalSale()!.customer.id,
      employeeId: formValue.employeeId,
      totalReturnAmount: formValue.totalReturnAmount,
      reason: formValue.reason,
      items: formValue.items
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          productId: item.productId!,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
    };

    if (saleReturnData.items.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail:
          'You must specify a quantity greater than zero for at least one item to return.',
      });
      return;
    }

    const currentSelectedReturn = this.saleReturnStore.selectedSaleReturn();
    if (this.viewMode() && currentSelectedReturn) {
      this.saleReturnStore.update({
        id: currentSelectedReturn.id,
        data: saleReturnData,
      });
    } else {
      this.saleReturnStore.create(saleReturnData);
    }
  }
}
