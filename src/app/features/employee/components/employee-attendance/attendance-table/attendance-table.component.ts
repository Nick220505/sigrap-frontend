import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AttendanceInfo } from '@features/employee/models/attendance.model';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-attendance-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    FormsModule,
    DatePipe,
    DecimalPipe,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    MessageModule,
  ],
  template: `
    @let columns =
      [
        { field: 'userName', header: 'Employee' },
        { field: 'date', header: 'Date' },
        { field: 'clockInTime', header: 'Clock In' },
        { field: 'clockOutTime', header: 'Clock Out' },
        { field: 'totalHours', header: 'Hours Worked' },
        { field: 'status', header: 'Status' },
      ];

    <p-table
      #dt
      [value]="attendanceStore.entities()"
      [loading]="attendanceStore.loading()"
      [rows]="10"
      [columns]="columns"
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} records"
      [globalFilterFields]="[
        'userName',
        'date',
        'clockInTime',
        'clockOutTime',
        'totalHours',
        'status',
      ]"
      [tableStyle]="{ 'min-width': '75rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedAttendances"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Employee Attendance Records</h5>
          </div>

          <div class="flex items-center w-full sm:w-auto">
            <p-iconfield class="w-full">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input
                pInputText
                type="text"
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                [(ngModel)]="searchValue"
                placeholder="Search..."
                class="w-full"
              />
            </p-iconfield>
          </div>
        </div>
      </ng-template>

      <ng-template #header>
        <tr>
          @for (column of columns; track column.field) {
            <th pSortableColumn="{{ column.field }}">
              <div class="flex items-center gap-2">
                <span>{{ column.header }}</span>
                <p-sortIcon field="{{ column.field }}" />
                <p-columnFilter
                  type="text"
                  field="{{ column.field }}"
                  display="menu"
                  class="ml-auto"
                  placeholder="Filter by {{ column.header.toLowerCase() }}"
                  pTooltip="Filter by {{ column.header.toLowerCase() }}"
                  tooltipPosition="top"
                />
              </div>
            </th>
          }

          <th>
            <div class="flex items-center gap-2">
              <span>Actions</span>
              <button
                type="button"
                pButton
                icon="pi pi-filter-slash"
                class="p-button-rounded p-button-text p-button-secondary"
                pTooltip="Clear all filters"
                tooltipPosition="top"
                (click)="clearAllFilters()"
                aria-label="Clear all filters"
              ></button>
            </div>
          </th>
        </tr>
      </ng-template>

      <ng-template #body let-attendance let-columns="columns">
        <tr>
          @for (column of columns; track column.field) {
            <td>
              @if (column.field === 'status') {
                @switch (attendance.status) {
                  @case ('PRESENT') {
                    <span
                      class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                      >Present</span
                    >
                  }
                  @case ('LATE') {
                    <span
                      class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm"
                      >Late</span
                    >
                  }
                  @case ('ABSENT') {
                    <span
                      class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm"
                      >Absent</span
                    >
                  }
                  @case ('EARLY_DEPARTURE') {
                    <span
                      class="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                      >Early Departure</span
                    >
                  }
                  @case ('ON_LEAVE') {
                    <span
                      class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                      >On Leave</span
                    >
                  }
                  @default {
                    <span>{{ attendance.status }}</span>
                  }
                }
              } @else if (column.field === 'date') {
                {{ attendance.date | date: 'dd/MM/yyyy' }}
              } @else if (column.field === 'clockInTime') {
                {{ attendance.clockInTime | date: 'hh:mm a' : 'UTC-5' }}
              } @else if (column.field === 'clockOutTime') {
                {{
                  (attendance.clockOutTime | date: 'hh:mm a' : 'UTC-5') || '-'
                }}
              } @else if (column.field === 'totalHours') {
                @if (
                  attendance.totalHours !== null &&
                  attendance.totalHours !== undefined
                ) {
                  {{ attendance.totalHours | number: '1.2-2' }} h
                } @else {
                  -
                }
              } @else {
                {{ attendance[column.field] }}
              }
            </td>
          }

          <td>
            <p-button
              icon="pi pi-clock"
              class="mr-2"
              severity="success"
              rounded
              outlined
              (click)="clockOut(attendance)"
              pTooltip="Clock out"
              tooltipPosition="top"
              [disabled]="
                !!attendance.clockOutTime ||
                attendanceStore.loading() ||
                !attendance.clockInTime
              "
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (attendanceStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error loading records:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Retry"
                        (onClick)="attendanceStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="attendanceStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No attendance records found.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class AttendanceTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly attendanceStore = inject(AttendanceStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedAttendances = linkedSignal<
    AttendanceInfo[],
    AttendanceInfo[]
  >({
    source: this.attendanceStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: AttendanceInfo) => id));
      return prevSelected.filter(({ id }: AttendanceInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  clockOut({ id, userName }: AttendanceInfo): void {
    this.confirmationService.confirm({
      header: 'Clock Out',
      message: `Are you sure you want to clock out <b>${userName}</b>?`,
      accept: () => {
        this.attendanceStore.clockOut({
          attendanceId: id,
        });
      },
    });
  }
}
