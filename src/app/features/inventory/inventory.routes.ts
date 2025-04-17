import { Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  {
    path: 'productos',
    loadComponent: () =>
      import('./product-list/product-list.component').then(
        (m) => m.ProductListComponent,
      ),
  },
  {
    path: 'categorias',
    loadComponent: () =>
      import('./categories/categories.component').then(
        (m) => m.CategoriesComponent,
      ),
  },
  {
    path: 'stock',
    loadComponent: () =>
      import('./stock-management/stock-management.component').then(
        (m) => m.StockManagementComponent,
      ),
  },
  {
    path: 'alertas',
    loadComponent: () =>
      import('./alerts/alerts.component').then((m) => m.AlertsComponent),
  },
];
