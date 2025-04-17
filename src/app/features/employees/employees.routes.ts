import { Routes } from '@angular/router';

export const EMPLOYEES_ROUTES: Routes = [
  { path: '', redirectTo: 'rendimiento', pathMatch: 'full' },
  {
    path: 'rendimiento',
    loadComponent: () =>
      import('./performance/performance.component').then(
        (m) => m.PerformanceComponent,
      ),
  },
  {
    path: 'horarios',
    loadComponent: () =>
      import('./schedules/schedules.component').then(
        (m) => m.SchedulesComponent,
      ),
  },
  {
    path: 'seguimiento',
    loadComponent: () =>
      import('./monitoring/monitoring.component').then(
        (m) => m.MonitoringComponent,
      ),
  },
];
