import { CommonModule, CurrencyPipe } from '@angular/common';
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

import { AuthStore } from '@core/auth/stores/auth.store';
import { UserStore } from '@features/configuration/stores/user.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { SaleStore } from '@features/sales/stores/sale.store';

import {
  SaleReturnItemInfo as ReturnItemInfo,
  SaleReturnData,
} from '@features/sales/models/sale-return.model';
import { SaleInfo, SaleItemInfo } from '@features/sales/models/sale.model';

@Component({
  selector: 'app-sales-returns-dialog',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TableModule,
    TextareaModule,
    CurrencyPipe,
    InputGroupModule,
    InputGroupAddonModule,
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
      <form [formGroup]="returnForm" class="flex flex-col gap-4 pt-4">
        <div class="flex flex-col gap-2">
          <label for="originalSaleId" class="font-bold">Venta Original</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-shopping-cart"></i>
            </p-inputgroup-addon>
            <p-select
              id="originalSaleId"
              formControlName="originalSaleId"
              [options]="saleStore.entities()"
              optionLabel="id"
              optionValue="id"
              placeholder="Seleccionar Venta Original"
              (onChange)="onOriginalSaleChange($event.value)"
              [filter]="true"
              styleClass="w-full"
              appendTo="body"
            ></p-select>
          </p-inputgroup>
        </div>

        @if (selectedOriginalSale(); as originalSale) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-col gap-2">
              <label for="customerName" class="font-bold">Cliente</label>
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
                >Empleado (Venta Original)</label
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
              >Razón de la Devolución <span class="text-red-500">*</span></label
            >
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-comment"></i>
              </p-inputgroup-addon>
              <textarea
                id="reason"
                pTextarea
                formControlName="reason"
                rows="3"
                class="w-full"
                [ngClass]="{
                  'ng-invalid ng-dirty':
                    returnForm.get('reason')?.invalid &&
                    returnForm.get('reason')?.touched,
                }"
                placeholder="Ingrese el motivo detallado de la devolución..."
              ></textarea>
            </p-inputgroup>
            @if (
              returnForm.get('reason')?.invalid &&
              returnForm.get('reason')?.touched
            ) {
              <small class="p-error">
                @if (returnForm.get('reason')?.hasError('required')) {
                  La razón de devolución es obligatoria.
                } @else if (returnForm.get('reason')?.hasError('minlength')) {
                  La razón debe tener al menos 5 caracteres.
                }
              </small>
            }
          </div>

          <div class="flex flex-col gap-2">
            <h3 class="font-bold text-lg m-0">Productos a Devolver</h3>
            <div formArrayName="items">
              <p-table
                [value]="returnItemsArray.controls"
                [tableStyle]="{ 'min-width': '50rem' }"
              >
                <ng-template pTemplate="header">
                  <tr>
                    <th>Producto</th>
                    <th>Precio Original</th>
                    <th>Cant. Comprada</th>
                    <th>Cant. a Devolver</th>
                    <th>Subtotal Devolución</th>
                  </tr>
                </ng-template>
                <ng-template
                  pTemplate="body"
                  let-itemFormGroup
                  let-i="rowIndex"
                  let-last="last"
                >
                  <tr [formGroupName]="i">
                    <td>
                      {{
                        getProductName(itemFormGroup.get('productId')?.value)
                      }}
                    </td>
                    <td>
                      {{
                        itemFormGroup.get('unitPrice')?.value
                          | currency: 'COP' : '$' : '1.0-0'
                      }}
                    </td>
                    <td>
                      {{
                        getOriginalQuantity(
                          itemFormGroup.get('productId')?.value
                        )
                      }}
                    </td>
                    <td>
                      <p-inputNumber
                        formControlName="quantity"
                        [min]="0"
                        [max]="
                          getOriginalQuantity(
                            itemFormGroup.get('productId')?.value
                          )
                        "
                        [showButtons]="true"
                        buttonLayout="horizontal"
                        (onInput)="updateReturnItemSubtotal(i)"
                      ></p-inputNumber>
                    </td>
                    <td>
                      {{
                        itemFormGroup.get('subtotal')?.value
                          | currency: 'COP' : '$' : '1.0-0'
                      }}
                    </td>
                  </tr>
                </ng-template>
                <ng-template pTemplate="footer">
                  <tr>
                    <td colspan="4" class="text-right font-bold">
                      Total Devolución:
                    </td>
                    <td class="font-bold text-xl">
                      {{
                        returnForm.get('totalReturnAmount')?.value
                          | currency: 'COP' : '$' : '1.0-0'
                      }}
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </div>
        }
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          styleClass="p-button-text"
          (click)="saleReturnStore.closeReturnDialog()"
        />
        @if (!viewMode()) {
          <p-button
            label="Guardar"
            icon="pi pi-check"
            (click)="saveReturn()"
            [disabled]="
              returnForm.invalid ||
              returnItemsArray.length === 0 ||
              returnHasNoItems()
            "
          />
        }
      </ng-template>
    </p-dialog>
  `,
})
export class SalesReturnsDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly saleReturnStore = inject(SaleReturnStore);
  readonly saleStore = inject(SaleStore);
  readonly productStore = inject(ProductStore);
  private readonly authStore = inject(AuthStore);
  private readonly userStore = inject(UserStore);
  private readonly messageService = inject(MessageService);

  readonly selectedOriginalSale = signal<SaleInfo | null>(null);

  returnForm: FormGroup = this.fb.group({
    originalSaleId: [null, Validators.required],
    customerId: [{ value: null, disabled: true }, Validators.required],
    employeeId: [null, Validators.required],
    totalReturnAmount: [{ value: 0, disabled: true }, Validators.required],
    reason: ['', [Validators.required, Validators.minLength(5)]],
    items: this.fb.array([]),
  });

  get returnItemsArray(): FormArray {
    return this.returnForm.get('items') as FormArray;
  }

  readonly viewMode = computed(
    () => this.saleReturnStore.selectedSaleReturn() !== null,
  );
  readonly dialogHeader = computed(() =>
    this.viewMode() ? 'Detalles de Devolución' : 'Nueva Devolución',
  );

  constructor() {
    effect(() => {
      const loggedInUser = this.authStore.user();
      if (!this.viewMode() && !this.returnForm.get('employeeId')?.value) {
        if (
          loggedInUser &&
          this.userStore.entities().some((u) => u.id === loggedInUser.id)
        ) {
          this.returnForm.get('employeeId')?.setValue(loggedInUser.id);
        } else if (this.userStore.entities().length > 0) {
          this.returnForm
            .get('employeeId')
            ?.setValue(this.userStore.entities()[0].id);
        }
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
            this.returnForm.patchValue({
              originalSaleId: currentSaleReturn.originalSaleId,
              customerId: currentSaleReturn.customer.id,
              employeeId: currentSaleReturn.employee.id,
              totalReturnAmount: currentSaleReturn.totalReturnAmount,
              reason: currentSaleReturn.reason,
            });
            this.returnItemsArray.clear();
            currentSaleReturn.items.forEach((item) => {
              const originalSaleItem = originalSale.items.find(
                (i) => i.product.id === item.product.id,
              );
              if (originalSaleItem) {
                this.returnItemsArray.push(
                  this.createReturnItemFormGroupFromReturn(
                    item,
                    true,
                    originalSaleItem.quantity,
                  ),
                );
              }
            });
            this.returnForm.disable();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Venta original con ID ${currentSaleReturn.originalSaleId} no encontrada.`,
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
    let defaultEmployeeId = null;
    const loggedInUser = this.authStore.user();
    if (
      loggedInUser &&
      this.userStore.entities().some((u) => u.id === loggedInUser.id)
    ) {
      defaultEmployeeId = loggedInUser.id;
    } else if (this.userStore.entities().length > 0) {
      defaultEmployeeId = this.userStore.entities()[0].id;
    }

    this.returnForm.reset({
      originalSaleId: null,
      customerId: null,
      employeeId: defaultEmployeeId,
      totalReturnAmount: 0,
      reason: '',
    });
    this.returnItemsArray.clear();
    this.returnForm.get('totalReturnAmount')?.setValue(0);

    this.returnForm.enable();
    this.returnForm.get('customerId')?.disable();
    this.returnForm.get('totalReturnAmount')?.disable();
  }

  onOriginalSaleChange(saleId: number | null): void {
    if (!saleId) {
      this.selectedOriginalSale.set(null);
      this.returnForm.get('customerId')?.setValue(null);
      this.returnItemsArray.clear();
      this.updateTotalReturnAmount();
      return;
    }

    const originalSale = this.saleStore.entities().find((s) => s.id === saleId);
    if (originalSale) {
      this.selectedOriginalSale.set(originalSale);
      this.returnForm.get('customerId')?.setValue(originalSale.customer.id);
      this.returnItemsArray.clear();
      originalSale.items.forEach((item) => {
        this.returnItemsArray.push(
          this.createReturnItemFormGroup(item, this.viewMode()),
        );
      });
      this.updateTotalReturnAmount();
    } else {
      this.selectedOriginalSale.set(null);
      this.returnForm.get('customerId')?.setValue(null);
      this.returnItemsArray.clear();
      this.updateTotalReturnAmount();
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: `Venta original con ID ${saleId} no encontrada en la lista local. Asegúrese que esté cargada.`,
      });
    }
  }

  createReturnItemFormGroup(
    originalSaleItem: SaleItemInfo,
    isViewMode: boolean,
  ): FormGroup {
    const previouslyReturnedQty = 0;
    const maxReturnable = originalSaleItem.quantity - previouslyReturnedQty;
    return this.fb.group({
      productId: [{ value: originalSaleItem.product.id, disabled: true }],
      unitPrice: [{ value: originalSaleItem.unitPrice, disabled: true }],
      originalQuantity: [{ value: originalSaleItem.quantity, disabled: true }],
      quantity: [
        { value: 0, disabled: isViewMode },
        [Validators.required, Validators.min(0), Validators.max(maxReturnable)],
      ],
      subtotal: [{ value: 0, disabled: true }],
    });
  }

  createReturnItemFormGroupFromReturn(
    returnedItem: ReturnItemInfo,
    isViewMode: boolean,
    originalSaleItemQty: number,
  ): FormGroup {
    return this.fb.group({
      productId: [{ value: returnedItem.product.id, disabled: true }],
      unitPrice: [{ value: returnedItem.unitPrice, disabled: true }],
      originalQuantity: [{ value: originalSaleItemQty, disabled: true }],
      quantity: [
        { value: returnedItem.quantity, disabled: isViewMode },
        [
          Validators.required,
          Validators.min(0),
          Validators.max(originalSaleItemQty),
        ],
      ],
      subtotal: [{ value: returnedItem.subtotal, disabled: true }],
    });
  }

  updateReturnItemSubtotal(index: number): void {
    const itemGroup = this.returnItemsArray.at(index);
    const quantity = itemGroup.get('quantity')?.value ?? 0;
    const unitPrice = itemGroup.get('unitPrice')?.value ?? 0;
    itemGroup.get('subtotal')?.setValue(quantity * unitPrice);
    this.updateTotalReturnAmount();
  }

  updateTotalReturnAmount(): void {
    const total = this.returnItemsArray.controls.reduce(
      (sum, control) => sum + (control.get('subtotal')?.value ?? 0),
      0,
    );
    this.returnForm.get('totalReturnAmount')?.setValue(total);
  }

  getProductName(productId: number): string {
    return (
      this.productStore.entities().find((p) => p.id === productId)?.name ??
      'Desconocido'
    );
  }

  getOriginalQuantity(productId: number): number {
    const itemInOriginalSale = this.selectedOriginalSale()?.items.find(
      (item) => item.product.id === productId,
    );
    return itemInOriginalSale?.quantity ?? 0;
  }

  returnHasNoItems(): boolean {
    return !this.returnItemsArray.controls.some(
      (control) => (control.get('quantity')?.value ?? 0) > 0,
    );
  }

  saveReturn(): void {
    if (this.returnForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Formulario inválido. Revise los campos.',
      });
      return;
    }

    const formValue = this.returnForm.getRawValue();
    if (!this.selectedOriginalSale()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha seleccionado una venta original válida.',
      });
      return;
    }

    const saleReturnData: SaleReturnData = {
      originalSaleId: formValue.originalSaleId,
      customerId: this.selectedOriginalSale()!.customer.id,
      employeeId: formValue.employeeId,
      totalReturnAmount: formValue.totalReturnAmount,
      reason: formValue.reason,
      items: this.returnItemsArray.controls
        .map((control) => control.getRawValue())
        .filter((item) => item.quantity > 0)
        .map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        })),
    };

    if (saleReturnData.items.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail:
          'Debe especificar una cantidad mayor a cero para al menos un artículo a devolver.',
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
