import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/component/layout/layout.component').then(
        (m) => m.LayoutComponent,
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'uikit',
        loadChildren: () => import('./pages/uikit/uikit.routes'),
      },
      {
        path: 'documentation',
        loadComponent: () =>
          import('./pages/documentation/documentation.component').then(
            (m) => m.DocumentationComponent,
          ),
      },
      {
        path: 'pages',
        loadChildren: () => import('./pages/pages.routes'),
      },
    ],
  },
  {
    path: 'landing',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(
        (m) => m.LandingComponent,
      ),
  },
  {
    path: 'notfound',
    loadComponent: () =>
      import('./pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.routes'),
  },
  { path: '**', redirectTo: '/notfound' },
];
