import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: 'sales',
    loadComponent: () =>
      import('./features/sales/sales.component').then((m) => m.SalesComponent),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/inventory.component').then(
        (m) => m.InventoryComponent,
      ),
  },
  {
    path: 'customers',
    loadComponent: () =>
      import('./features/customers/customers.component').then(
        (m) => m.CustomersComponent,
      ),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./features/products/products.component').then(
        (m) => m.ProductsComponent,
      ),
  },
  {
    path: 'suppliers',
    loadComponent: () =>
      import('./features/suppliers/suppliers.component').then(
        (m) => m.SuppliersComponent,
      ),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/reports/reports.component').then(
        (m) => m.ReportsComponent,
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./features/users/users.component').then((m) => m.UsersComponent),
  },
];
