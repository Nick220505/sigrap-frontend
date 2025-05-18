import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SaleReturnInfo } from '@features/sales/models/sale-return.model';
import { SaleReturnStore } from '@features/sales/stores/sale-return.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sales-returns-table',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    DatePipe,
    CurrencyPipe,
    MessageModule,
  ],
  template: `
    @let columns =
      [
        { field: 'id', header: 'ID' },
        { field: 'originalSaleId', header: 'Venta Original' },
        { field: 'customer', header: 'Cliente' },
        { field: 'employee', header: 'Empleado' },
        { field: 'totalReturnAmount', header: 'Monto' },
        { field: 'reason', header: 'Razón' },
        { field: 'createdAt', header: 'Fecha' },
      ];
    <p-table
      #dt
      [value]="saleReturnStore.entities()"
      [(selection)]="selectedSaleReturns"
      dataKey="id"
      [rows]="10"
      [paginator]="true"
      [rowsPerPageOptions]="[10, 25, 50]"
      [globalFilterFields]="[
        'id',
        'originalSaleId',
        'customer.fullName',
        'employee.name',
        'totalReturnAmount',
        'reason',
        'createdAt',
      ]"
      paginatorPosition="bottom"
      [tableStyle]="{ 'min-width': '85rem' }"
      [rowHover]="true"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} devoluciones"
      styleClass="p-datatable-sm p-datatable-striped"
      [loading]="saleReturnStore.loading()"
    >
      <ng-template pTemplate="caption">
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Administrar Devoluciones</h5>
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

      <ng-template pTemplate="body" let-saleReturn>
        <tr [pSelectableRow]="saleReturn">
          <td style="width: 3rem">
            <p-tableCheckbox [value]="saleReturn" />
          </td>
          <td>{{ saleReturn.id }}</td>
          <td>#{{ saleReturn.originalSaleId }}</td>
          <td>{{ saleReturn.customer?.fullName }}</td>
          <td>{{ saleReturn.employee?.name }}</td>
          <td>
            {{ saleReturn.totalReturnAmount | currency: 'COP' : '$' : '1.0-0' }}
          </td>
          <td>
            <span
              [pTooltip]="saleReturn.reason"
              tooltipPosition="top"
              class="truncate"
            >
              {{ saleReturn.reason | slice: 0 : 30
              }}{{ saleReturn.reason?.length > 30 ? '...' : '' }}
            </span>
          </td>
          <td>{{ saleReturn.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
          <td>
            <p-button
              icon="pi pi-eye"
              rounded
              outlined
              class="mr-2"
              pTooltip="Ver Detalles"
              tooltipPosition="top"
              (onClick)="saleReturnStore.openReturnDialog(saleReturn)"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              pTooltip="Eliminar Devolución"
              tooltipPosition="top"
              (onClick)="deleteSaleReturn(saleReturn)"
              [disabled]="saleReturnStore.loading()"
            />
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (saleReturnStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar devoluciones:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="saleReturnStore.loadAll()"
                        styleClass="p-button-sm"
                        [loading]="saleReturnStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron devoluciones.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class SalesReturnsTableComponent {
  readonly saleReturnStore = inject(SaleReturnStore);
  private readonly confirmationService = inject(ConfirmationService);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedSaleReturns = linkedSignal<
    SaleReturnInfo[],
    SaleReturnInfo[]
  >({
    source: this.saleReturnStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }) => id));
      return prevSelected.filter(({ id }) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteSaleReturn(saleReturn: SaleReturnInfo): void {
    this.confirmationService.confirm({
      header: 'Eliminar devolución',
      message: `¿Está seguro de que desea eliminar la devolución #<b>${saleReturn.id}</b>?`,
      accept: () => this.saleReturnStore.deleteById(saleReturn.id),
    });
  }
}
