import { Component, effect, inject, signal, untracked } from '@angular/core';
import { Field, form, required } from '@angular/forms/signals';
import { UserStore } from '@features/configuration/stores/user-store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ScheduleData } from '../../../models/schedule.model';
import { ScheduleStore } from '../../../stores/schedule-store';

@Component({
  selector: 'app-schedule-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    Select,
    Field,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      [header]="
        scheduleStore.selectedSchedule() ? 'Edit Schedule' : 'New Schedule'
      "
      [visible]="scheduleStore.dialogVisible()"
      (visibleChange)="
        $event
          ? scheduleStore.openScheduleDialog()
          : scheduleStore.closeScheduleDialog()
      "
      [modal]="true"
      [style]="{ width: '500px' }"
      modal
    >
      <form
        (submit)="$event.preventDefault(); onSubmit()"
        class="flex flex-col gap-4 pt-4"
      >
        @let userIdInvalid =
          scheduleForm.userId().invalid() && scheduleForm.userId().touched();
        @let userIdErrors = scheduleForm.userId().errors();

        <div class="flex flex-col gap-2" [class.p-invalid]="userIdInvalid">
          <label for="userId" class="font-bold">Employee</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-user"></i>
            </p-inputgroup-addon>
            <p-select
              id="userId"
              [field]="scheduleForm.userId"
              [options]="userStore.entities()"
              optionLabel="name"
              optionValue="id"
              placeholder="Select an employee"
              [class.ng-dirty]="userIdInvalid"
              [class.ng-invalid]="userIdInvalid"
              appendTo="body"
              styleClass="w-full"
              filter
              filterBy="name"
            />
          </p-inputgroup>
          @if (userIdInvalid) {
            <ul>
              @for (error of userIdErrors; track error.kind) {
                <li class="text-red-500">{{ error.message }}</li>
              }
            </ul>
          }
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @let dayInvalid =
            scheduleForm.day().invalid() && scheduleForm.day().touched();
          @let dayErrors = scheduleForm.day().errors();
          <div class="flex flex-col gap-2" [class.p-invalid]="dayInvalid">
            <label for="day" class="font-bold">Day of Week</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-calendar"></i>
              </p-inputgroup-addon>
              <p-select
                id="day"
                [field]="scheduleForm.day"
                [options]="[
                  { label: 'Monday', value: 'Monday' },
                  { label: 'Tuesday', value: 'Tuesday' },
                  { label: 'Wednesday', value: 'Wednesday' },
                  { label: 'Thursday', value: 'Thursday' },
                  { label: 'Friday', value: 'Friday' },
                  { label: 'Saturday', value: 'Saturday' },
                  { label: 'Sunday', value: 'Sunday' },
                ]"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a day"
                [class.ng-dirty]="dayInvalid"
                [class.ng-invalid]="dayInvalid"
                appendTo="body"
                styleClass="w-full"
                scrollHeight="300px"
              />
            </p-inputgroup>
            @if (dayInvalid) {
              <ul>
                @for (error of dayErrors; track error.kind) {
                  <li class="text-red-500">{{ error.message }}</li>
                }
              </ul>
            }
          </div>

          @let typeInvalid =
            scheduleForm.type().invalid() && scheduleForm.type().touched();
          @let typeErrors = scheduleForm.type().errors();
          <div class="flex flex-col gap-2" [class.p-invalid]="typeInvalid">
            <label for="type" class="font-bold">Schedule Type</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-briefcase"></i>
              </p-inputgroup-addon>
              <p-select
                id="type"
                [field]="scheduleForm.type"
                [options]="[
                  { label: 'Regular', value: 'Regular' },
                  { label: 'Overtime', value: 'Horas Extra' },
                  { label: 'Holiday', value: 'Festivo' },
                ]"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a type"
                [class.ng-dirty]="typeInvalid"
                [class.ng-invalid]="typeInvalid"
                appendTo="body"
                styleClass="w-full"
              />
            </p-inputgroup>
            @if (typeInvalid) {
              <ul>
                @for (error of typeErrors; track error.kind) {
                  <li class="text-red-500">{{ error.message }}</li>
                }
              </ul>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @let startTimeInvalid =
            scheduleForm.startTime().invalid() &&
            scheduleForm.startTime().touched();
          @let startTimeErrors = scheduleForm.startTime().errors();
          <div class="flex flex-col gap-2" [class.p-invalid]="startTimeInvalid">
            <label for="startTime" class="font-bold">Start Time</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-clock"></i>
              </p-inputgroup-addon>
              <input
                pInputText
                id="startTime"
                [field]="scheduleForm.startTime"
                type="time"
                [class.ng-dirty]="startTimeInvalid"
                [class.ng-invalid]="startTimeInvalid"
                class="w-full"
              />
            </p-inputgroup>
            @if (startTimeInvalid) {
              <ul>
                @for (error of startTimeErrors; track error.kind) {
                  <li class="text-red-500">{{ error.message }}</li>
                }
              </ul>
            }
          </div>

          @let endTimeInvalid =
            scheduleForm.endTime().invalid() &&
            scheduleForm.endTime().touched();
          @let endTimeErrors = scheduleForm.endTime().errors();
          <div class="flex flex-col gap-2" [class.p-invalid]="endTimeInvalid">
            <label for="endTime" class="font-bold">End Time</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-clock"></i>
              </p-inputgroup-addon>
              <input
                pInputText
                id="endTime"
                [field]="scheduleForm.endTime"
                type="time"
                [class.ng-dirty]="endTimeInvalid"
                [class.ng-invalid]="endTimeInvalid"
                class="w-full"
              />
            </p-inputgroup>
            @if (endTimeInvalid) {
              <ul>
                @for (error of endTimeErrors; track error.kind) {
                  <li class="text-red-500">{{ error.message }}</li>
                }
              </ul>
            }
          </div>
        </div>
      </form>

      <ng-template #footer>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          text
          (click)="scheduleStore.closeScheduleDialog()"
        />
        <p-button
          label="Save"
          icon="pi pi-check"
          type="submit"
          (onClick)="onSubmit()"
          [disabled]="scheduleStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ScheduleDialog {
  readonly scheduleStore = inject(ScheduleStore);
  readonly userStore = inject(UserStore);

  private readonly scheduleModel = signal({
    userId: null as number | null,
    day: '',
    type: '',
    startTime: '',
    endTime: '',
    isActive: true,
  });

  readonly scheduleForm = form(this.scheduleModel, (schedule) => {
    required(schedule.userId, { message: 'Employee is required.' });
    required(schedule.day, { message: 'Day of week is required.' });
    required(schedule.type, { message: 'Schedule type is required.' });
    required(schedule.startTime, { message: 'Start time is required.' });
    required(schedule.endTime, { message: 'End time is required.' });
  });

  constructor() {
    effect(() => {
      const selectedSchedule = this.scheduleStore.selectedSchedule();
      untracked(() => {
        if (selectedSchedule) {
          const formatToTime = (dateTimeString: string | undefined): string => {
            if (!dateTimeString) return '';
            if (/^\d{2}:\d{2}(:\d{2})?$/.test(dateTimeString)) {
              return dateTimeString.substring(0, 5);
            }
            try {
              const date = new Date(dateTimeString);
              if (isNaN(date.getTime())) return '';
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              return `${hours}:${minutes}`;
            } catch (error) {
              console.warn('Error formatting time:', error);
              return '';
            }
          };

          const patchData = {
            ...selectedSchedule,
            startTime: formatToTime(
              selectedSchedule.startTime as string | undefined,
            ),
            endTime: formatToTime(
              selectedSchedule.endTime as string | undefined,
            ),
          };
          this.scheduleModel.set({
            userId: patchData.userId,
            day: patchData.day,
            type: patchData.type,
            startTime: patchData.startTime,
            endTime: patchData.endTime,
            isActive: patchData.isActive,
          });
        } else {
          this.scheduleModel.set({
            userId: null,
            day: '',
            type: '',
            startTime: '',
            endTime: '',
            isActive: true,
          });
        }
      });
    });
  }

  onSubmit(): void {
    if (this.scheduleForm().valid()) {
      this.saveSchedule();
      return;
    }

    this.scheduleForm.userId().markAsTouched();
    this.scheduleForm.day().markAsTouched();
    this.scheduleForm.type().markAsTouched();
    this.scheduleForm.startTime().markAsTouched();
    this.scheduleForm.endTime().markAsTouched();
  }

  saveSchedule(): void {
    const schedule = this.scheduleForm().value();
    const scheduleData: ScheduleData = {
      userId: schedule.userId!,
      day: schedule.day,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      type: schedule.type,
      isActive: schedule.isActive,
    };
    const id = this.scheduleStore.selectedSchedule()?.id;

    if (id) {
      this.scheduleStore.update({ id, scheduleData });
    } else {
      this.scheduleStore.create(scheduleData);
    }
    this.scheduleStore.closeScheduleDialog();
  }
}
