import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  PAYMENT_STATUS_ES,
  PaymentInfo,
} from '@features/supplier/models/payment.model';
import { PaymentStore } from '@features/supplier/stores/payment.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-payment-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    MessageModule,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    TagModule,
  ],
  template: `
    @let columns =
      [
        { field: 'invoiceNumber', header: 'Factura' },
        { field: 'supplierName', header: 'Proveedor' },
        { field: 'paymentDate', header: 'Fecha Pago' },
        { field: 'dueDate', header: 'Fecha Vencimiento' },
        { field: 'amount', header: 'Monto' },
        { field: 'status', header: 'Estado' },
      ];

    <p-table
      #dt
      [value]="paymentStore.entities()"
      [loading]="paymentStore.isLoading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pagos"
      [globalFilterFields]="['invoiceNumber', 'supplierName', 'status']"
      [tableStyle]="{ 'min-width': '60rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedPayments"
      styleClass="p-datatable-gridlines"
    >
      <ng-template pTemplate="caption">
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Pagos Programados</h5>
          </div>
          <div class="flex items-center w-full sm:w-auto">
            <p-iconfield class="w-full">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input
                pInputText
                type="text"
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                [(ngModel)]="searchValue"
                placeholder="Buscar pago..."
                class="w-full"
              />
            </p-iconfield>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="header">
        <tr>
          <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
          @for (column of columns; track column.field) {
            <th pSortableColumn="{{ column.field }}">
              <div class="flex items-center gap-2">
                <span>{{ column.header }}</span>
                <p-sortIcon field="{{ column.field }}" />
                <p-columnFilter
                  type="text"
                  field="{{ column.field }}"
                  display="menu"
                  class="ml-auto"
                  placeholder="Filtrar por {{ column.header.toLowerCase() }}"
                  pTooltip="Filtrar por {{ column.header.toLowerCase() }}"
                  tooltipPosition="top"
                />
              </div>
            </th>
          }
          <th>
            <div class="flex items-center gap-2">
              <span>Acciones</span>
              <button
                type="button"
                pButton
                icon="pi pi-filter-slash"
                class="p-button-rounded p-button-text p-button-secondary"
                pTooltip="Limpiar todos los filtros"
                tooltipPosition="top"
                (click)="clearAllFilters()"
                aria-label="Limpiar todos los filtros"
              ></button>
            </div>
          </th>
        </tr>
      </ng-template>

      <ng-template pTemplate="body" let-payment let-columns="columns">
        <tr [class.bg-red-50]="payment.status === 'OVERDUE'">
          <td style="width: 3rem"><p-tableCheckbox [value]="payment" /></td>
          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'amount') {
                {{ payment[column.field] | currency: 'COP' : 'S/' : '1.0-0' }}
              } @else if (
                column.field === 'paymentDate' || column.field === 'dueDate'
              ) {
                {{ payment[column.field] | date: 'dd/MM/yyyy' }}
              } @else if (column.field === 'status') {
                <p-tag
                  [severity]="getStatusSeverity(payment.status)"
                  [value]="formatStatus(payment.status)"
                />
              } @else {
                {{ payment[column.field] || '-' }}
              }
            </td>
          }
          <td>
            <div class="flex gap-2 justify-center">
              <p-button
                icon="pi pi-eye"
                styleClass="p-button-rounded p-button-outlined"
                severity="success"
                (click)="viewPayment(payment)"
                pTooltip="Ver detalles"
                tooltipPosition="top"
              />
              <p-button
                icon="pi pi-pencil"
                styleClass="p-button-rounded p-button-outlined"
                severity="info"
                (click)="editPayment(payment)"
                [disabled]="
                  payment.status === 'COMPLETED' ||
                  payment.status === 'CANCELLED'
                "
                pTooltip="Editar pago"
                tooltipPosition="top"
              />
              <p-button
                icon="pi pi-dollar"
                styleClass="p-button-rounded p-button-outlined"
                severity="success"
                (click)="markAsCompleted(payment)"
                [disabled]="
                  payment.status === 'COMPLETED' ||
                  payment.status === 'CANCELLED'
                "
                pTooltip="Marcar como Pagado"
                tooltipPosition="top"
              />
              <p-button
                icon="pi pi-trash"
                styleClass="p-button-rounded p-button-outlined"
                severity="danger"
                (click)="deletePayment(payment)"
                [disabled]="payment.status === 'COMPLETED'"
                pTooltip="Eliminar pago"
                tooltipPosition="top"
              />
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (paymentStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar pagos:</strong>
                    <p>{{ error.message }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="paymentStore.loadPayments()"
                        styleClass="p-button-sm"
                        [loading]="paymentStore.isLoading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron pagos.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class PaymentTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly paymentStore = inject(PaymentStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedPayments = signal<PaymentInfo[]>([]);

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  viewPayment(payment: PaymentInfo): void {
    this.paymentStore.openPaymentDialog(payment, true);
  }

  editPayment(payment: PaymentInfo): void {
    this.paymentStore.openPaymentDialog(payment, false);
  }

  markAsCompleted(payment: PaymentInfo): void {
    this.confirmationService.confirm({
      header: 'Confirmar Pago',
      message: `¿Está seguro de que desea marcar la factura <b>${payment.invoiceNumber}</b> como pagada?`,
      accept: () => this.paymentStore.markAsCompleted(payment.id),
    });
  }

  deletePayment({ id, invoiceNumber }: PaymentInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar Pago',
      message: `¿Está seguro de que desea eliminar el pago de la factura <b>${invoiceNumber}</b>?`,
      accept: () => this.paymentStore.deletePayment(id),
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'info';
      case 'PROCESSING':
        return 'warning';
      case 'OVERDUE':
        return 'danger';
      case 'FAILED':
      case 'CANCELLED':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  formatStatus(status: string): string {
    return PAYMENT_STATUS_ES[status] || status;
  }
}
