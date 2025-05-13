import { Component, inject, viewChild } from '@angular/core';
import { SupplierStore } from '../../stores/supplier.store';
import { SupplierDialogComponent } from './supplier-dialog/supplier-dialog.component';
import { SupplierTableComponent } from './supplier-table/supplier-table.component';
import { SupplierToolbarComponent } from './supplier-toolbar/supplier-toolbar.component';

@Component({
  selector: 'app-catalog',
  imports: [
    SupplierToolbarComponent,
    SupplierTableComponent,
    SupplierDialogComponent,
  ],
  template: `
    <app-supplier-toolbar [supplierTable]="supplierTable" />

    <app-supplier-table #supplierTable />

    <app-supplier-dialog />
  `,
})
export class CatalogComponent {
  readonly supplierStore = inject(SupplierStore);
  readonly supplierTable = viewChild.required(SupplierTableComponent);
}
