import { Component, computed, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PaymentData } from '@features/supplier/models/payment.model';
import { FilterOrdersBySupplierPipe } from '@features/supplier/pipes/filter-orders-by-supplier.pipe';
import { PaymentStore } from '@features/supplier/stores/payment.store';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order.store';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-payment-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputNumberModule,
    DropdownModule,
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
            styleClass="w-full"
          />
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
    amount: [null, [Validators.required, Validators.min(0.01)]],
  });

  readonly isFormDisabled = computed(() => {
    return this.paymentStore.viewOnly();
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
          });
        } else {
          this.paymentForm.reset({
            id: null,
            supplierId: null,
            purchaseOrderId: null,
            amount: null,
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
      amount: formValue.amount,
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
