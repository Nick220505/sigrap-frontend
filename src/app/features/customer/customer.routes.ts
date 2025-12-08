import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/customer-register.component').then(
        (m) => m.CustomerRegisterComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'register',
  },
];
