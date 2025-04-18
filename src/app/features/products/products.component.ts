import { Component, inject, signal } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductListComponent } from './product-list/product-list.component';
import { Product, ProductService } from './services/product.service';

@Component({
  selector: 'app-products',
  imports: [ToastModule, ProductListComponent, ProductDialogComponent],
  providers: [],
  template: `
    <p-toast />

    <app-product-list
      (editProductEvent)="editProduct($event)"
      (newProductEvent)="openNew()"
    />

    <app-product-dialog
      [(visible)]="productDialog"
      [productData]="product()"
      (hideDialogEvent)="hideDialog()"
      (saveProductEvent)="saveProduct($event)"
    />
  `,
})
export class ProductsComponent {
  private readonly productService = inject(ProductService);

  productDialog = signal(false);
  product = signal<Product>({});

  openNew() {
    this.product.set({});
    this.productDialog.set(true);
  }

  editProduct(product: Product) {
    this.product.set({ ...product });
    this.productDialog.set(true);
  }

  hideDialog() {
    this.productDialog.set(false);
  }

  saveProduct(product: Product) {
    if (product.id) {
      this.productService.updateProduct(product);
    } else {
      this.productService.createProduct(product);
    }

    this.product.set({});
    this.productDialog.set(false);
  }
}
