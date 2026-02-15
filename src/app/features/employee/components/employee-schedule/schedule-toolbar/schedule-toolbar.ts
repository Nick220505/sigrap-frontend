import { Component, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ScheduleInfo } from '@features/employee/models/schedule.model';
import { ScheduleStore } from '@features/employee/stores/schedule-store';
import { ScheduleTable } from '../schedule-table/schedule-table';

@Component({
  selector: 'app-schedule-toolbar',
  imports: [ButtonModule, ToolbarModule, TooltipModule, TranslateModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Create new schedule"
          tooltipPosition="top"
          (onClick)="scheduleStore.openScheduleDialog()"
        />

        <p-button
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          severity="danger"
          outlined
          pTooltip="Delete selected schedules"
          tooltipPosition="top"
          [disabled]="scheduleTable().selectedSchedules().length === 0"
          (onClick)="deleteSelectedSchedules()"
          class="mr-2"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="scheduleTable().dt().exportCSV()"
          [disabled]="scheduleStore.entities().length === 0"
          pTooltip="Export schedules to CSV"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class ScheduleToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  readonly scheduleStore = inject(ScheduleStore);
  readonly scheduleTable = input.required<ScheduleTable>();

  deleteSelectedSchedules(): void {
    const schedules = this.scheduleTable().selectedSchedules();
    this.confirmationService.confirm({
      header: 'Delete Schedules',
      message: `
        Are you sure you want to delete the ${schedules.length} selected schedules?
        <ul class='mt-2 mb-0'>
          ${schedules
            .map(
              ({ userName, day }: ScheduleInfo) =>
                `<li>• <b>${userName}</b> - ${day}</li>`,
            )
            .join('')}
        </ul>
      `,
      accept: () => {
        const ids = schedules.map(({ id }: ScheduleInfo) => id);
        this.scheduleStore.deleteAllById(ids);
      },
    });
  }
}
