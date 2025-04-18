import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ProductDialogComponent } from './product-dialog/product-dialog.component';
import { ProductListComponent } from './product-list/product-list.component';

@Component({
  selector: 'app-products',
  imports: [ToastModule, ProductListComponent, ProductDialogComponent],
  template: `
    <p-toast />
    <app-product-list />
    <app-product-dialog />
  `,
})
export class ProductsComponent {}
