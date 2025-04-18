import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductListComponent } from './product-list/product-list.component';
import { Product, ProductService } from './services/product.service';

@Component({
  selector: 'app-products',
  imports: [ToastModule, ProductListComponent, ProductDialogComponent],
  template: `
    <p-toast />

    <app-product-list
      (editProductEvent)="editProduct($event)"
      (newProductEvent)="openNew()"
    />

    <app-product-dialog
      [(visible)]="productDialog"
      [productData]="product"
      (hideDialogEvent)="hideDialog()"
      (saveProductEvent)="saveProduct($event)"
    />
  `,
})
export class ProductsComponent {
  private readonly messageService = inject(MessageService);
  private readonly productService = inject(ProductService);

  productDialog = false;
  product: Product = {};

  openNew() {
    this.product = {};
    this.productDialog = true;
  }

  editProduct(product: Product) {
    this.product = { ...product };
    this.productDialog = true;
  }

  hideDialog() {
    this.productDialog = false;
  }

  saveProduct(product: Product) {
    if (product.id) {
      this.productService.updateProduct(product);
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Product Updated',
        life: 3000,
      });
    } else {
      this.productService.createProduct(product);
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Product Created',
        life: 3000,
      });
    }

    this.product = {};
    this.productDialog = false;
  }
}
