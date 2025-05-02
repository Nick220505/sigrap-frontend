import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'iniciar-sesion',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
];
