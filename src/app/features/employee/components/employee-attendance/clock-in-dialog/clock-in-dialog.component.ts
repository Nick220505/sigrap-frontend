import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { AttendanceStore } from '@features/employee/stores/attendance.store';
import { EmployeeStore } from '@features/employee/stores/employee.store';

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
        @let employeeIdControlInvalid =
          clockInForm.get('employeeId')?.invalid &&
          clockInForm.get('employeeId')?.touched;
        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="employeeIdControlInvalid"
        >
          <label for="employeeId" class="font-bold">Empleado</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-user"></i>
            </p-inputgroup-addon>
            <p-select
              id="employeeId"
              formControlName="employeeId"
              [options]="employeeStore.entities()"
              optionLabel="firstName"
              optionValue="id"
              placeholder="Seleccione un empleado"
              [required]="true"
              [class.ng-dirty]="employeeIdControlInvalid"
              [class.ng-invalid]="employeeIdControlInvalid"
              appendTo="body"
              styleClass="w-full"
              filter
              filterBy="firstName"
              showClear
            />
          </p-inputgroup>
          @if (employeeIdControlInvalid) {
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
  readonly employeeStore = inject(EmployeeStore);

  readonly clockInForm: FormGroup = this.fb.group({
    employeeId: [null, [Validators.required]],
  });
}
