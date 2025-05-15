import { Component, computed, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  PAYMENT_METHOD_ES,
  PAYMENT_STATUS_ES,
  PaymentData,
  PaymentMethod,
  PaymentStatus,
} from '@features/supplier/models/payment.model';
import { FilterOrdersBySupplierPipe } from '@features/supplier/pipes/filter-orders-by-supplier.pipe';
import { PaymentStore } from '@features/supplier/stores/payment.store';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order.store';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-payment-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputNumberModule,
    DatePickerModule,
    DropdownModule,
    TextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
    FilterOrdersBySupplierPipe,
  ],
  template: `
    <p-dialog
      [visible]="paymentStore.isDialogVisible()"
      (visibleChange)="paymentStore.closePaymentDialog()"
      [style]="{ width: '600px' }"
      [header]="dialogHeader()"
      modal
    >
      <form [formGroup]="paymentForm" class="flex flex-col gap-4 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="supplierId" class="font-bold">Proveedor</label>
            <p-dropdown
              id="supplierId"
              formControlName="supplierId"
              [options]="supplierStore.entities()"
              optionLabel="name"
              optionValue="id"
              placeholder="Seleccione un proveedor"
              filter
              filterBy="name"
              [showClear]="true"
              styleClass="w-full"
              (onChange)="onSupplierChange($event.value)"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="purchaseOrderId" class="font-bold"
              >Pedido (Opcional)</label
            >
            <p-dropdown
              id="purchaseOrderId"
              formControlName="purchaseOrderId"
              [options]="
                purchaseOrderStore.entities()
                  | filterOrdersBySupplier: paymentForm.get('supplierId')?.value
              "
              optionLabel="orderNumber"
              optionValue="id"
              placeholder="Seleccione un pedido"
              filter
              filterBy="orderNumber"
              [showClear]="true"
              styleClass="w-full"
              [disabled]="!paymentForm.get('supplierId')?.value"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="invoiceNumber" class="font-bold">Nº Factura</label>
            <p-inputgroup>
              <p-inputgroup-addon
                ><i class="pi pi-file-text"></i
              ></p-inputgroup-addon>
              <input
                id="invoiceNumber"
                pInputText
                formControlName="invoiceNumber"
              />
            </p-inputgroup>
          </div>
          <div class="flex flex-col gap-2">
            <label for="amount" class="font-bold">Monto</label>
            <p-inputNumber
              id="amount"
              formControlName="amount"
              mode="currency"
              currency="COP"
              locale="es-CO"
              [minFractionDigits]="0"
              [maxFractionDigits]="0"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="dueDate" class="font-bold">Fecha Vencimiento</label>
            <p-datePicker
              id="dueDate"
              formControlName="dueDate"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              styleClass="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="paymentDate" class="font-bold"
              >Fecha Pago (Opcional)</label
            >
            <p-datePicker
              id="paymentDate"
              formControlName="paymentDate"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              styleClass="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label for="paymentMethod" class="font-bold">Método de Pago</label>
            <p-dropdown
              id="paymentMethod"
              formControlName="paymentMethod"
              [options]="paymentMethodOptions"
              placeholder="Seleccione un método"
              styleClass="w-full"
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="status" class="font-bold">Estado</label>
            <p-dropdown
              id="status"
              formControlName="status"
              [options]="paymentStatusOptions"
              placeholder="Seleccione un estado"
              styleClass="w-full"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label for="transactionId" class="font-bold"
            >ID Transacción (Opcional)</label
          >
          <p-inputgroup>
            <p-inputgroup-addon
              ><i class="pi pi-hashtag"></i
            ></p-inputgroup-addon>
            <input
              id="transactionId"
              pInputText
              formControlName="transactionId"
            />
          </p-inputgroup>
        </div>

        <div class="flex flex-col gap-2">
          <label for="notes" class="font-bold">Notas (Opcional)</label>
          <p-inputgroup>
            <p-inputgroup-addon
              ><i class="pi pi-align-left"></i
            ></p-inputgroup-addon>
            <textarea
              id="notes"
              pTextarea
              formControlName="notes"
              rows="3"
              class="w-full"
            ></textarea>
          </p-inputgroup>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          [label]="paymentStore.viewOnly() ? 'Cerrar' : 'Cancelar'"
          icon="pi pi-times"
          text
          (click)="paymentStore.closePaymentDialog()"
        />
        @if (!paymentStore.viewOnly()) {
          <p-button
            label="Guardar"
            icon="pi pi-check"
            (click)="savePayment()"
            [disabled]="
              paymentStore.isLoading() ||
              paymentForm.invalid ||
              isFormDisabled()
            "
          />
        }
      </ng-template>
    </p-dialog>
  `,
})
export class PaymentDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly paymentStore = inject(PaymentStore);
  readonly supplierStore = inject(SupplierStore);
  readonly purchaseOrderStore = inject(PurchaseOrderStore);

  readonly paymentForm: FormGroup = this.fb.group({
    id: [null],
    supplierId: [null, Validators.required],
    purchaseOrderId: [null],
    invoiceNumber: ['', Validators.required],
    amount: [null, [Validators.required, Validators.min(0.01)]],
    dueDate: [null, Validators.required],
    paymentDate: [null],
    paymentMethod: [PaymentMethod.BANK_TRANSFER, Validators.required],
    status: [PaymentStatus.PENDING, Validators.required],
    transactionId: [''],
    notes: [''],
  });

  readonly paymentMethodOptions = Object.values(PaymentMethod).map(
    (method) => ({
      label: PAYMENT_METHOD_ES[method] || method,
      value: method,
    }),
  );

  readonly paymentStatusOptions = Object.values(PaymentStatus).map(
    (status) => ({
      label: PAYMENT_STATUS_ES[status] || status,
      value: status,
    }),
  );

  readonly isFormDisabled = computed(() => {
    const payment = this.paymentStore
      .entities()
      .find((p) => p.id === this.paymentStore.selectedPaymentId());
    return (
      this.paymentStore.viewOnly() ||
      (!!payment &&
        (payment.status === PaymentStatus.COMPLETED ||
          payment.status === PaymentStatus.CANCELLED))
    );
  });

  readonly dialogHeader = computed(() => {
    if (this.paymentStore.viewOnly()) {
      return 'Ver Pago';
    }
    return this.paymentStore.selectedPaymentId() ? 'Editar Pago' : 'Crear Pago';
  });

  constructor() {
    effect(() => {
      const selectedPaymentId = this.paymentStore.selectedPaymentId();
      const payment =
        this.paymentStore.entities().find((p) => p.id === selectedPaymentId) ??
        null;
      const disableForm = this.isFormDisabled();

      untracked(() => {
        if (payment) {
          this.paymentForm.patchValue({
            ...payment,
            supplierId: payment.supplierId,
            purchaseOrderId: payment.purchaseOrderId,
            dueDate: payment.dueDate ? new Date(payment.dueDate) : null,
            paymentDate: payment.paymentDate
              ? new Date(payment.paymentDate)
              : null,
          });
        } else {
          this.paymentForm.reset({
            id: null,
            supplierId: null,
            purchaseOrderId: null,
            invoiceNumber: '',
            amount: null,
            dueDate: null,
            paymentDate: null,
            paymentMethod: PaymentMethod.BANK_TRANSFER,
            status: PaymentStatus.PENDING,
            transactionId: '',
            notes: '',
          });
        }

        if (disableForm) {
          this.paymentForm.disable();
        } else {
          this.paymentForm.enable();
        }
      });
    });
  }

  onSupplierChange(supplierId: number | null): void {
    if (!supplierId) {
      this.paymentForm.get('purchaseOrderId')?.reset();
      this.paymentForm.get('purchaseOrderId')?.disable();
    } else {
      this.paymentForm.get('purchaseOrderId')?.enable();
      this.purchaseOrderStore.findBySupplierId(supplierId);
    }
  }

  savePayment(): void {
    if (this.paymentForm.invalid) return;

    const formValue = this.isFormDisabled()
      ? this.paymentForm.getRawValue()
      : this.paymentForm.value;

    const paymentData: PaymentData = {
      supplierId: formValue.supplierId,
      purchaseOrderId: formValue.purchaseOrderId ?? undefined,
      invoiceNumber: formValue.invoiceNumber,
      amount: formValue.amount,
      dueDate: formValue.dueDate
        ? new Date(formValue.dueDate).toISOString().split('T')[0]
        : undefined!,
      paymentDate: formValue.paymentDate
        ? new Date(formValue.paymentDate).toISOString().split('T')[0]
        : undefined,
      paymentMethod: formValue.paymentMethod,
      status: formValue.status,
      transactionId: formValue.transactionId ?? undefined,
      notes: formValue.notes ?? undefined,
    };

    const paymentId = this.paymentStore.selectedPaymentId();

    if (paymentId) {
      this.paymentStore.updatePayment({ id: paymentId, paymentData });
    } else {
      this.paymentStore.createPayment(paymentData);
    }
    this.paymentStore.closePaymentDialog();
  }
}
