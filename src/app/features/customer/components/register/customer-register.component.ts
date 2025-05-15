import { Component, inject, viewChild } from '@angular/core';
import { CustomerStore } from '../../stores/customer.store';
import { CustomerDialogComponent } from './customer-dialog/customer-dialog.component';
import { CustomerTableComponent } from './customer-table/customer-table.component';
import { CustomerToolbarComponent } from './customer-toolbar/customer-toolbar.component';

@Component({
  selector: 'app-customer-register',
  imports: [
    CustomerToolbarComponent,
    CustomerTableComponent,
    CustomerDialogComponent,
  ],
  template: `
    <app-customer-toolbar [customerTable]="customerTable" />

    <app-customer-table #customerTable />

    <app-customer-dialog />
  `,
})
export class CustomerRegisterComponent {
  readonly customerStore = inject(CustomerStore);
  readonly customerTable = viewChild.required(CustomerTableComponent);
}
