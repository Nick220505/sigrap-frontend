import { Routes } from '@angular/router';

export const supplierRoutes: Routes = [
  {
    path: 'catalog',
    loadComponent: () =>
      import('./components/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./components/orders/orders').then((m) => m.Orders),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'catalog',
  },
];
