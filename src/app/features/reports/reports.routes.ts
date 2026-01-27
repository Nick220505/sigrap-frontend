import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards/auth-guard';

export const reportsRoutes: Routes = [
  {
    path: 'sales',
    loadComponent: () =>
      import('./components/sales-report/sales-report').then(
        (m) => m.SalesReport,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./components/inventory-report/inventory-report').then(
        (m) => m.InventoryReport,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./components/customers-report/customers-report').then(
        (m) => m.CustomersReport,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'financial',
    loadComponent: () =>
      import('./components/financial-report/financial-report').then(
        (m) => m.FinancialReport,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./components/employees-report/employees-report').then(
        (m) => m.EmployeesReport,
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'sales',
  },
];
