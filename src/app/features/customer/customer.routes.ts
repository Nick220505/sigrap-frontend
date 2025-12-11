import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/customer-register').then(
        (m) => m.CustomerRegister,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'register',
  },
];
