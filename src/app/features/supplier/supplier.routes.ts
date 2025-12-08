import { Routes } from '@angular/router';

export const supplierRoutes: Routes = [
  {
    path: 'catalog',
    loadComponent: () =>
      import('./components/catalog/catalog.component').then(
        (m) => m.CatalogComponent,
      ),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./components/orders/orders.component').then(
        (m) => m.OrdersComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'catalog',
  },
];
