import { Routes } from '@angular/router';

export const employeeRoutes: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./components/register/employee-register.component').then(
        (m) => m.EmployeeRegisterComponent,
      ),
  },
  {
    path: 'rendimiento',
    loadComponent: () =>
      import('./components/performance/employee-performance.component').then(
        (m) => m.EmployeePerformanceComponent,
      ),
  },
  {
    path: 'horarios',
    loadComponent: () =>
      import('./components/schedule/employee-schedule.component').then(
        (m) => m.EmployeeScheduleComponent,
      ),
  },
  {
    path: 'seguimiento',
    loadComponent: () =>
      import('./components/tracking/employee-tracking.component').then(
        (m) => m.EmployeeTrackingComponent,
      ),
  },
];
