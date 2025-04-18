import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ProductStore } from '../store/product.store';
import { ProductTableComponent } from './product-table/product-table.component';
import { ProductToolbarComponent } from './product-toolbar/product-toolbar.component';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    ButtonModule,
    ProgressSpinnerModule,
    ProductToolbarComponent,
    ProductTableComponent,
  ],
  template: `
    @if (productStore.isLoading()) {
      <div class="flex justify-center p-8">
        <p-progressSpinner />
      </div>
    } @else if (productStore.getError()) {
      <div
        class="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded"
      >
        <p>Error al cargar productos:</p>
        <p>{{ productStore.getError() }}</p>
        <p-button
          label="Reintentar"
          (onClick)="productStore.loadProducts()"
          styleClass="p-button-sm mt-2"
        />
      </div>
    } @else {
      <app-product-toolbar />
      <app-product-table />
    }
  `,
})
export class ProductListComponent {
  readonly productStore = inject(ProductStore);
}
