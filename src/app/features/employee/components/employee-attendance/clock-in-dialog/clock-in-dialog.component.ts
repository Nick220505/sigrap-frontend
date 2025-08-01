import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserStore } from '@features/configuration/stores/user.store';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-clock-in-dialog',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    Select,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      header="Registrar Entrada"
      [visible]="attendanceStore.clockInDialogVisible()"
      (visibleChange)="
        $event
          ? attendanceStore.openClockInDialog()
          : attendanceStore.closeClockInDialog()
      "
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <form [formGroup]="clockInForm" class="flex flex-col gap-4 pt-4">
        @let userIdControlInvalid =
          clockInForm.get('userId')?.invalid &&
          clockInForm.get('userId')?.touched;
        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="userIdControlInvalid"
        >
          <label for="userId" class="font-bold">Empleado</label>
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
              placeholder="Seleccione un empleado"
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
            <small class="text-red-500">El empleado es obligatorio.</small>
          }
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (onClick)="attendanceStore.closeClockInDialog()"
        />
        <p-button
          label="Registrar"
          icon="pi pi-check"
          (onClick)="
            clockInForm.valid
              ? attendanceStore.clockIn(this.clockInForm.value)
              : clockInForm.markAllAsTouched()
          "
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ClockInDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly attendanceStore = inject(AttendanceStore);
  readonly userStore = inject(UserStore);

  readonly clockInForm: FormGroup = this.fb.group({
    userId: [null, [Validators.required]],
  });
}
