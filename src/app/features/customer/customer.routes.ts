import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/register/customer-register.component').then(
        (m) => m.CustomerRegisterComponent,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'registro',
  },
  {
    path: '**',
    redirectTo: '/no-encontrado',
  },
];
