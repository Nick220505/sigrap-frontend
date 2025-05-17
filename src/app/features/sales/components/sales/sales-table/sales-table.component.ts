import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import {
  PaymentMethod,
  SaleInfo,
  SaleStatus,
} from '../../../models/sale.model';
import { SaleStore } from '../../../stores/sale.store';

@Component({
  selector: 'app-sales-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    MessageModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
  ],
  template: `
    @let columns =
      [
        { field: 'id', header: 'ID Venta' },
        { field: 'customer', header: 'Cliente' },
        { field: 'finalAmount', header: 'Monto' },
        { field: 'paymentMethod', header: 'Método de Pago' },
        { field: 'status', header: 'Estado' },
        { field: 'createdAt', header: 'Fecha' },
      ];

    <p-table
      #dt
      [value]="saleStore.entities()"
      [loading]="saleStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} ventas"
      [globalFilterFields]="[
        'id',
        'customer.firstName',
        'customer.lastName',
        'status',
      ]"
      [tableStyle]="{ 'min-width': '85rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedSales"
    >
      <ng-template pTemplate="caption">
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Registro de Ventas</h5>
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
                placeholder="Buscar..."
                class="w-full"
              />
            </p-iconfield>
          </div>
        </div>
      </ng-template>

      <ng-template pTemplate="header">
        <tr>
          <th style="width: 3rem">
            <p-tableHeaderCheckbox />
          </th>

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

      <ng-template pTemplate="body" let-sale let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="sale" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @switch (column.field) {
                @case ('customer') {
                  {{
                    sale.customer
                      ? sale.customer.firstName + ' ' + sale.customer.lastName
                      : 'Cliente no registrado'
                  }}
                }
                @case ('finalAmount') {
                  {{ sale.finalAmount | currency: 'USD' : 'symbol' : '1.2-2' }}
                }
                @case ('paymentMethod') {
                  <span
                    class="px-2 py-1 rounded-full text-sm"
                    [class]="getPaymentMethodClass(sale.paymentMethod)"
                  >
                    {{ getPaymentMethodLabel(sale.paymentMethod) }}
                  </span>
                }
                @case ('status') {
                  <span
                    class="px-2 py-1 rounded-full text-sm"
                    [class]="getStatusClass(sale.status)"
                  >
                    {{ getStatusLabel(sale.status) }}
                  </span>
                }
                @case ('createdAt') {
                  {{ sale.createdAt | date: 'dd/MM/yyyy HH:mm' : 'UTC-5' }}
                }
                @default {
                  {{ sale[column.field] }}
                }
              }
            </td>
          }

          <td>
            <div class="flex gap-2">
              <p-button
                icon="pi pi-eye"
                class="mr-2"
                rounded
                outlined
                (click)="saleStore.openSaleDialog(sale)"
                pTooltip="Ver detalles"
                tooltipPosition="top"
              />

              @if (
                sale.status !== SaleStatus.CANCELLED &&
                sale.status !== SaleStatus.RETURNED
              ) {
                <p-button
                  icon="pi pi-times"
                  severity="danger"
                  rounded
                  outlined
                  (click)="cancelSale(sale)"
                  pTooltip="Cancelar venta"
                  tooltipPosition="top"
                />
              }

              @if (sale.status === SaleStatus.COMPLETED) {
                <p-button
                  icon="pi pi-refresh"
                  severity="warn"
                  rounded
                  outlined
                  (click)="returnSale(sale)"
                  pTooltip="Registrar devolución"
                  tooltipPosition="top"
                />
              }

              <p-button
                icon="pi pi-trash"
                severity="danger"
                rounded
                outlined
                (click)="deleteSale(sale)"
                pTooltip="Eliminar venta"
                tooltipPosition="top"
                [disabled]="saleStore.loading()"
              />
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (saleStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar ventas:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="saleStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="saleStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron ventas.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class SalesTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly saleStore = inject(SaleStore);
  readonly SaleStatus = SaleStatus;

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedSales = linkedSignal<SaleInfo[], SaleInfo[]>({
    source: this.saleStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map((sale) => sale.id));
      return prevSelected.filter((sale) => entityIds.has(sale.id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteSale(sale: SaleInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar venta',
      message: `¿Está seguro de que desea eliminar la venta #<b>${sale.id}</b>?`,
      accept: () => this.saleStore.delete(sale.id),
    });
  }

  cancelSale(sale: SaleInfo): void {
    this.confirmationService.confirm({
      header: 'Cancelar venta',
      message: `¿Está seguro de que desea cancelar la venta #<b>${sale.id}</b>?`,
      accept: () => this.saleStore.cancelSale(sale.id),
    });
  }

  returnSale(sale: SaleInfo): void {
    this.confirmationService.confirm({
      header: 'Registrar devolución',
      message: `¿Está seguro de que desea registrar la devolución de la venta #<b>${sale.id}</b>?`,
      accept: () => {
        this.confirmationService.confirm({
          header: 'Tipo de devolución',
          message: '¿Desea registrar una devolución total o parcial?',
          acceptLabel: 'Devolución Total',
          rejectLabel: 'Devolución Parcial',
          accept: () =>
            this.saleStore.returnSale({ id: sale.id, fullReturn: true }),
          reject: () =>
            this.saleStore.returnSale({ id: sale.id, fullReturn: false }),
        });
      },
    });
  }

  getStatusClass(status: SaleStatus): string {
    switch (status) {
      case SaleStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case SaleStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case SaleStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case SaleStatus.RETURNED:
        return 'bg-orange-100 text-orange-800';
      case SaleStatus.PARTIALLY_RETURNED:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: SaleStatus): string {
    switch (status) {
      case SaleStatus.COMPLETED:
        return 'Completada';
      case SaleStatus.IN_PROGRESS:
        return 'En Progreso';
      case SaleStatus.CANCELLED:
        return 'Cancelada';
      case SaleStatus.RETURNED:
        return 'Devuelta';
      case SaleStatus.PARTIALLY_RETURNED:
        return 'Devuelta Parcialmente';
      default:
        return status;
    }
  }

  getPaymentMethodClass(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CASH:
        return 'bg-green-100 text-green-800';
      case PaymentMethod.CREDIT_CARD:
        return 'bg-blue-100 text-blue-800';
      case PaymentMethod.DEBIT_CARD:
        return 'bg-purple-100 text-purple-800';
      case PaymentMethod.BANK_TRANSFER:
        return 'bg-indigo-100 text-indigo-800';
      case PaymentMethod.MOBILE_PAYMENT:
        return 'bg-cyan-100 text-cyan-800';
      case PaymentMethod.OTHER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Efectivo';
      case PaymentMethod.CREDIT_CARD:
        return 'Tarjeta de Crédito';
      case PaymentMethod.DEBIT_CARD:
        return 'Tarjeta de Débito';
      case PaymentMethod.BANK_TRANSFER:
        return 'Transferencia Bancaria';
      case PaymentMethod.MOBILE_PAYMENT:
        return 'Pago Móvil';
      case PaymentMethod.OTHER:
        return 'Otro';
      default:
        return method;
    }
  }
}
