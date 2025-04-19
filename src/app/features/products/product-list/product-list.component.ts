import { Component } from '@angular/core';
import { ProductTableComponent } from './product-table/product-table.component';

@Component({
  selector: 'app-product-list',
  imports: [ProductTableComponent],
  template: ` <app-product-table /> `,
})
export class ProductListComponent {}
