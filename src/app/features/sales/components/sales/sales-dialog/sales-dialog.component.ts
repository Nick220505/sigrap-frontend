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
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthStore } from '@core/auth/stores/auth.store';
import { UserStore } from '@features/configuration/stores/user.store';
import { CustomerStore } from '@features/customer/stores/customer.store';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { SaleData } from '../../../models/sale.model';
import { SaleStore } from '../../../stores/sale.store';

@Component({
  selector: 'app-sales-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
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
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg m-0">Artículos</h3>
            @if (!viewMode()) {
              <p-button
                label="Agregar Producto"
                icon="pi pi-plus"
                (click)="addItem()"
                [disabled]="viewMode()"
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
                  <th class="w-1/4">Subtotal</th>
                  @if (!viewMode()) {
                    <th class="w-16">Acciones</th>
                  }
                </tr>
              </ng-template>
              <ng-template pTemplate="body" let-row let-i="rowIndex">
                @if (!row.isSummary) {
                  <tr [formGroupName]="row.formGroupIndex">
                    <td class="p-2">
                      <p-select
                        formControlName="productId"
                        [options]="products()"
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
                      ></p-select>
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
                      ></p-inputNumber>
                    </td>
                    <td class="p-2">
                      <p-inputNumber
                        [ngModel]="
                          itemsArray.at(row.formGroupIndex).get('unitPrice')
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
                      ></p-inputNumber>
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
                      ></p-inputNumber>
                    </td>
                    @if (!viewMode()) {
                      <td class="p-2 text-center">
                        <p-button
                          icon="pi pi-trash"
                          severity="danger"
                          (click)="removeItem(row.formGroupIndex)"
                          size="small"
                        ></p-button>
                      </td>
                    }
                  </tr>
                } @else {
                  @if (row.type === 'total') {
                    <tr>
                      <td colspan="3" class="p-2 text-right font-bold">
                        Total:
                      </td>
                      <td class="p-2">
                        <p-inputNumber
                          [ngModel]="saleForm.get('totalAmount')?.value"
                          [ngModelOptions]="{ standalone: true }"
                          mode="currency"
                          currency="COP"
                          locale="es-CO"
                          [readonly]="true"
                          [disabled]="true"
                          maxFractionDigits="0"
                          [style]="{ width: '100%' }"
                        ></p-inputNumber>
                      </td>
                      @if (!viewMode()) {
                        <td></td>
                      }
                    </tr>
                  }
                  @if (row.type === 'tax') {
                    <tr>
                      <td colspan="3" class="p-2 text-right font-bold">
                        Impuesto (19% IVA):
                      </td>
                      <td class="p-2">
                        <p-inputNumber
                          [ngModel]="saleForm.get('taxAmount')?.value"
                          [ngModelOptions]="{ standalone: true }"
                          mode="currency"
                          currency="COP"
                          locale="es-CO"
                          [readonly]="true"
                          [disabled]="true"
                          maxFractionDigits="0"
                          [style]="{ width: '100%' }"
                        ></p-inputNumber>
                      </td>
                      @if (!viewMode()) {
                        <td></td>
                      }
                    </tr>
                  }
                  @if (row.type === 'combinedDiscount') {
                    <tr>
                      <td colspan="3" class="p-2 text-right font-bold">
                        Descuento:
                      </td>
                      <td class="p-2">
                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                          <div class="flex flex-col">
                            <label for="discountPercent" class="text-xs mb-1"
                              >Porcentaje</label
                            >
                            @if (!viewMode()) {
                              <p-inputNumber
                                id="discountPercent"
                                [formControl]="discountPercentControl"
                                suffix="%"
                                [min]="0"
                                [max]="100"
                                showButtons
                                buttonLayout="horizontal"
                                step="1"
                                (onInput)="updateDiscountFromPercentage()"
                                styleClass="w-full"
                                fluid
                                [style]="{ minWidth: '130px' }"
                              ></p-inputNumber>
                            } @else {
                              <p-inputNumber
                                id="discountPercent"
                                [ngModel]="discountPercentControl.value"
                                [ngModelOptions]="{ standalone: true }"
                                suffix="%"
                                [readonly]="true"
                                [disabled]="true"
                                styleClass="w-full"
                                fluid
                                [style]="{ minWidth: '130px' }"
                              ></p-inputNumber>
                            }
                          </div>
                          <div class="flex flex-col">
                            <label for="discountAmount" class="text-xs mb-1"
                              >Monto</label
                            >
                            <p-inputNumber
                              id="discountAmount"
                              [ngModel]="saleForm.get('discountAmount')?.value"
                              [ngModelOptions]="{ standalone: true }"
                              mode="currency"
                              currency="COP"
                              locale="es-CO"
                              [readonly]="true"
                              [disabled]="true"
                              maxFractionDigits="0"
                              styleClass="w-full"
                              fluid
                            ></p-inputNumber>
                          </div>
                        </div>
                      </td>
                      @if (!viewMode()) {
                        <td></td>
                      }
                    </tr>
                  }
                  @if (row.type === 'finalTotal') {
                    <tr>
                      <td colspan="3" class="p-2 text-right font-bold text-lg">
                        Total Final:
                      </td>
                      <td class="p-2">
                        <p-inputNumber
                          [ngModel]="saleForm.get('finalAmount')?.value"
                          [ngModelOptions]="{ standalone: true }"
                          mode="currency"
                          currency="COP"
                          locale="es-CO"
                          [readonly]="true"
                          [disabled]="true"
                          maxFractionDigits="0"
                          [style]="{ width: '100%' }"
                          styleClass="w-full font-bold"
                        ></p-inputNumber>
                      </td>
                      @if (!viewMode()) {
                        <td></td>
                      }
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
          label="Cancelar"
          icon="pi pi-times"
          styleClass="p-button-text"
          (click)="saleStore.closeSaleDialog()"
        ></p-button>
        @if (!viewMode()) {
          <p-button
            label="Guardar"
            icon="pi pi-check"
            [disabled]="saleForm.invalid || saleForm.pristine"
            (click)="saveSale()"
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
  private readonly productStore = inject(ProductStore);
  private readonly customerStore = inject(CustomerStore);
  private readonly userStore = inject(UserStore);

  private readonly itemsCountSignal = signal(0);

  readonly products = computed(() => this.productStore.entities());
  readonly customers = computed(() => {
    return this.customerStore.entities().map((customer) => ({
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
    }));
  });
  readonly employees = computed(() => this.userStore.entities());

  readonly viewMode = computed(() => {
    const selectedSale = this.saleStore.selectedSale();
    return selectedSale !== null;
  });

  readonly dialogHeader = computed(() => {
    const selectedSale = this.saleStore.selectedSale();
    if (selectedSale) {
      return `Venta #${selectedSale.id}`;
    }
    return 'Registrar Nueva Venta';
  });

  readonly tableRows = computed(() => {
    this.itemsCountSignal();

    const itemRows = this.itemsArray.controls.map((_, i) => ({
      isSummary: false,
      formGroupIndex: i,
    }));

    const summaryRows = [
      { isSummary: true, type: 'total' },
      { isSummary: true, type: 'tax' },
      { isSummary: true, type: 'combinedDiscount' },
      { isSummary: true, type: 'finalTotal' },
    ];

    return [...itemRows, ...summaryRows];
  });

  readonly saleForm: FormGroup = this.fb.group({
    customerId: [null, Validators.required],
    employeeId: [null, Validators.required],
    totalAmount: [
      { value: 0, disabled: true },
      [Validators.required, Validators.min(0)],
    ],
    taxAmount: [
      { value: 0, disabled: true },
      [Validators.required, Validators.min(0)],
    ],
    discountAmount: [0, [Validators.required, Validators.min(0)]],
    discountPercent: [
      0,
      [Validators.required, Validators.min(0), Validators.max(100)],
    ],
    finalAmount: [
      { value: 0, disabled: true },
      [Validators.required, Validators.min(0)],
    ],
    items: this.fb.array([]),
  });

  get discountAmountControl() {
    return this.saleForm.get('discountAmount') as FormControl;
  }

  get discountPercentControl() {
    return this.saleForm.get('discountPercent') as FormControl;
  }

  get itemsArray(): FormArray {
    return this.saleForm.get('items') as FormArray;
  }

  private readonly IVA_RATE = 0.19;

  constructor() {
    effect(() => {
      const currentEmployees = this.employees();
      const formEmployeeIdControl = this.saleForm.get('employeeId');
      const loggedInUser = this.authStore.user();

      if (currentEmployees.length > 0 && !formEmployeeIdControl?.value) {
        if (loggedInUser?.id) {
          const employeeInList = currentEmployees.find(
            (emp) => emp.id === loggedInUser.id,
          );
          if (employeeInList) {
            formEmployeeIdControl?.setValue(employeeInList.id);
          } else {
            formEmployeeIdControl?.setValue(currentEmployees[0].id);
          }
        } else if (currentEmployees.length > 0) {
          formEmployeeIdControl?.setValue(currentEmployees[0].id);
        }
      }
    });

    effect(() => {
      const selectedSale = this.saleStore.selectedSale();

      untracked(() => {
        if (selectedSale) {
          while (this.itemsArray.length > 0) {
            this.itemsArray.removeAt(0);
          }

          this.itemsCountSignal.set(0);

          const discountPercent =
            selectedSale.totalAmount > 0
              ? Math.round(
                  (selectedSale.discountAmount / selectedSale.totalAmount) *
                    100,
                )
              : 0;

          this.saleForm.patchValue({
            customerId: selectedSale.customer.id,
            employeeId: selectedSale.employee.id,
            totalAmount: selectedSale.totalAmount,
            taxAmount: selectedSale.taxAmount,
            discountAmount: selectedSale.discountAmount,
            discountPercent: discountPercent,
            finalAmount: selectedSale.finalAmount,
          });

          selectedSale.items.forEach((item) => {
            const itemGroup = this.fb.group({
              productId: [
                { value: item.product.id, disabled: this.viewMode() },
                Validators.required,
              ],
              quantity: [
                { value: item.quantity, disabled: this.viewMode() },
                [Validators.required, Validators.min(1)],
              ],
              unitPrice: [
                item.unitPrice,
                [Validators.required, Validators.min(0)],
              ],
              subtotal: [
                item.subtotal,
                [Validators.required, Validators.min(0)],
              ],
            });

            this.itemsArray.push(itemGroup);
          });

          this.itemsCountSignal.set(this.itemsArray.length);

          this.saleForm.markAsPristine();

          if (this.viewMode()) {
            this.saleForm.disable();
          }
        } else {
          this.saleForm.enable();

          let defaultEmployeeId = null;
          if (
            this.employees().length > 0 &&
            this.saleForm.get('employeeId')?.value
          ) {
            defaultEmployeeId = this.saleForm.get('employeeId')?.value;
          } else if (this.employees().length > 0) {
            defaultEmployeeId = this.employees()[0].id;
          }

          this.saleForm.reset({
            customerId: null,
            employeeId: defaultEmployeeId,
            totalAmount: 0,
            taxAmount: 0,
            discountAmount: 0,
            discountPercent: 0,
            finalAmount: 0,
          });

          this.saleForm.get('totalAmount')?.disable();
          this.saleForm.get('finalAmount')?.disable();

          while (this.itemsArray.length > 0) {
            this.itemsArray.removeAt(0);
          }

          this.itemsCountSignal.set(0);

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

  addItem(): void {
    this.itemsArray.push(
      this.fb.group({
        productId: [null, Validators.required],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [0, [Validators.required, Validators.min(0)]],
        subtotal: [0, [Validators.required, Validators.min(0)]],
      }),
    );
    this.itemsCountSignal.set(this.itemsArray.length);
    this.updateTotals();
    this.saleForm.markAsDirty();
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
      this.itemsCountSignal.set(this.itemsArray.length);
      this.updateTotals();
      this.saleForm.markAsDirty();
    }
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

    const subtotal = quantity * unitPrice;
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

    const taxAmount = Math.round(total * this.IVA_RATE);
    this.saleForm.get('taxAmount')?.setValue(taxAmount);

    this.updateDiscountFromPercentage();
  }

  updateDiscountFromPercentage(): void {
    const totalAmount = this.saleForm.get('totalAmount')?.value ?? 0;
    const discountPercent = this.discountPercentControl.value ?? 0;

    const discountAmount = Math.round((totalAmount * discountPercent) / 100);

    this.saleForm
      .get('discountAmount')
      ?.setValue(discountAmount, { emitEvent: false });

    this.updateFinalAmount();
    this.saleForm.markAsDirty();
  }

  updateFinalAmount(): void {
    const totalAmount = this.saleForm.get('totalAmount')?.value ?? 0;
    const taxAmount = this.saleForm.get('taxAmount')?.value ?? 0;
    const discountAmount = this.saleForm.get('discountAmount')?.value ?? 0;

    const finalAmount = totalAmount + taxAmount - discountAmount;
    this.saleForm.get('finalAmount')?.setValue(finalAmount);
  }

  saveSale(): void {
    const formValue = this.saleForm.getRawValue();
    const saleData: SaleData = {
      totalAmount: formValue.totalAmount,
      taxAmount: formValue.taxAmount,
      discountAmount: formValue.discountAmount,
      finalAmount: formValue.finalAmount,
      customerId: formValue.customerId,
      employeeId: formValue.employeeId,
      items: formValue.items.map(
        (item: {
          productId: number;
          quantity: number;
          unitPrice: number;
          subtotal: number;
        }) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
        }),
      ),
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
