import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: 'products',
    loadComponent: () =>
      import('./components/products/products.component').then(
        (m) => m.ProductsComponent,
      ),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./components/categories/categories.component').then(
        (m) => m.CategoriesComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
