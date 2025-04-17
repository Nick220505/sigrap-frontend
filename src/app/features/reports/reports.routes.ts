import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  { path: '', redirectTo: 'ventas', pathMatch: 'full' },
  {
    path: 'ventas',
    loadComponent: () =>
      import('./sales-reports/sales-reports.component').then(
        (m) => m.SalesReportsComponent,
      ),
  },
  {
    path: 'inventario',
    loadComponent: () =>
      import('./inventory-reports/inventory-reports.component').then(
        (m) => m.InventoryReportsComponent,
      ),
  },
  {
    path: 'financieros',
    loadComponent: () =>
      import('./financial/financial.component').then(
        (m) => m.FinancialComponent,
      ),
  },
];
