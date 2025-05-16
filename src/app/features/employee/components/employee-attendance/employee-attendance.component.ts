import { Component, inject, viewChild } from '@angular/core';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import { AttendanceToolbarComponent } from './attendance-toolbar/attendance-toolbar.component';
import { ClockInDialogComponent } from './clock-in-dialog/clock-in-dialog.component';

@Component({
  selector: 'app-employee-attendance',
  imports: [
    AttendanceTableComponent,
    AttendanceToolbarComponent,
    ClockInDialogComponent,
  ],
  template: `
    <app-attendance-toolbar [attendanceTable]="attendanceTable" />
    <app-attendance-table #attendanceTable />
    <app-clock-in-dialog />
  `,
})
export class EmployeeAttendanceComponent {
  readonly attendanceStore = inject(AttendanceStore);
  readonly attendanceTable = viewChild.required(AttendanceTableComponent);
}
