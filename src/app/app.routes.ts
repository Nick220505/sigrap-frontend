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
        canActivate: [authGuard],
      },
      {
        path: 'proveedores',
        loadChildren: () =>
          import('./features/supplier/supplier.routes').then(
            (m) => m.supplierRoutes,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'empleados',
        loadChildren: () =>
          import('./features/employee/employee.routes').then(
            (m) => m.employeeRoutes,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./features/customer/customer.routes').then(
            (m) => m.customerRoutes,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'configuracion',
        loadChildren: () =>
          import('./features/configuration/configuration.routes').then(
            (m) => m.configurationRoutes,
          ),
        canActivate: [authGuard],
      },
      {
        path: 'ventas',
        loadChildren: () =>
          import('./features/sales/sales.routes').then((m) => m.salesRoutes),
        canActivate: [authGuard],
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
