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
    path: 'devoluciones',
    loadComponent: () =>
      import('./components/returns/sales-returns.component').then(
        (m) => m.SalesReturnsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'registrar',
  },
  {
    path: '**',
    redirectTo: '/no-encontrado',
  },
];
