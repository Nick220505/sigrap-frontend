import { Component } from '@angular/core';
import { ProductTableComponent } from './product-table/product-table.component';
import { ProductToolbarComponent } from './product-toolbar/product-toolbar.component';

@Component({
  selector: 'app-product-list',
  imports: [ProductToolbarComponent, ProductTableComponent],
  template: `
    <app-product-toolbar />
    <app-product-table />
  `,
})
export class ProductListComponent {}
