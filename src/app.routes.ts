import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./app/layout/component/layout/layout.component').then(
        (m) => m.LayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./app/pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'uikit',
        loadChildren: () => import('./app/pages/uikit/uikit.routes'),
      },
      {
        path: 'documentation',
        loadComponent: () =>
          import('./app/pages/documentation/documentation.component').then(
            (m) => m.DocumentationComponent,
          ),
      },
      {
        path: 'pages',
        loadChildren: () => import('./app/pages/pages.routes'),
      },
    ],
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./app/pages/landing/landing.component').then(
        (m) => m.LandingComponent,
      ),
  },
  {
    path: 'notfound',
    loadComponent: () =>
      import('./app/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  {
    path: 'auth',
    loadChildren: () => import('./app/pages/auth/auth.routes'),
  },
  { path: '**', redirectTo: '/notfound' },
];
