import { Component, signal, viewChild } from '@angular/core';
import { Product } from '@features/inventory/models/product.model';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductTableComponent } from './product-table/product-table.component';
import { ProductToolbarComponent } from './product-toolbar/product-toolbar.component';

@Component({
  selector: 'app-products',
  imports: [
    ToastModule,
    ConfirmDialogModule,
    ProductToolbarComponent,
    ProductTableComponent,
    ProductDialogComponent,
  ],
  template: `
    <p-toast />

    <app-product-toolbar
      [productTable]="productTable"
      [(dialogVisible)]="dialogVisible"
      [(selectedProduct)]="selectedProduct"
    />

    <app-product-table
      #productTable
      [(dialogVisible)]="dialogVisible"
      [(selectedProduct)]="selectedProduct"
    />

    <app-product-dialog
      [(visible)]="dialogVisible"
      [selectedProduct]="selectedProduct()"
    />

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class ProductsComponent {
  readonly productTable = viewChild.required(ProductTableComponent);
  readonly dialogVisible = signal(false);
  readonly selectedProduct = signal<Product | null>(null);
}
