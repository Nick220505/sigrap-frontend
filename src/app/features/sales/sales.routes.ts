import { Routes } from '@angular/router';

export const SALES_ROUTES: Routes = [
  { path: '', redirectTo: 'punto-venta', pathMatch: 'full' },
  {
    path: 'punto-venta',
    loadComponent: () =>
      import('./point-of-sale/point-of-sale.component').then(
        (m) => m.PointOfSaleComponent,
      ),
  },
  {
    path: 'facturas',
    loadComponent: () =>
      import('./invoices/invoices.component').then((m) => m.InvoicesComponent),
  },
  {
    path: 'pedidos',
    loadComponent: () =>
      import('./orders/orders.component').then((m) => m.OrdersComponent),
  },
  {
    path: 'devoluciones',
    loadComponent: () =>
      import('./returns/returns.component').then((m) => m.ReturnsComponent),
  },
];
