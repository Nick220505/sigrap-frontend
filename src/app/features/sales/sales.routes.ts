import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';

export const salesRoutes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./components/sales/sales.component').then(
        (m) => m.SalesComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'returns',
    loadComponent: () =>
      import('./components/returns/sales-returns.component').then(
        (m) => m.SalesReturnsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'register',
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
