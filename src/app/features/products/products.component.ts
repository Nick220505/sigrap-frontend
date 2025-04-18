import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductListComponent } from './product-list/product-list.component';
import { Product } from './services/product.service';

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
      this.messageService.add({
        severity: 'success',
        summary: 'Successful',
        detail: 'Product Updated',
        life: 3000,
      });
    } else {
      product.id = this.createId();
      product.image = 'product-placeholder.svg';
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

  private createId(): string {
    let id = '';
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 5; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
}
