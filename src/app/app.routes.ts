import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'inventario',
    loadChildren: () =>
      import('./features/inventory/inventory.routes').then(
        (m) => m.inventoryRoutes,
      ),
  },
  {
    path: 'notfound',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  { path: '**', redirectTo: '/notfound' },
];
