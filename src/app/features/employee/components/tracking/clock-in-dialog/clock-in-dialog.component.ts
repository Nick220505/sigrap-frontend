import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { AttendanceStore } from '../../../stores/attendance.store';
import { EmployeeStore } from '../../../stores/employee.store';

@Component({
  selector: 'app-clock-in-dialog',
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, DropdownModule],
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
      [style]="{ width: '450px' }"
      class="p-fluid"
    >
      <form [formGroup]="clockInForm" (ngSubmit)="clockIn()">
        <div class="field">
          <label for="employeeId">Empleado</label>
          <p-dropdown
            id="employeeId"
            formControlName="employeeId"
            [options]="employeeStore.entities()"
            optionLabel="firstName"
            optionValue="id"
            placeholder="Seleccione un empleado"
            [required]="true"
          ></p-dropdown>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          styleClass="p-button-text"
          (onClick)="attendanceStore.closeClockInDialog()"
        />
        <p-button
          label="Registrar"
          icon="pi pi-check"
          styleClass="p-button-text"
          (onClick)="clockIn()"
          [disabled]="!clockInForm.valid"
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

  clockIn(): void {
    if (this.clockInForm.valid) {
      this.attendanceStore.clockIn(this.clockInForm.value);
    }
  }
}
