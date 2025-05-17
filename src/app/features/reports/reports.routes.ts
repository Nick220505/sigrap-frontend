import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';

export const reportsRoutes: Routes = [
  {
    path: 'ventas',
    loadComponent: () =>
      import('./components/sales-report/sales-report.component').then(
        (m) => m.SalesReportComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'inventario',
    loadComponent: () =>
      import('./components/inventory-report/inventory-report.component').then(
        (m) => m.InventoryReportComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./components/customers-report/customers-report.component').then(
        (m) => m.CustomersReportComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'financieros',
    loadComponent: () =>
      import('./components/financial-report/financial-report.component').then(
        (m) => m.FinancialReportComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'rendimiento',
    loadComponent: () =>
      import(
        './components/performance-report/performance-report.component'
      ).then((m) => m.PerformanceReportComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'ventas',
  },
  {
    path: '**',
    redirectTo: '/no-encontrado',
  },
];
