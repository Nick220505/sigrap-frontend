import { Component, inject, viewChild } from '@angular/core';
import { ScheduleStore } from '../../stores/schedule-store';
import { ScheduleDialog } from './schedule-dialog/schedule-dialog';
import { ScheduleTable } from './schedule-table/schedule-table';
import { ScheduleToolbar } from './schedule-toolbar/schedule-toolbar';

@Component({
  selector: 'app-employee-schedule',
  imports: [ScheduleToolbar, ScheduleTable, ScheduleDialog],
  template: `
    <app-schedule-toolbar [scheduleTable]="scheduleTable" />

    <app-schedule-table #scheduleTable />

    <app-schedule-dialog />
  `,
})
export class EmployeeSchedule {
  readonly scheduleStore = inject(ScheduleStore);
  readonly scheduleTable = viewChild.required(ScheduleTable);
}
