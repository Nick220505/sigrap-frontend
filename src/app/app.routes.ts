import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then(
            (m) => m.inventoryRoutes,
          ),
      },
    ],
  },
  {
    path: '',
    loadChildren: () =>
      import('./core/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: 'no-encontrado',
    loadComponent: () =>
      import('./core/layout/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  { path: '**', redirectTo: '/no-encontrado' },
];
