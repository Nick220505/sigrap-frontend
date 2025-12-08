import { Component, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserStore } from '@features/configuration/stores/user.store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { ScheduleStore } from '../../../stores/schedule.store';

@Component({
  selector: 'app-schedule-dialog',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    Select,
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
      <form [formGroup]="scheduleForm" class="flex flex-col gap-4 pt-4">
        @let userIdControlInvalid =
          scheduleForm.get('userId')?.invalid &&
          scheduleForm.get('userId')?.touched;

        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="userIdControlInvalid"
        >
          <label for="userId" class="font-bold">Employee</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-user"></i>
            </p-inputgroup-addon>
            <p-select
              id="userId"
              formControlName="userId"
              [options]="userStore.entities()"
              optionLabel="name"
              optionValue="id"
              placeholder="Select an employee"
              [required]="true"
              [class.ng-dirty]="userIdControlInvalid"
              [class.ng-invalid]="userIdControlInvalid"
              appendTo="body"
              styleClass="w-full"
              filter
              filterBy="name"
            />
          </p-inputgroup>
          @if (userIdControlInvalid) {
            <small class="text-red-500">Employee is required.</small>
          }
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @let dayControlInvalid =
            scheduleForm.get('day')?.invalid &&
            scheduleForm.get('day')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="dayControlInvalid"
          >
            <label for="day" class="font-bold">Day of Week</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-calendar"></i>
              </p-inputgroup-addon>
              <p-select
                id="day"
                formControlName="day"
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
                [required]="true"
                [class.ng-dirty]="dayControlInvalid"
                [class.ng-invalid]="dayControlInvalid"
                appendTo="body"
                styleClass="w-full"
                scrollHeight="300px"
              />
            </p-inputgroup>
            @if (dayControlInvalid) {
              <small class="text-red-500">
                Day of week is required.
              </small>
            }
          </div>

          @let typeControlInvalid =
            scheduleForm.get('type')?.invalid &&
            scheduleForm.get('type')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="typeControlInvalid"
          >
            <label for="type" class="font-bold">Schedule Type</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-briefcase"></i>
              </p-inputgroup-addon>
              <p-select
                id="type"
                formControlName="type"
                [options]="[
                  { label: 'Regular', value: 'Regular' },
                  { label: 'Overtime', value: 'Horas Extra' },
                  { label: 'Holiday', value: 'Festivo' },
                ]"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a type"
                [required]="true"
                [class.ng-dirty]="typeControlInvalid"
                [class.ng-invalid]="typeControlInvalid"
                appendTo="body"
                styleClass="w-full"
              />
            </p-inputgroup>
            @if (typeControlInvalid) {
              <small class="text-red-500">
                Schedule type is required.
              </small>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          @let startTimeControlInvalid =
            scheduleForm.get('startTime')?.invalid &&
            scheduleForm.get('startTime')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="startTimeControlInvalid"
          >
            <label for="startTime" class="font-bold">Start Time</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-clock"></i>
              </p-inputgroup-addon>
              <input
                pInputText
                id="startTime"
                formControlName="startTime"
                type="time"
                [required]="true"
                [class.ng-dirty]="startTimeControlInvalid"
                [class.ng-invalid]="startTimeControlInvalid"
                class="w-full"
              />
            </p-inputgroup>
            @if (startTimeControlInvalid) {
              <small class="text-red-500"
                >Start time is required.</small
              >
            }
          </div>

          @let endTimeControlInvalid =
            scheduleForm.get('endTime')?.invalid &&
            scheduleForm.get('endTime')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="endTimeControlInvalid"
          >
            <label for="endTime" class="font-bold">End Time</label>
            <p-inputgroup>
              <p-inputgroup-addon>
                <i class="pi pi-clock"></i>
              </p-inputgroup-addon>
              <input
                pInputText
                id="endTime"
                formControlName="endTime"
                type="time"
                [required]="true"
                [class.ng-dirty]="endTimeControlInvalid"
                [class.ng-invalid]="endTimeControlInvalid"
                class="w-full"
              />
            </p-inputgroup>
            @if (endTimeControlInvalid) {
              <small class="text-red-500">End time is required.</small>
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
          (click)="
            scheduleForm.valid
              ? saveSchedule()
              : scheduleForm.markAllAsTouched()
          "
          [disabled]="scheduleStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ScheduleDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly scheduleStore = inject(ScheduleStore);
  readonly userStore = inject(UserStore);

  readonly scheduleForm: FormGroup = this.fb.group({
    userId: [null, [Validators.required]],
    day: ['', [Validators.required]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    type: ['', [Validators.required]],
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
          this.scheduleForm.patchValue(patchData);
        } else {
          this.scheduleForm.reset();
        }
      });
    });
  }

  saveSchedule(): void {
    const scheduleData = this.scheduleForm.value;
    const id = this.scheduleStore.selectedSchedule()?.id;

    if (id) {
      this.scheduleStore.update({ id, scheduleData });
    } else {
      this.scheduleStore.create(scheduleData);
    }
    this.scheduleStore.closeScheduleDialog();
  }
}
