import { Routes } from '@angular/router';
import { publicGuard } from './guards/public-guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.Login),
    canActivate: [publicGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register').then((m) => m.Register),
    canActivate: [publicGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login',
  },
];
