import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentInfo } from '@features/supplier/models/payment.model';
import { PaymentStore } from '@features/supplier/stores/payment.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
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
  ],
  template: `
    @let columns =
      [
        { field: 'purchaseOrderNumber', header: 'Pedido' },
        { field: 'supplierName', header: 'Proveedor' },
        { field: 'amount', header: 'Monto' },
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
      [globalFilterFields]="['purchaseOrderNumber', 'supplierName']"
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
        <tr>
          <td style="width: 3rem"><p-tableCheckbox [value]="payment" /></td>
          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'amount') {
                {{ payment[column.field] | currency: 'COP' : 'S/' : '1.0-0' }}
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
                pTooltip="Editar pago"
                tooltipPosition="top"
              />
              <p-button
                icon="pi pi-trash"
                styleClass="p-button-rounded p-button-outlined"
                severity="danger"
                (click)="deletePayment(payment)"
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

  deletePayment({ id, purchaseOrderNumber }: PaymentInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar Pago',
      message: `¿Está seguro de que desea eliminar el pago ${purchaseOrderNumber ? 'para el pedido ' + purchaseOrderNumber : ''}?`,
      accept: () => this.paymentStore.deletePayment(id),
    });
  }
}
