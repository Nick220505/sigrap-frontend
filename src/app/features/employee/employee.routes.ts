import { Routes } from '@angular/router';

export const employeeRoutes: Routes = [
  {
    path: 'schedules',
    loadComponent: () =>
      import('./components/employee-schedule/employee-schedule.component').then(
        (m) => m.EmployeeScheduleComponent,
      ),
  },
  {
    path: 'attendance',
    loadComponent: () =>
      import(
        './components/employee-attendance/employee-attendance.component'
      ).then((m) => m.EmployeeAttendanceComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'schedules',
  },
  {
    path: '**',
    redirectTo: '/not-found',
  },
];
