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
    path: 'perfiles',
    loadComponent: () =>
      import('./components/roles/roles.component').then(
        (m) => m.RolesComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'roles',
    loadComponent: () =>
      import('./components/roles/roles.component').then(
        (m) => m.RolesComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'permisos',
    loadComponent: () =>
      import('./components/permissions/permissions.component').then(
        (m) => m.PermissionsComponent,
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
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./components/notifications/notifications.component').then(
        (m) => m.NotificationsComponent,
      ),
    canActivate: [authGuard],
  },
];
