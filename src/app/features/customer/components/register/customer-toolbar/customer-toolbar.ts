import { Component, inject, input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CustomerInfo } from '@features/customer/models/customer.model';
import { CustomerStore } from '@features/customer/stores/customer-store';
import { CustomerTable } from '../customer-table/customer-table';

@Component({
  selector: 'app-customer-toolbar',
  imports: [ButtonModule, ToolbarModule, TooltipModule, TranslateModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button
          [label]="'customers.newButton' | translate"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          [pTooltip]="'customers.createNewCustomer' | translate"
          tooltipPosition="top"
          (onClick)="customerStore.openCustomerDialog()"
        />

        <p-button
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          severity="danger"
          outlined
          [pTooltip]="'customers.deleteSelectedCustomers' | translate"
          tooltipPosition="top"
          [disabled]="customerTable().selectedCustomers().length === 0"
          (onClick)="deleteSelectedCustomers()"
          class="mr-2"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          [label]="'customers.exportButton' | translate"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="customerTable().dt().exportCSV()"
          [disabled]="customerStore.entities().length === 0"
          [pTooltip]="'customers.exportCustomersToCSV' | translate"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class CustomerToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translateService = inject(TranslateService);
  readonly customerStore = inject(CustomerStore);
  readonly customerTable = input.required<CustomerTable>();

  deleteSelectedCustomers(): void {
    const customers = this.customerTable().selectedCustomers();
    this.confirmationService.confirm({
      header: this.translateService.instant('customers.confirmDelete.headerMultiple'),
      message: `
        ${this.translateService.instant('customers.confirmDelete.messageMultiple', { count: customers.length })}
        <ul class='mt-2 mb-0'>
          ${customers
            .map(
              ({ fullName }: CustomerInfo) => `<li>• <b>${fullName}</b></li>`,
            )
            .join('')}
        </ul>
      `,
      accept: () => {
        const ids = customers.map(({ id }: CustomerInfo) => id);
        this.customerStore.deleteAllById(ids);
      },
    });
  }
}
