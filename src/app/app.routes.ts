import { Routes } from '@angular/router';
import { CUSTOMERS_ROUTES } from './features/customers/customers.routes';
import { DASHBOARD_ROUTES } from './features/dashboard/dashboard.routes';
import { EMPLOYEES_ROUTES } from './features/employees/employees.routes';
import { INVENTORY_ROUTES } from './features/inventory/inventory.routes';
import { NOT_FOUND_ROUTES } from './features/not-found/not-found.routes';
import { REPORTS_ROUTES } from './features/reports/reports.routes';
import { SALES_ROUTES } from './features/sales/sales.routes';
import { SETTINGS_ROUTES } from './features/settings/settings.routes';
import { SUPPLIERS_ROUTES } from './features/suppliers/suppliers.routes';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        loadChildren: () => DASHBOARD_ROUTES,
      },
      // Inventario
      {
        path: 'inventario',
        loadComponent: () =>
          import('./features/inventory/inventory.component').then(
            (m) => m.InventoryComponent,
          ),
        children: INVENTORY_ROUTES,
      },
      // Ventas
      {
        path: 'ventas',
        loadComponent: () =>
          import('./features/sales/sales.component').then(
            (m) => m.SalesComponent,
          ),
        children: SALES_ROUTES,
      },
      // Proveedores
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./features/suppliers/suppliers.component').then(
            (m) => m.SuppliersComponent,
          ),
        children: SUPPLIERS_ROUTES,
      },
      // Clientes
      {
        path: 'clientes',
        loadComponent: () =>
          import('./features/customers/customers.component').then(
            (m) => m.CustomersComponent,
          ),
        children: CUSTOMERS_ROUTES,
      },
      // Empleados
      {
        path: 'empleados',
        loadComponent: () =>
          import('./features/employees/employees.component').then(
            (m) => m.EmployeesComponent,
          ),
        children: EMPLOYEES_ROUTES,
      },
      // Reportes
      {
        path: 'reportes',
        loadComponent: () =>
          import('./features/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
        children: REPORTS_ROUTES,
      },
      // Configuración
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./features/settings/settings.component').then(
            (m) => m.SettingsComponent,
          ),
        children: SETTINGS_ROUTES,
      },
    ],
  },
  {
    path: 'not-found',
    loadChildren: () => NOT_FOUND_ROUTES,
  },
  { path: '**', redirectTo: '/not-found' },
];
