import { Component, inject, input } from '@angular/core';
import { AttendanceTable } from '@features/employee/components/employee-attendance/attendance-table/attendance-table';
import { AttendanceStore } from '@features/employee/stores/attendance-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-attendance-toolbar',
  imports: [ButtonModule, ToolbarModule, TooltipModule, TranslateModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button
          [label]="'employees.clockIn' | translate"
          icon="pi pi-clock"
          outlined
          class="mr-2"
          [pTooltip]="'employees.tooltips.clockIn' | translate"
          tooltipPosition="top"
          (onClick)="attendanceStore.openClockInDialog()"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          [label]="'common.export' | translate"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="attendanceTable().dt().exportCSV()"
          [disabled]="attendanceStore.entities().length === 0"
          [pTooltip]="'employees.tooltips.export' | translate"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class AttendanceToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  readonly attendanceStore = inject(AttendanceStore);
  readonly attendanceTable = input.required<AttendanceTable>();
}
