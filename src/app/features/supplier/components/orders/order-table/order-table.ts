import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderInfo } from '@features/supplier/models/purchase-order.model';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order-store';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
    TranslateModule,
  ],
  template: `
    @let columns =
      [
        { field: 'id', header: ('common.tableHeaders.id' | translate) },
        { field: 'createdAt', header: ('common.tableHeaders.createdDate' | translate) },
        { field: 'deliveryDate', header: ('common.tableHeaders.deliveryDate' | translate) },
        { field: 'supplier.name', header: ('common.tableHeaders.supplier' | translate) },
        { field: 'totalAmount', header: ('common.tableHeaders.total' | translate) },
        { field: 'status', header: ('common.tableHeaders.status' | translate) },
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
      [currentPageReportTemplate]="'common.pagination.showingOrders' | translate"
      [globalFilterFields]="['id', 'supplier.name', 'status']"
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
            <h5 class="m-0 text-left">{{ 'common.tableTitles.purchaseOrders' | translate }}</h5>
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
                [placeholder]="'common.searchPlaceholder' | translate"
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
                  [placeholder]="'common.filterBy' | translate: {field: column.header.toLowerCase()}"
                  [pTooltip]="'common.filterBy' | translate: {field: column.header.toLowerCase()}"
                  tooltipPosition="top"
                />
              </div>
            </th>
          }

          <th>
            <div class="flex items-center gap-2">
              <span>{{ 'common.actions' | translate }}</span>
              <button
                type="button"
                pButton
                icon="pi pi-filter-slash"
                class="p-button-rounded p-button-text p-button-secondary"
                [pTooltip]="'common.clearAllFilters' | translate"
                tooltipPosition="top"
                (click)="clearAllFilters()"
                [attr.aria-label]="'common.clearAllFilters' | translate"
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
                {{
                  order[column.field]
                    | currency: undefined : undefined : '1.0-0'
                }}
              } @else if (column.field === 'supplier.name') {
                {{ order.supplier?.name || ('common.noSupplier' | translate) }}
              } @else if (column.field === 'createdAt') {
                {{ order[column.field] | date: 'dd/MM/yyyy' }}
              } @else if (column.field === 'deliveryDate') {
                {{ order[column.field] | date: 'dd/MM/yyyy' }}
              } @else if (column.field === 'status') {
                @switch (order[column.field]) {
                  @case ('DELIVERED') {
                    <p-tag severity="success" [value]="'common.statuses.delivered' | translate" />
                  }
                  @case ('SHIPPED') {
                    <p-tag severity="info" [value]="'common.statuses.shipped' | translate" />
                  }
                  @case ('CONFIRMED') {
                    <p-tag severity="info" [value]="'common.statuses.confirmed' | translate" />
                  }
                  @case ('DRAFT') {
                    <p-tag severity="warn" [value]="'common.statuses.draft' | translate" />
                  }
                  @case ('SUBMITTED') {
                    <p-tag severity="warn" [value]="'common.statuses.submitted' | translate" />
                  }
                  @case ('CANCELLED') {
                    <p-tag severity="danger" [value]="'common.statuses.cancelled' | translate" />
                  }
                  @default {
                    <p-tag severity="info" value="{{ order[column.field] }}" />
                  }
                }
              } @else {
                {{ order[column.field] }}
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-eye"
              severity="success"
              rounded
              outlined
              class="mr-2"
              [pTooltip]="'suppliers.tooltips.viewDetails' | translate"
              tooltipPosition="top"
              (click)="purchaseOrderStore.openOrderDialog(order, true)"
              [disabled]="purchaseOrderStore.loading()"
            />
            <p-button
              icon="pi pi-pencil"
              rounded
              outlined
              class="mr-2"
              [pTooltip]="'suppliers.tooltips.editOrder' | translate"
              tooltipPosition="top"
              (click)="purchaseOrderStore.openOrderDialog(order, false)"
              [disabled]="purchaseOrderStore.loading()"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              [pTooltip]="'suppliers.tooltips.deleteOrder' | translate"
              tooltipPosition="top"
              (click)="deleteOrder(order)"
              [disabled]="
                purchaseOrderStore.loading() || order.status !== 'DRAFT'
              "
            />
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
                    <strong>{{ 'common.errors.errorLoadingOrders' | translate }}</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        [label]="'common.retry' | translate"
                        (onClick)="purchaseOrderStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="purchaseOrderStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>{{ 'common.emptyStates.noOrdersFound' | translate }}</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class OrderTable {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translateService = inject(TranslateService);
  readonly purchaseOrderStore = inject(PurchaseOrderStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedOrders = signal<PurchaseOrderInfo[]>([]);

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteOrder({ id }: PurchaseOrderInfo): void {
    this.confirmationService.confirm({
      header: this.translateService.instant('common.confirmations.deleteHeader', { item: 'order' }),
      message: this.translateService.instant('common.confirmations.deleteMessage', { item: 'order', name: `#${id}` }),
      accept: () => this.purchaseOrderStore.delete(id),
    });
  }
}
