import { Component, inject, viewChild } from '@angular/core';
import { ScheduleStore } from '../../stores/schedule.store';
import { ScheduleDialogComponent } from './schedule-dialog/schedule-dialog.component';
import { ScheduleTableComponent } from './schedule-table/schedule-table.component';
import { ScheduleToolbarComponent } from './schedule-toolbar/schedule-toolbar.component';

@Component({
  selector: 'app-employee-schedule',
  imports: [
    ScheduleToolbarComponent,
    ScheduleTableComponent,
    ScheduleDialogComponent,
  ],
  template: `
    <app-schedule-toolbar [scheduleTable]="scheduleTable" />

    <app-schedule-table #scheduleTable />

    <app-schedule-dialog />
  `,
})
export class EmployeeScheduleComponent {
  readonly scheduleStore = inject(ScheduleStore);
  readonly scheduleTable = viewChild.required(ScheduleTableComponent);
}
