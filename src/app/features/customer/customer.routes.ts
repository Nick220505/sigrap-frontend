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
    path: 'ranking',
    loadComponent: () =>
      import('./components/ranking/customer-ranking.component').then(
        (m) => m.CustomerRankingComponent,
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
