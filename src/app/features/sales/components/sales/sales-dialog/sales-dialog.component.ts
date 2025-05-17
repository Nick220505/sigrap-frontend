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
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
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
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    DropdownModule,
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
      [style]="{ width: '80vw', maxWidth: '1000px' }"
      [header]="dialogHeader()"
      [modal]="true"
      [resizable]="false"
    >
      <form [formGroup]="saleForm" class="flex flex-col gap-4 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="customerId" class="font-bold">Cliente</label>
            <p-dropdown
              id="customerId"
              formControlName="customerId"
              [options]="customers()"
              optionLabel="fullName"
              optionValue="id"
              placeholder="Seleccionar Cliente"
              [filter]="true"
              filterBy="fullName"
              [showClear]="true"
              [disabled]="viewMode()"
              [style]="{ width: '100%' }"
            ></p-dropdown>
          </div>

          <div class="flex flex-col gap-2">
            <label for="employeeId" class="font-bold">Empleado</label>
            <p-dropdown
              id="employeeId"
              formControlName="employeeId"
              [options]="employees()"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccionar Empleado"
              [filter]="true"
              filterBy="name"
              [disabled]="viewMode()"
              [style]="{ width: '100%' }"
            ></p-dropdown>
          </div>

          <div class="flex flex-col gap-2">
            <label for="paymentMethod" class="font-bold">Método de Pago</label>
            <p-dropdown
              id="paymentMethod"
              formControlName="paymentMethod"
              [options]="paymentMethodValues"
              placeholder="Seleccionar Método de Pago"
              [disabled]="viewMode()"
              [style]="{ width: '100%' }"
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
            </p-dropdown>
          </div>

          <div class="flex flex-col gap-2">
            <label for="status" class="font-bold">Estado</label>
            <p-dropdown
              id="status"
              formControlName="status"
              [options]="saleStatusValues"
              placeholder="Seleccionar Estado"
              [disabled]="viewMode()"
              [style]="{ width: '100%' }"
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
            </p-dropdown>
          </div>

          <div class="flex flex-col gap-2">
            <label for="taxAmount" class="font-bold">Impuesto</label>
            <p-inputNumber
              id="taxAmount"
              formControlName="taxAmount"
              mode="currency"
              currency="USD"
              locale="en-US"
              [minFractionDigits]="2"
              [disabled]="viewMode()"
            ></p-inputNumber>
          </div>

          <div class="flex flex-col gap-2">
            <label for="discountAmount" class="font-bold">Descuento</label>
            <p-inputNumber
              id="discountAmount"
              formControlName="discountAmount"
              mode="currency"
              currency="USD"
              locale="en-US"
              [minFractionDigits]="2"
              [disabled]="viewMode()"
            ></p-inputNumber>
          </div>

          <div class="flex flex-col gap-2 col-span-1 md:col-span-2">
            <label for="notes" class="font-bold">Notas</label>
            <textarea
              pTextarea
              id="notes"
              formControlName="notes"
              placeholder="Agregar notas sobre la venta"
              [rows]="3"
              [disabled]="viewMode()"
            ></textarea>
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
              [tableStyle]="{ 'min-width': '100%' }"
            >
              <ng-template pTemplate="header">
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Descuento</th>
                  <th>Subtotal</th>
                  @if (!viewMode()) {
                    <th>Acciones</th>
                  }
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-item let-i="rowIndex">
                <tr [formGroupName]="i">
                  <td>
                    <p-dropdown
                      formControlName="productId"
                      [options]="products()"
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Seleccionar Producto"
                      [filter]="true"
                      filterBy="name"
                      [disabled]="viewMode()"
                      (onChange)="onProductChange(i, $event.value)"
                      [style]="{ width: '100%', 'min-width': '200px' }"
                    ></p-dropdown>
                  </td>
                  <td>
                    <p-inputNumber
                      formControlName="quantity"
                      [min]="1"
                      [showButtons]="true"
                      [disabled]="viewMode()"
                      (onInput)="updateItemSubtotal(i)"
                      [style]="{ width: '100px' }"
                    ></p-inputNumber>
                  </td>
                  <td>
                    <p-inputNumber
                      formControlName="unitPrice"
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      [minFractionDigits]="2"
                      [disabled]="viewMode()"
                      (onInput)="updateItemSubtotal(i)"
                      [style]="{ width: '150px' }"
                    ></p-inputNumber>
                  </td>
                  <td>
                    <p-inputNumber
                      formControlName="discount"
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      [minFractionDigits]="2"
                      [disabled]="viewMode()"
                      (onInput)="updateItemSubtotal(i)"
                      [style]="{ width: '150px' }"
                    ></p-inputNumber>
                  </td>
                  <td>
                    <p-inputNumber
                      formControlName="subtotal"
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      [minFractionDigits]="2"
                      [disabled]="true"
                      [style]="{ width: '150px' }"
                    ></p-inputNumber>
                  </td>
                  @if (!viewMode()) {
                    <td>
                      <p-button
                        icon="pi pi-trash"
                        severity="danger"
                        (onClick)="removeItem(i)"
                        [disabled]="viewMode()"
                      ></p-button>
                    </td>
                  }
                </tr>
              </ng-template>
              <ng-template pTemplate="footer">
                <tr>
                  <td colspan="4" class="text-right font-bold">Total:</td>
                  <td>
                    <p-inputNumber
                      formControlName="totalAmount"
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      [minFractionDigits]="2"
                      [disabled]="true"
                    ></p-inputNumber>
                  </td>
                  @if (!viewMode()) {
                    <td></td>
                  }
                </tr>
                <tr>
                  <td colspan="4" class="text-right font-bold">Total Final:</td>
                  <td>
                    <p-inputNumber
                      formControlName="finalAmount"
                      mode="currency"
                      currency="USD"
                      locale="en-US"
                      [minFractionDigits]="2"
                      [disabled]="true"
                    ></p-inputNumber>
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
    totalAmount: [0, [Validators.required, Validators.min(0)]],
    taxAmount: [0, [Validators.required, Validators.min(0)]],
    discountAmount: [0, [Validators.required, Validators.min(0)]],
    finalAmount: [0, [Validators.required, Validators.min(0)]],
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
            this.itemsArray.push(
              this.fb.group({
                productId: [item.product.id, Validators.required],
                quantity: [
                  item.quantity,
                  [Validators.required, Validators.min(1)],
                ],
                unitPrice: [
                  item.unitPrice,
                  [Validators.required, Validators.min(0)],
                ],
                discount: [
                  item.discount,
                  [Validators.required, Validators.min(0)],
                ],
                subtotal: [
                  item.subtotal,
                  [Validators.required, Validators.min(0)],
                ],
              }),
            );
          });

          this.saleForm.markAsPristine();
        } else {
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
        unitPrice: [0, [Validators.required, Validators.min(0)]],
        discount: [0, [Validators.required, Validators.min(0)]],
        subtotal: [0, [Validators.required, Validators.min(0)]],
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
      itemGroup.get('unitPrice')?.setValue(product.salePrice);
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
