import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, required } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from '@features/configuration/stores/user-store';
import { AttendanceStore } from '@features/employee/stores/attendance-store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-clock-in-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    Select,
    FormsModule,
    InputGroupModule,
    InputGroupAddonModule,
    TranslateModule,
  ],
  template: `
    <p-dialog
      [header]="'employees.clockInDialog.title' | translate"
      [visible]="attendanceStore.clockInDialogVisible()"
      (visibleChange)="
        $event
          ? attendanceStore.openClockInDialog()
          : attendanceStore.closeClockInDialog()
      "
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <form
        (submit)="$event.preventDefault(); onSubmit()"
        class="flex flex-col gap-4 pt-4"
      >
        @let userIdInvalid =
          clockInForm.userId().invalid() && clockInForm.userId().touched();
        @let userIdErrors = clockInForm.userId().errors();
        <div class="flex flex-col gap-2" [class.p-invalid]="userIdInvalid">
          <label for="userId" class="font-bold">{{ 'employees.clockInDialog.employeeLabel' | translate }}</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-user"></i>
            </p-inputgroup-addon>
            <p-select
              id="userId"
              [ngModel]="clockInForm.userId().value()"
              (ngModelChange)="clockInForm.userId().value.set($event)"
              [ngModelOptions]="{ standalone: true }"
              [options]="userStore.entities()"
              optionLabel="name"
              optionValue="id"
              [placeholder]="'employees.clockInDialog.employeePlaceholder' | translate"
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
      </form>

      <ng-template pTemplate="footer">
        <p-button
          [label]="'common.cancel' | translate"
          icon="pi pi-times"
          text
          (onClick)="attendanceStore.closeClockInDialog()"
        />
        <p-button
          [label]="'employees.clockInDialog.clockInButton' | translate"
          icon="pi pi-check"
          type="submit"
          (onClick)="onSubmit()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ClockInDialog {
  readonly attendanceStore = inject(AttendanceStore);
  readonly userStore = inject(UserStore);

  private readonly clockInModel = signal<{ userId: number | null }>({
    userId: null,
  });

  readonly clockInForm = form(this.clockInModel, (clockIn) => {
    required(clockIn.userId, { message: 'validation.required' });
  });

  onSubmit(): void {
    if (this.clockInForm().valid()) {
      const clockIn = this.clockInForm().value();
      this.attendanceStore.clockIn({ userId: clockIn.userId! });
      return;
    }

    this.clockInForm.userId().markAsTouched();
  }
}
