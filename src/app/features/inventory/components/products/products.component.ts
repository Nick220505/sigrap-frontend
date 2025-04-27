import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductManagementComponent } from './product-management/product-management.component';

@Component({
  selector: 'app-products',
  imports: [ToastModule, ProductDialogComponent, ProductManagementComponent],
  template: `
    <p-toast />
    <app-product-dialog />
    <app-product-management />
  `,
})
export class ProductsComponent {}
