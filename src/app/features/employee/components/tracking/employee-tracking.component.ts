import { Component, inject, viewChild } from '@angular/core';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { ActivityLogStore } from '../../stores/activity-log.store';
import { AttendanceStore } from '../../stores/attendance.store';
import { ActivityLogDialogComponent } from './activity-log-dialog/activity-log-dialog.component';
import { ActivityLogTableComponent } from './activity-log-table/activity-log-table.component';
import { ActivityLogToolbarComponent } from './activity-log-toolbar/activity-log-toolbar.component';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import { AttendanceToolbarComponent } from './attendance-toolbar/attendance-toolbar.component';
import { ClockInDialogComponent } from './clock-in-dialog/clock-in-dialog.component';

@Component({
  selector: 'app-employee-tracking',
  imports: [
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    AttendanceTableComponent,
    ActivityLogTableComponent,
    AttendanceToolbarComponent,
    ActivityLogToolbarComponent,
    ClockInDialogComponent,
    ActivityLogDialogComponent,
  ],
  template: `
    <p-tabs value="asistencia">
      <p-tablist>
        <p-tab value="asistencia">Asistencia</p-tab>
        <p-tab value="registroActividades">Registro de Actividades</p-tab>
      </p-tablist>
      <p-tabpanels>
        <p-tabpanel value="asistencia">
          <app-attendance-toolbar [attendanceTable]="attendanceTableRef" />
          <app-attendance-table #attendanceTableRef />
          <app-clock-in-dialog />
        </p-tabpanel>
        <p-tabpanel value="registroActividades">
          <app-activity-log-toolbar [activityLogTable]="activityLogTableRef" />
          <app-activity-log-table #activityLogTableRef />
          <app-activity-log-dialog />
        </p-tabpanel>
      </p-tabpanels>
    </p-tabs>
  `,
})
export class EmployeeTrackingComponent {
  readonly attendanceStore = inject(AttendanceStore);
  readonly activityLogStore = inject(ActivityLogStore);
  readonly attendanceTableRef = viewChild.required(AttendanceTableComponent);
  readonly activityLogTableRef = viewChild.required(ActivityLogTableComponent);
}
