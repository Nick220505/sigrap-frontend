import { Component, inject, input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PurchaseOrderStore } from '@features/supplier/stores/purchase-order-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { OrderTable } from '../order-table/order-table';

@Component({
  selector: 'app-order-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule, TranslateModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template pTemplate="start">
        <p-button
          [label]="'suppliers.orders.newOrder' | translate"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          [pTooltip]="'suppliers.tooltips.createOrder' | translate"
          tooltipPosition="top"
          (onClick)="purchaseOrderStore.openOrderDialog()"
        />

        <p-button
          severity="danger"
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          outlined
          [pTooltip]="'suppliers.tooltips.deleteOrders' | translate"
          tooltipPosition="top"
          (onClick)="deleteSelectedOrders()"
          [disabled]="orderTable().selectedOrders().length === 0"
        />
      </ng-template>

      <ng-template pTemplate="end">
        <p-button
          [label]="'suppliers.orders.exportButton' | translate"
          icon="pi pi-download"
          severity="secondary"
          [pTooltip]="'suppliers.tooltips.exportOrders' | translate"
          tooltipPosition="top"
          (onClick)="orderTable().dt().exportCSV()"
          [disabled]="purchaseOrderStore.ordersCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class OrderToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translateService = inject(TranslateService);
  readonly purchaseOrderStore = inject(PurchaseOrderStore);

  readonly orderTable = input.required<OrderTable>();

  deleteSelectedOrders(): void {
    const orders = this.orderTable().selectedOrders();

    const nonDraftOrders = orders.filter((order) => order.status !== 'DRAFT');
    if (nonDraftOrders.length > 0) {
      this.confirmationService.confirm({
        header: this.translateService.instant('common.confirmations.operationNotAllowedHeader'),
        message: this.translateService.instant('common.confirmations.draftOnlyMessage'),
        acceptVisible: false,
        rejectLabel: this.translateService.instant('common.confirmations.understood'),
      });
      return;
    }

    this.confirmationService.confirm({
      header: this.translateService.instant('common.confirmations.deleteHeaderPlural', { items: 'orders' }),
      message: `
          ${this.translateService.instant('common.confirmations.deleteMessagePlural', { count: orders.length, items: 'orders' })}
          <ul class='mt-2 mb-0'>
            ${orders.map(({ id }) => `<li>• <b>${this.translateService.instant('common.orderNumber', { id })}</b></li>`).join('')}
          </ul>
        `,
      accept: () => {
        const ids = orders.map(({ id }) => id);
        this.purchaseOrderStore.deleteAllById(ids);
      },
    });
  }
}
