import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ProductDialogComponent } from './components/product-dialog/product-dialog.component';
import { ProductTableComponent } from './components/product-table/product-table.component';

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
