import { Component, inject, viewChild } from '@angular/core';
import { ProductStore } from '@features/inventory/stores/product-store';
import { ProductDialog } from './product-dialog/product-dialog';
import { ProductTable } from './product-table/product-table';
import { ProductToolbar } from './product-toolbar/product-toolbar';

@Component({
  selector: 'app-products',
  imports: [ProductToolbar, ProductTable, ProductDialog],
  template: `
    <app-product-toolbar [productTable]="productTable" />

    <app-product-table #productTable />

    <app-product-dialog />
  `,
})
export class Products {
  readonly productStore = inject(ProductStore);
  readonly productTable = viewChild.required(ProductTable);
}
