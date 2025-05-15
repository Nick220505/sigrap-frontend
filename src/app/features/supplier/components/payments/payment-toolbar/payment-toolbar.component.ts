import { Component, inject, input } from '@angular/core';
import { PaymentStore } from '@features/supplier/stores/payment.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { PaymentTableComponent } from '../payment-table/payment-table.component';

@Component({
  selector: 'app-payment-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule, DropdownModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template pTemplate="start">
        <p-button
          label="Nuevo Pago"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Registrar nuevo pago"
          tooltipPosition="top"
          (onClick)="paymentStore.openPaymentDialog()"
        />
        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar pagos seleccionados"
          tooltipPosition="top"
          (onClick)="deleteSelectedPayments()"
          [disabled]="paymentTable().selectedPayments().length === 0"
        />
      </ng-template>
      <ng-template pTemplate="end">
        <p-button
          icon="pi pi-download"
          label="Exportar CSV"
          severity="secondary"
          (onClick)="paymentTable().dt().exportCSV()"
          pTooltip="Exportar a CSV"
          tooltipPosition="top"
          [disabled]="paymentStore.paymentsCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class PaymentToolbarComponent {
  readonly paymentStore = inject(PaymentStore);
  private readonly confirmationService = inject(ConfirmationService);
  readonly paymentTable = input.required<PaymentTableComponent>();

  deleteSelectedPayments(): void {
    const selected = this.paymentTable().selectedPayments();
    if (selected.length === 0) return;

    const nonDeletable = selected.filter(
      (p) => p.status !== 'PENDING' && p.status !== 'FAILED',
    );

    if (nonDeletable.length > 0) {
      const nonDeletableInvoices = nonDeletable
        .map((p) => p.invoiceNumber)
        .join(', ');
      this.confirmationService.confirm({
        header: 'Operación no permitida',
        message: `Solo se pueden eliminar pagos en estado Pendiente o Fallido. Los siguientes pagos no se pueden eliminar: ${nonDeletableInvoices}`,
        acceptVisible: false,
        rejectLabel: 'Entendido',
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Eliminar Pagos',
      message: `¿Está seguro de que desea eliminar ${selected.length} ${selected.length === 1 ? 'pago seleccionado' : 'pagos seleccionados'}?`,
      accept: () => {
        const ids = selected.map((p) => p.id);
        this.paymentStore.deleteManyPayments(ids);
        this.paymentTable().selectedPayments.set([]);
      },
    });
  }
}
