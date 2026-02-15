import { Component, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
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
          label="New"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Create new customer"
          tooltipPosition="top"
          (onClick)="customerStore.openCustomerDialog()"
        />

        <p-button
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          severity="danger"
          outlined
          pTooltip="Delete selected customers"
          tooltipPosition="top"
          [disabled]="customerTable().selectedCustomers().length === 0"
          (onClick)="deleteSelectedCustomers()"
          class="mr-2"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="customerTable().dt().exportCSV()"
          [disabled]="customerStore.entities().length === 0"
          pTooltip="Export customers to CSV"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class CustomerToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  readonly customerStore = inject(CustomerStore);
  readonly customerTable = input.required<CustomerTable>();

  deleteSelectedCustomers(): void {
    const customers = this.customerTable().selectedCustomers();
    this.confirmationService.confirm({
      header: 'Delete Customers',
      message: `
        Are you sure you want to delete the ${customers.length} selected customers?
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
