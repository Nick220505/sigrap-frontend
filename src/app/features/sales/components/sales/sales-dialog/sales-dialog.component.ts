import { CurrencyPipe } from '@angular/common';
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
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthStore } from '@core/auth/stores/auth.store';
import { UserInfo } from '@features/configuration/models/user.model';
import { UserService } from '@features/configuration/services/user.service';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { CustomerService } from '@features/customer/services/customer.service';
import { ProductInfo } from '@features/inventory/models/product.model';
import { ProductService } from '@features/inventory/services/product.service';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import {
  PaymentMethod,
  SaleData,
  SaleStatus,
} from '../../../models/sale.model';
import { SaleStore } from '../../../stores/sale.store';

@Component({
  selector: 'app-sales-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    SelectModule,
    CalendarModule,
    TableModule,
    InputGroupModule,
    InputGroupAddonModule,
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
      <form [formGroup]="saleForm" class="flex flex-col gap-4 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="customerId" class="font-bold">Cliente</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-users"></i>
              </p-inputgroup-addon>
              <p-select
                id="customerId"
                formControlName="customerId"
                [options]="customers()"
                optionLabel="fullName"
                optionValue="id"
                placeholder="Seleccionar Cliente"
                [filter]="true"
                filterBy="fullName"
                styleClass="w-full"
                appendTo="body"
              ></p-select>
            </p-inputgroup>
          </div>

          <div class="flex flex-col gap-2">
            <label for="employeeId" class="font-bold">Empleado</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-user"></i>
              </p-inputgroup-addon>
              <p-select
                id="employeeId"
                formControlName="employeeId"
                [options]="employees()"
                optionLabel="name"
                optionValue="id"
                placeholder="Seleccionar Empleado"
                [filter]="true"
                filterBy="name"
                styleClass="w-full"
                appendTo="body"
              ></p-select>
            </p-inputgroup>
          </div>

          <div class="flex flex-col gap-2">
            <label for="paymentMethod" class="font-bold">Método de Pago</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-credit-card"></i>
              </p-inputgroup-addon>
              <p-select
                id="paymentMethod"
                formControlName="paymentMethod"
                [options]="paymentMethodValues"
                placeholder="Seleccionar Método de Pago"
                styleClass="w-full"
              >
                <ng-template pTemplate="selectedItem" let-selectedPaymentMethod>
                  @if (selectedPaymentMethod) {
                    @switch (selectedPaymentMethod) {
                      @case (PaymentMethod.CASH) {
                        <span>Efectivo</span>
                      }
                      @case (PaymentMethod.CREDIT_CARD) {
                        <span>Tarjeta de Crédito</span>
                      }
                      @case (PaymentMethod.DEBIT_CARD) {
                        <span>Tarjeta de Débito</span>
                      }
                      @case (PaymentMethod.BANK_TRANSFER) {
                        <span>Transferencia Bancaria</span>
                      }
                      @case (PaymentMethod.MOBILE_PAYMENT) {
                        <span>Pago Móvil</span>
                      }
                      @case (PaymentMethod.OTHER) {
                        <span>Otro</span>
                      }
                      @default {
                        <span>{{ selectedPaymentMethod }}</span>
                      }
                    }
                  } @else {
                    <span>Seleccionar Método de Pago</span>
                  }
                </ng-template>
                <ng-template pTemplate="item" let-pm>
                  @switch (pm) {
                    @case (PaymentMethod.CASH) {
                      <span>Efectivo</span>
                    }
                    @case (PaymentMethod.CREDIT_CARD) {
                      <span>Tarjeta de Crédito</span>
                    }
                    @case (PaymentMethod.DEBIT_CARD) {
                      <span>Tarjeta de Débito</span>
                    }
                    @case (PaymentMethod.BANK_TRANSFER) {
                      <span>Transferencia Bancaria</span>
                    }
                    @case (PaymentMethod.MOBILE_PAYMENT) {
                      <span>Pago Móvil</span>
                    }
                    @case (PaymentMethod.OTHER) {
                      <span>Otro</span>
                    }
                    @default {
                      <span>{{ pm }}</span>
                    }
                  }
                </ng-template>
              </p-select>
            </p-inputgroup>
          </div>

          <div class="flex flex-col gap-2">
            <label for="status" class="font-bold">Estado</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-flag"></i>
              </p-inputgroup-addon>
              <p-select
                id="status"
                formControlName="status"
                [options]="saleStatusValues"
                placeholder="Seleccionar Estado"
                styleClass="w-full"
              >
                <ng-template pTemplate="selectedItem" let-selectedStatus>
                  @if (selectedStatus) {
                    @switch (selectedStatus) {
                      @case (SaleStatus.COMPLETED) {
                        <span>Completada</span>
                      }
                      @case (SaleStatus.IN_PROGRESS) {
                        <span>En Progreso</span>
                      }
                      @case (SaleStatus.CANCELLED) {
                        <span>Cancelada</span>
                      }
                      @case (SaleStatus.RETURNED) {
                        <span>Devuelta</span>
                      }
                      @case (SaleStatus.PARTIALLY_RETURNED) {
                        <span>Devuelta Parcialmente</span>
                      }
                      @default {
                        <span>{{ selectedStatus }}</span>
                      }
                    }
                  } @else {
                    <span>Seleccionar Estado</span>
                  }
                </ng-template>
                <ng-template pTemplate="item" let-st>
                  @switch (st) {
                    @case (SaleStatus.COMPLETED) {
                      <span>Completada</span>
                    }
                    @case (SaleStatus.IN_PROGRESS) {
                      <span>En Progreso</span>
                    }
                    @case (SaleStatus.CANCELLED) {
                      <span>Cancelada</span>
                    }
                    @case (SaleStatus.RETURNED) {
                      <span>Devuelta</span>
                    }
                    @case (SaleStatus.PARTIALLY_RETURNED) {
                      <span>Devuelta Parcialmente</span>
                    }
                    @default {
                      <span>{{ st }}</span>
                    }
                  }
                </ng-template>
              </p-select>
            </p-inputgroup>
          </div>

          <div class="flex flex-col gap-2">
            <label for="taxAmount" class="font-bold">Impuesto</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-percentage"></i>
              </p-inputgroup-addon>
              <p-inputNumber
                id="taxAmount"
                formControlName="taxAmount"
                mode="currency"
                currency="COP"
                locale="es-CO"
                [minFractionDigits]="0"
                fluid
              ></p-inputNumber>
            </p-inputgroup>
          </div>

          <div class="flex flex-col gap-2">
            <label for="discountAmount" class="font-bold">Descuento</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-tag"></i>
              </p-inputgroup-addon>
              <p-inputNumber
                id="discountAmount"
                formControlName="discountAmount"
                mode="currency"
                currency="COP"
                locale="es-CO"
                [minFractionDigits]="0"
                fluid
              ></p-inputNumber>
            </p-inputgroup>
          </div>

          <div class="flex flex-col gap-2 col-span-1 md:col-span-2">
            <label for="notes" class="font-bold">Notas</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-align-left"></i>
              </p-inputgroup-addon>
              <textarea
                pTextarea
                id="notes"
                formControlName="notes"
                placeholder="Agregar notas sobre la venta"
                [rows]="3"
                class="w-full"
              ></textarea>
            </p-inputgroup>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg m-0">Artículos</h3>
            @if (!viewMode()) {
              <p-button
                label="Agregar Producto"
                icon="pi pi-plus"
                (onClick)="addItem()"
                [disabled]="viewMode()"
              ></p-button>
            }
          </div>

          <div formArrayName="items">
            <p-table
              [value]="itemsArray.controls"
              [tableStyle]="{ width: '100%' }"
              styleClass="p-datatable-sm"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th class="w-1/3">Producto</th>
                  <th class="w-1/8">Cantidad</th>
                  <th class="w-1/6">Precio Unitario</th>
                  <th class="w-1/6">Descuento</th>
                  <th class="w-1/6">Subtotal</th>
                  @if (!viewMode()) {
                    <th class="w-16">Acciones</th>
                  }
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item let-i="rowIndex">
                <tr [formGroupName]="i">
                  <td class="p-2">
                    <p-select
                      formControlName="productId"
                      [options]="products()"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Seleccionar Producto"
                      [filter]="true"
                      filterBy="name"
                      (onChange)="onProductChange(i, $event.value)"
                      [style]="{ width: '100%' }"
                      appendTo="body"
                    ></p-select>
                  </td>
                  <td class="p-2">
                    <p-inputNumber
                      formControlName="quantity"
                      [min]="1"
                      [showButtons]="true"
                      buttonLayout="horizontal"
                      step="1"
                      (onInput)="updateItemSubtotal(i)"
                      fluid
                    ></p-inputNumber>
                  </td>
                  <td class="p-2">
                    <p-inputNumber
                      formControlName="unitPrice"
                      mode="currency"
                      currency="COP"
                      locale="es-CO"
                      [minFractionDigits]="0"
                      [readonly]="true"
                      [style]="{ width: '100%' }"
                    ></p-inputNumber>
                  </td>
                  <td class="p-2">
                    <p-inputNumber
                      formControlName="discount"
                      mode="currency"
                      currency="COP"
                      locale="es-CO"
                      [minFractionDigits]="0"
                      (onInput)="updateItemSubtotal(i)"
                      [style]="{ width: '100%' }"
                    ></p-inputNumber>
                  </td>
                  <td class="p-2">
                    <p-inputNumber
                      formControlName="subtotal"
                      mode="currency"
                      currency="COP"
                      locale="es-CO"
                      [minFractionDigits]="0"
                      [style]="{ width: '100%' }"
                    ></p-inputNumber>
                  </td>
                  @if (!viewMode()) {
                    <td class="p-2 text-center">
                      <p-button
                        icon="pi pi-trash"
                        severity="danger"
                        (onClick)="removeItem(i)"
                        size="small"
                      ></p-button>
                    </td>
                  }
                </tr>
              </ng-template>
              <ng-template pTemplate="footer">
                <tr>
                  <td colspan="4" class="text-right font-bold p-2">Total:</td>
                  <td class="p-2">
                    <div
                      class="border border-gray-300 rounded-md p-2 text-right bg-gray-50"
                    >
                      {{
                        saleForm.get('totalAmount')?.value
                          | currency: 'COP' : '$' : '1.0-0'
                      }}
                    </div>
                  </td>
                  @if (!viewMode()) {
                    <td></td>
                  }
                </tr>
                <tr>
                  <td colspan="4" class="text-right font-bold p-2">
                    Total Final:
                  </td>
                  <td class="p-2">
                    <div
                      class="border border-gray-300 rounded-md p-2 text-right bg-gray-50"
                    >
                      {{
                        saleForm.get('finalAmount')?.value
                          | currency: 'COP' : '$' : '1.0-0'
                      }}
                    </div>
                  </td>
                  @if (!viewMode()) {
                    <td></td>
                  }
                </tr>
              </ng-template>
            </p-table>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          styleClass="p-button-text"
          (onClick)="saleStore.closeSaleDialog()"
        ></p-button>
        @if (!viewMode()) {
          <p-button
            label="Guardar"
            icon="pi pi-check"
            [disabled]="saleForm.invalid || saleForm.pristine"
            (onClick)="saveSale()"
          ></p-button>
        }
      </ng-template>
    </p-dialog>
  `,
})
export class SalesDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly saleStore = inject(SaleStore);
  readonly authStore = inject(AuthStore);
  private readonly productService = inject(ProductService);
  private readonly customerService = inject(CustomerService);
  private readonly userService = inject(UserService);

  readonly PaymentMethod = PaymentMethod;
  readonly SaleStatus = SaleStatus;
  readonly paymentMethodValues = Object.values(PaymentMethod);
  readonly saleStatusValues = Object.values(SaleStatus);

  readonly products = signal<ProductInfo[]>([]);
  readonly customers = signal<(CustomerInfo & { fullName: string })[]>([]);
  readonly employees = signal<UserInfo[]>([]);

  readonly viewMode = computed(() => {
    const selectedSale = this.saleStore.selectedSale();
    return (
      selectedSale !== null && selectedSale.status !== SaleStatus.IN_PROGRESS
    );
  });

  readonly dialogHeader = computed(() => {
    const selectedSale = this.saleStore.selectedSale();
    if (selectedSale) {
      return `Venta #${selectedSale.id}`;
    }
    return 'Registrar Nueva Venta';
  });

  readonly saleForm: FormGroup = this.fb.group({
    customerId: [null],
    employeeId: [null, Validators.required],
    paymentMethod: [PaymentMethod.CASH, Validators.required],
    status: [SaleStatus.IN_PROGRESS, Validators.required],
    totalAmount: [
      { value: 0, disabled: true },
      [Validators.required, Validators.min(0)],
    ],
    taxAmount: [0, [Validators.required, Validators.min(0)]],
    discountAmount: [0, [Validators.required, Validators.min(0)]],
    finalAmount: [
      { value: 0, disabled: true },
      [Validators.required, Validators.min(0)],
    ],
    notes: [''],
    items: this.fb.array([]),
  });

  get itemsArray(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  constructor() {
    this.loadProducts();
    this.loadCustomers();
    this.loadEmployees();

    this.userService.findAll().subscribe((employees) => {
      if (employees.length > 0) {
        this.saleForm.get('employeeId')?.setValue(employees[0].id);
      }
    });

    effect(() => {
      const selectedSale = this.saleStore.selectedSale();
      const isViewMode =
        selectedSale !== null && selectedSale.status !== SaleStatus.IN_PROGRESS;

      untracked(() => {
        if (selectedSale) {
          while (this.itemsArray.length > 0) {
            this.itemsArray.removeAt(0);
          }

          this.saleForm.patchValue({
            customerId: selectedSale.customer?.id ?? null,
            employeeId: selectedSale.employee.id,
            paymentMethod: selectedSale.paymentMethod,
            status: selectedSale.status,
            totalAmount: selectedSale.totalAmount,
            taxAmount: selectedSale.taxAmount,
            discountAmount: selectedSale.discountAmount,
            finalAmount: selectedSale.finalAmount,
            notes: selectedSale.notes ?? '',
          });

          selectedSale.items.forEach((item) => {
            const itemGroup = this.fb.group({
              productId: [
                { value: item.product.id, disabled: isViewMode },
                Validators.required,
              ],
              quantity: [
                {
                  value: item.quantity,
                  disabled: isViewMode,
                },
                [Validators.required, Validators.min(1)],
              ],
              unitPrice: [
                {
                  value: item.unitPrice,
                  disabled: true,
                },
                [Validators.required, Validators.min(0)],
              ],
              discount: [
                {
                  value: item.discount,
                  disabled: isViewMode,
                },
                [Validators.required, Validators.min(0)],
              ],
              subtotal: [
                { value: item.subtotal, disabled: true },
                [Validators.required, Validators.min(0)],
              ],
            });

            this.itemsArray.push(itemGroup);
          });

          this.saleForm.markAsPristine();

          if (isViewMode) {
            this.saleForm.disable();
            // Keep total and final amount controls disabled regardless
            this.saleForm.get('totalAmount')?.disable();
            this.saleForm.get('finalAmount')?.disable();
          }
        } else {
          this.saleForm.enable();
          this.saleForm.reset({
            customerId: null,
            employeeId:
              this.employees().length > 0 ? this.employees()[0].id : null,
            paymentMethod: PaymentMethod.CASH,
            status: SaleStatus.IN_PROGRESS,
            totalAmount: 0,
            taxAmount: 0,
            discountAmount: 0,
            finalAmount: 0,
            notes: '',
          });

          // Always disable totalAmount and finalAmount
          this.saleForm.get('totalAmount')?.disable();
          this.saleForm.get('finalAmount')?.disable();

          while (this.itemsArray.length > 0) {
            this.itemsArray.removeAt(0);
          }

          this.addItem();
        }
      });
    });

    this.saleForm.get('items')?.valueChanges.subscribe(() => {
      this.updateTotals();
    });

    this.saleForm.get('taxAmount')?.valueChanges.subscribe(() => {
      this.updateFinalAmount();
    });

    this.saleForm.get('discountAmount')?.valueChanges.subscribe(() => {
      this.updateFinalAmount();
    });
  }

  private loadProducts(): void {
    this.productService.findAll().subscribe({
      next: (products) => this.products.set(products),
      error: (error) => console.error('Error loading products', error),
    });
  }

  private loadCustomers(): void {
    this.customerService.findAll().subscribe({
      next: (customers) => {
        const customersWithFullName = customers.map((customer) => ({
          ...customer,
          fullName: `${customer.firstName} ${customer.lastName}`,
        }));
        this.customers.set(customersWithFullName);
      },
      error: (error) => console.error('Error loading customers', error),
    });
  }

  private loadEmployees(): void {
    this.userService.findAll().subscribe({
      next: (users) => this.employees.set(users),
      error: (error) => console.error('Error loading employees', error),
    });
  }

  addItem(): void {
    this.itemsArray.push(
      this.fb.group({
        productId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [
          { value: 0, disabled: true },
          [Validators.required, Validators.min(0)],
        ],
        discount: [0, [Validators.required, Validators.min(0)]],
        subtotal: [
          { value: 0, disabled: true },
          [Validators.required, Validators.min(0)],
        ],
      }),
    );
    this.saleForm.markAsDirty();
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
    this.updateTotals();
    this.saleForm.markAsDirty();
  }

  onProductChange(index: number, productId: number): void {
    const product = this.products().find((p) => p.id === productId);
    if (product) {
      const itemGroup = this.itemsArray.at(index);
      const unitPriceControl = itemGroup.get('unitPrice');
      if (unitPriceControl) {
        unitPriceControl.setValue(product.salePrice);
      }
      this.updateItemSubtotal(index);
    }
  }

  updateItemSubtotal(index: number): void {
    const itemGroup = this.itemsArray.at(index);
    const quantity = itemGroup.get('quantity')?.value ?? 0;
    const unitPrice = itemGroup.get('unitPrice')?.value ?? 0;
    const discount = itemGroup.get('discount')?.value ?? 0;

    const subtotal = quantity * unitPrice - discount;
    itemGroup.get('subtotal')?.setValue(subtotal);

    this.updateTotals();
    this.saleForm.markAsDirty();
  }

  updateTotals(): void {
    let total = 0;
    for (let i = 0; i < this.itemsArray.length; i++) {
      const itemGroup = this.itemsArray.at(i);
      total += itemGroup.get('subtotal')?.value ?? 0;
    }

    this.saleForm.get('totalAmount')?.setValue(total);
    this.updateFinalAmount();
  }

  updateFinalAmount(): void {
    const totalAmount = this.saleForm.get('totalAmount')?.value ?? 0;
    const taxAmount = this.saleForm.get('taxAmount')?.value ?? 0;
    const discountAmount = this.saleForm.get('discountAmount')?.value ?? 0;

    const finalAmount = totalAmount + taxAmount - discountAmount;
    this.saleForm.get('finalAmount')?.setValue(finalAmount);
  }

  saveSale(): void {
    if (this.saleForm.invalid) {
      return;
    }

    const formValue = this.saleForm.value;
    const saleData: SaleData = {
      totalAmount: formValue.totalAmount,
      taxAmount: formValue.taxAmount,
      discountAmount: formValue.discountAmount,
      finalAmount: formValue.finalAmount,
      notes: formValue.notes,
      paymentMethod: formValue.paymentMethod,
      status: formValue.status,
      customerId: formValue.customerId,
      employeeId: formValue.employeeId,
      items: formValue.items,
    };

    const selectedSale = this.saleStore.selectedSale();
    if (selectedSale) {
      this.saleStore.update({ id: selectedSale.id, saleData });
    } else {
      this.saleStore.create(saleData);
    }

    this.saleStore.closeSaleDialog();
  }
}
