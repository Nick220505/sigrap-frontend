import { Component, inject, viewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { ActivityLogStore } from '../../stores/activity-log.store';
import { AttendanceStore } from '../../stores/attendance.store';
import { ActivityLogTableComponent } from './activity-log-table/activity-log-table.component';
import { ActivityLogToolbarComponent } from './activity-log-toolbar/activity-log-toolbar.component';
import { AttendanceTableComponent } from './attendance-table/attendance-table.component';
import { AttendanceToolbarComponent } from './attendance-toolbar/attendance-toolbar.component';

@Component({
  selector: 'app-employee-tracking',
  imports: [
    CardModule,
    TabViewModule,
    AttendanceTableComponent,
    ActivityLogTableComponent,
    AttendanceToolbarComponent,
    ActivityLogToolbarComponent,
  ],
  template: `
    <div class="p-4">
      <p-tabView>
        <p-tabPanel header="Asistencia">
          <div class="mb-4">
            <app-attendance-toolbar [attendanceTable]="attendanceTableRef" />
          </div>

          <p-card>
            <app-attendance-table #attendanceTableRef />
          </p-card>
        </p-tabPanel>

        <p-tabPanel header="Registro de Actividades">
          <div class="mb-4">
            <app-activity-log-toolbar
              [activityLogTable]="activityLogTableRef"
            />
          </div>

          <p-card>
            <app-activity-log-table #activityLogTableRef />
          </p-card>
        </p-tabPanel>
      </p-tabView>
    </div>
  `,
})
export class EmployeeTrackingComponent {
  readonly attendanceStore = inject(AttendanceStore);
  readonly activityLogStore = inject(ActivityLogStore);
  readonly attendanceTableRef = viewChild.required(AttendanceTableComponent);
  readonly activityLogTableRef = viewChild.required(ActivityLogTableComponent);
}
