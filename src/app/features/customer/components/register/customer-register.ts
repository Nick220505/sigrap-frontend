import { Component, inject, viewChild } from '@angular/core';
import { CustomerStore } from '../../stores/customer-store';
import { CustomerDialog } from './customer-dialog/customer-dialog';
import { CustomerTable } from './customer-table/customer-table';
import { CustomerToolbar } from './customer-toolbar/customer-toolbar';

@Component({
  selector: 'app-customer-register',
  imports: [CustomerToolbar, CustomerTable, CustomerDialog],
  template: `
    <app-customer-toolbar [customerTable]="customerTable" />

    <app-customer-table #customerTable />

    <app-customer-dialog />
  `,
})
export class CustomerRegister {
  readonly customerStore = inject(CustomerStore);
  readonly customerTable = viewChild.required(CustomerTable);
}
