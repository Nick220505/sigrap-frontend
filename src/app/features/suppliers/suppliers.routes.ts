import { Routes } from '@angular/router';

export const SUPPLIERS_ROUTES: Routes = [
  { path: '', redirectTo: 'lista', pathMatch: 'full' },
  {
    path: 'lista',
    loadComponent: () =>
      import('./supplier-list/supplier-list.component').then(
        (m) => m.SupplierListComponent,
      ),
  },
  {
    path: 'ordenes-compra',
    loadComponent: () =>
      import('./purchase-orders/purchase-orders.component').then(
        (m) => m.PurchaseOrdersComponent,
      ),
  },
  {
    path: 'pagos',
    loadComponent: () =>
      import('./payments/payments.component').then((m) => m.PaymentsComponent),
  },
  {
    path: 'seguimiento',
    loadComponent: () =>
      import('./tracking/tracking.component').then((m) => m.TrackingComponent),
  },
];
