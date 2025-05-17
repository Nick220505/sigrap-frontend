import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';

export const salesRoutes: Routes = [
  {
    path: 'registrar',
    loadComponent: () =>
      import('./components/sales/sales.component').then(
        (m) => m.SalesComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./components/history/sales-history.component').then(
        (m) => m.SalesHistoryComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'devoluciones',
    loadComponent: () =>
      import('./components/returns/sales-returns.component').then(
        (m) => m.SalesReturnsComponent,
      ),
    canActivate: [authGuard],
  },
];
