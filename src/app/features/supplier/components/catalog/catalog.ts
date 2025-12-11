import { Component, inject, viewChild } from '@angular/core';
import { SupplierStore } from '../../stores/supplier-store';
import { SupplierDialog } from './supplier-dialog/supplier-dialog';
import { SupplierTable } from './supplier-table/supplier-table';
import { SupplierToolbar } from './supplier-toolbar/supplier-toolbar';

@Component({
  selector: 'app-catalog',
  imports: [SupplierToolbar, SupplierTable, SupplierDialog],
  template: `
    <app-supplier-toolbar [supplierTable]="supplierTable" />

    <app-supplier-table #supplierTable />

    <app-supplier-dialog />
  `,
})
export class Catalog {
  readonly supplierStore = inject(SupplierStore);
  readonly supplierTable = viewChild.required(SupplierTable);
}
