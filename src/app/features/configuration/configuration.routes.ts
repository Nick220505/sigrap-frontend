import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth-guard';

export const configurationRoutes: Routes = [
  {
    path: 'users',
    loadComponent: () =>
      import('./components/users/users').then((m) => m.Users),
    canActivate: [authGuard],
  },
  {
    path: 'audit',
    loadComponent: () =>
      import('./components/audit/audit').then((m) => m.Audit),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users',
  },
];
