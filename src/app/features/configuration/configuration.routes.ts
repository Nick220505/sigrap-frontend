import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';

export const configurationRoutes: Routes = [
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./components/users/users.component').then(
        (m) => m.UsersComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'auditoria',
    loadComponent: () =>
      import('./components/audit/audit.component').then(
        (m) => m.AuditComponent,
      ),
    canActivate: [authGuard],
  },
];
