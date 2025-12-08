import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/guards/auth.guard';

export const reportsRoutes: Routes = [
  {
    path: 'sales',
    loadComponent: () =>
      import('./components/sales-report/sales-report.component').then(
        (m) => m.SalesReportComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./components/inventory-report/inventory-report.component').then(
        (m) => m.InventoryReportComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./components/customers-report/customers-report.component').then(
        (m) => m.CustomersReportComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'financial',
    loadComponent: () =>
      import('./components/financial-report/financial-report.component').then(
        (m) => m.FinancialReportComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./components/employees-report/employees-report.component').then(
        (m) => m.EmployeesReportComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'sales',
  },
];
