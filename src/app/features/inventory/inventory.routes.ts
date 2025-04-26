import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: 'productos',
    loadComponent: () =>
      import('./components/products/products.component').then(
        (m) => m.ProductsComponent,
      ),
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./components/categories/categories.component').then(
        (m) => m.CategoriesComponent,
      ),
  },
];
