import { Routes } from '@angular/router';

export const employeeRoutes: Routes = [
  {
    path: 'schedules',
    loadComponent: () =>
      import('./components/employee-schedule/employee-schedule').then(
        (m) => m.EmployeeSchedule,
      ),
  },
  {
    path: 'attendance',
    loadComponent: () =>
      import('./components/employee-attendance/employee-attendance').then(
        (m) => m.EmployeeAttendance,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'schedules',
  },
];
