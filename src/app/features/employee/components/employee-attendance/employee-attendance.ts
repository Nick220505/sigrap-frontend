import { Component, inject, viewChild } from '@angular/core';
import { AttendanceStore } from '@features/employee/stores/attendance-store';
import { AttendanceTable } from './attendance-table/attendance-table';
import { AttendanceToolbar } from './attendance-toolbar/attendance-toolbar';
import { ClockInDialog } from './clock-in-dialog/clock-in-dialog';

@Component({
  selector: 'app-employee-attendance',
  imports: [AttendanceTable, AttendanceToolbar, ClockInDialog],
  template: `
    <app-attendance-toolbar [attendanceTable]="attendanceTable" />
    <app-attendance-table #attendanceTable />
    <app-clock-in-dialog />
  `,
})
export class EmployeeAttendance {
  readonly attendanceStore = inject(AttendanceStore);
  readonly attendanceTable = viewChild.required(AttendanceTable);
}
