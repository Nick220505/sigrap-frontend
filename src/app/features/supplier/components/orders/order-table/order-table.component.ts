import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderInfo } from '@features/supplier/models/purchase-order.model';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-order-table',
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
    CardModule,
    TagModule,
  ],
  template: `
    @let columns =
      [
        { field: 'orderNumber', header: 'ID Pedido' },
        { field: 'orderDate', header: 'Fecha' },
        { field: 'supplier.name', header: 'Proveedor' },
        { field: 'totalAmount', header: 'Total' },
        { field: 'status', header: 'Estado' },
      ];

    <p-table
      #dt
      [value]="purchaseOrderStore.entities()"
      [loading]="purchaseOrderStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} pedidos"
      [globalFilterFields]="['orderNumber', 'supplier.name', 'status']"
      [tableStyle]="{ 'min-width': '70rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedOrders"
      styleClass="p-datatable-gridlines"
    >
      <ng-template pTemplate="caption">
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Pedidos a Proveedores</h5>
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

      <ng-template pTemplate="body" let-order let-columns="columns">
        <tr>
          <td style="width: 3rem">
            <p-tableCheckbox [value]="order" />
          </td>

          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'totalAmount') {
                {{ order[column.field] | currency: 'COP' : '$' : '1.0-0' }}
              } @else if (column.field === 'supplier.name') {
                {{ order.supplier?.name || 'Sin proveedor' }}
              } @else if (column.field === 'orderDate') {
                {{ order[column.field] | date: 'dd/MM/yyyy' }}
              } @else if (column.field === 'status') {
                <p-tag
                  [severity]="getStatusSeverity(order[column.field])"
                  [value]="formatStatus(order[column.field])"
                />
              } @else {
                {{ order[column.field] }}
              }
            </td>
          }

          <td>
            <div class="flex gap-1 justify-center">
              <p-button
                icon="pi pi-eye"
                styleClass="p-button-rounded p-button-text"
                pTooltip="Ver detalles"
                tooltipPosition="top"
                [disabled]="purchaseOrderStore.loading()"
              />
              <p-button
                icon="pi pi-pencil"
                styleClass="p-button-rounded p-button-text"
                pTooltip="Editar pedido"
                tooltipPosition="top"
                (click)="purchaseOrderStore.openOrderDialog(order)"
                [disabled]="purchaseOrderStore.loading()"
              />
              <p-button
                icon="pi pi-trash"
                styleClass="p-button-rounded p-button-text p-button-danger"
                pTooltip="Eliminar pedido"
                tooltipPosition="top"
                (click)="deleteOrder(order)"
                [disabled]="
                  purchaseOrderStore.loading() || order.status !== 'DRAFT'
                "
              />
            </div>
          </td>
        </tr>
      </ng-template>

      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (purchaseOrderStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar pedidos:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="purchaseOrderStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="purchaseOrderStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron pedidos.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class OrderTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly purchaseOrderStore = inject(PurchaseOrderStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedOrders = signal<PurchaseOrderInfo[]>([]);

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteOrder({ id, orderNumber }: PurchaseOrderInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar pedido',
      message: `¿Está seguro de que desea eliminar el pedido <b>${orderNumber}</b>?`,
      accept: () => this.purchaseOrderStore.delete(id),
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
      case 'CONFIRMED':
        return 'info';
      case 'DRAFT':
      case 'SUBMITTED':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'info';
    }
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'DELIVERED':
        return 'Entregado';
      case 'SHIPPED':
        return 'Enviado';
      case 'CONFIRMED':
        return 'Confirmado';
      case 'DRAFT':
        return 'Borrador';
      case 'SUBMITTED':
        return 'Enviado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
