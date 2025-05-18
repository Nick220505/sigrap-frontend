import { Routes } from '@angular/router';

export const supplierRoutes: Routes = [
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./components/catalog/catalog.component').then(
        (m) => m.CatalogComponent,
      ),
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./components/orders/orders.component').then(
        (m) => m.OrdersComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'catalogo',
  },
  {
    path: '**',
    redirectTo: '/no-encontrado',
  },
];
