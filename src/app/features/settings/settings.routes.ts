import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  { path: '', redirectTo: 'general', pathMatch: 'full' },
  {
    path: 'general',
    loadComponent: () =>
      import('./general-settings/general-settings.component').then(
        (m) => m.GeneralSettingsComponent,
      ),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./user-management/user-management.component').then(
        (m) => m.UserManagementComponent,
      ),
  },
  {
    path: 'auditoria',
    loadComponent: () =>
      import('./audit/audit.component').then((m) => m.AuditComponent),
  },
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./notifications/notifications.component').then(
        (m) => m.NotificationsComponent,
      ),
  },
];
