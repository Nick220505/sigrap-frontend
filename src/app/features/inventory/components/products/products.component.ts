import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductTableComponent } from './product-table/product-table.component';

@Component({
  selector: 'app-products',
  imports: [ToastModule, ProductDialogComponent, ProductTableComponent],
  template: `
    <p-toast />
    <app-product-dialog />
    <app-product-table />
  `,
})
export class ProductsComponent {}
