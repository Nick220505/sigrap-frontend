import { Routes } from '@angular/router';
import { publicGuard } from './guards/public.guard';

export const authRoutes: Routes = [
  {
    path: 'iniciar-sesion',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    canActivate: [publicGuard],
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
    canActivate: [publicGuard],
  },
];
