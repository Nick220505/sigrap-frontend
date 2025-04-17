import { Routes } from '@angular/router';

export const CUSTOMERS_ROUTES: Routes = [
  { path: '', redirectTo: 'lista', pathMatch: 'full' },
  {
    path: 'lista',
    loadComponent: () =>
      import('./customer-list/customer-list.component').then(
        (m) => m.CustomerListComponent,
      ),
  },
  {
    path: 'cotizaciones',
    loadComponent: () =>
      import('./quotes/quotes.component').then((m) => m.QuotesComponent),
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./history/history.component').then((m) => m.HistoryComponent),
  },
];
