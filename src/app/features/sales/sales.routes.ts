import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth-guard';

export const salesRoutes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./components/sales/sales').then((m) => m.Sales),
    canActivate: [authGuard],
  },
  {
    path: 'returns',
    loadComponent: () =>
      import('./components/returns/sales-returns').then((m) => m.SalesReturns),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'register',
  },
];
