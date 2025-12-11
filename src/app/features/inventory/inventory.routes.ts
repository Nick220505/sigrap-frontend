import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: 'products',
    loadComponent: () =>
      import('./components/products/products').then((m) => m.Products),
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./components/categories/categories').then((m) => m.Categories),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'products',
  },
];
