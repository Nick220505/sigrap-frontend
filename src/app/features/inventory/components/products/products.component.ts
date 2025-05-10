import { Component, inject, viewChild } from '@angular/core';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductTableComponent } from './product-table/product-table.component';
import { ProductToolbarComponent } from './product-toolbar/product-toolbar.component';

@Component({
  selector: 'app-products',
  imports: [
    ConfirmDialogModule,
    ProductToolbarComponent,
    ProductTableComponent,
    ProductDialogComponent,
  ],
  template: `
    <app-product-toolbar [productTable]="productTable" />

    <app-product-table #productTable />

    <app-product-dialog />

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class ProductsComponent {
  readonly productStore = inject(ProductStore);
  readonly productTable = viewChild.required(ProductTableComponent);
}
