import { Routes } from '@angular/router';

export const employeeRoutes: Routes = [
  {
    path: 'horarios',
    loadComponent: () =>
      import('./components/employee-schedule/employee-schedule.component').then(
        (m) => m.EmployeeScheduleComponent,
      ),
  },
  {
    path: 'asistencia',
    loadComponent: () =>
      import(
        './components/employee-attendance/employee-attendance.component'
      ).then((m) => m.EmployeeAttendanceComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'horarios',
  },
  {
    path: '**',
    redirectTo: '/no-encontrado',
  },
];
