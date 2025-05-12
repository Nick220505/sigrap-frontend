import { Component, viewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ScheduleTableComponent } from './schedule-table/schedule-table.component';
import { ScheduleToolbarComponent } from './schedule-toolbar/schedule-toolbar.component';

@Component({
  selector: 'app-employee-schedule',
  imports: [CardModule, ScheduleTableComponent, ScheduleToolbarComponent],
  template: `
    <div class="p-4">
      <div class="mb-4">
        <app-schedule-toolbar [scheduleTable]="scheduleTable" />
      </div>

      <p-card>
        <app-schedule-table #scheduleTable />
      </p-card>
    </div>
  `,
})
export class EmployeeScheduleComponent {
  readonly scheduleTable =
    viewChild.required<ScheduleTableComponent>('scheduleTable');
}
