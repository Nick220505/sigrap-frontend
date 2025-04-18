import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'sales',
    loadComponent: () =>
      import('./sales/sales.component').then((m) => m.SalesComponent),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./inventory/inventory.component').then(
        (m) => m.InventoryComponent,
      ),
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./customers/customers.component').then(
        (m) => m.CustomersComponent,
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products.component').then((m) => m.ProductsComponent),
  },
  {
    path: 'suppliers',
    loadComponent: () =>
      import('./suppliers/suppliers.component').then(
        (m) => m.SuppliersComponent,
      ),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./reports/reports.component').then((m) => m.ReportsComponent),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./users/users.component').then((m) => m.UsersComponent),
  },
];
