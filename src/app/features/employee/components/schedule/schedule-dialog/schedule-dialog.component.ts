import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { EmployeeStore } from '../../../stores/employee.store';
import { ScheduleStore } from '../../../stores/schedule.store';

@Component({
  selector: 'app-schedule-dialog',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
  ],
  template: `
    <p-dialog
      [header]="
        scheduleStore.selectedSchedule() ? 'Editar Horario' : 'Nuevo Horario'
      "
      [visible]="scheduleStore.dialogVisible()"
      (visibleChange)="
        $event
          ? scheduleStore.openScheduleDialog()
          : scheduleStore.closeScheduleDialog()
      "
      [modal]="true"
      [style]="{ width: '450px' }"
      class="p-fluid"
    >
      <form [formGroup]="scheduleForm" (ngSubmit)="saveSchedule()">
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

        <div class="field">
          <label for="dayOfWeek">Día de la Semana</label>
          <p-dropdown
            id="dayOfWeek"
            formControlName="dayOfWeek"
            [options]="daysOfWeek"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione un día"
            [required]="true"
          ></p-dropdown>
        </div>

        <div class="field">
          <label for="startTime">Hora de Inicio</label>
          <input
            pInputText
            id="startTime"
            formControlName="startTime"
            type="time"
            required
          />
        </div>

        <div class="field">
          <label for="endTime">Hora de Fin</label>
          <input
            pInputText
            id="endTime"
            formControlName="endTime"
            type="time"
            required
          />
        </div>

        <div class="field">
          <label for="type">Tipo de Horario</label>
          <p-dropdown
            id="type"
            formControlName="type"
            [options]="scheduleTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione un tipo"
            [required]="true"
          ></p-dropdown>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          styleClass="p-button-text"
          (onClick)="scheduleStore.closeScheduleDialog()"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          styleClass="p-button-text"
          (onClick)="saveSchedule()"
          [disabled]="!scheduleForm.valid"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ScheduleDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly scheduleStore = inject(ScheduleStore);
  readonly employeeStore = inject(EmployeeStore);

  readonly daysOfWeek = [
    { label: 'Lunes', value: 'MONDAY' },
    { label: 'Martes', value: 'TUESDAY' },
    { label: 'Miércoles', value: 'WEDNESDAY' },
    { label: 'Jueves', value: 'THURSDAY' },
    { label: 'Viernes', value: 'FRIDAY' },
    { label: 'Sábado', value: 'SATURDAY' },
    { label: 'Domingo', value: 'SUNDAY' },
  ];

  readonly scheduleTypes = [
    { label: 'Regular', value: 'REGULAR' },
    { label: 'Horas Extra', value: 'OVERTIME' },
    { label: 'Festivo', value: 'HOLIDAY' },
  ];

  readonly scheduleForm: FormGroup = this.fb.group({
    employeeId: [null, [Validators.required]],
    dayOfWeek: ['', [Validators.required]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    type: ['REGULAR', [Validators.required]],
  });

  constructor() {
    const selectedSchedule = this.scheduleStore.selectedSchedule();
    if (selectedSchedule) {
      this.scheduleForm.patchValue(selectedSchedule);
    }
  }

  saveSchedule(): void {
    if (this.scheduleForm.valid) {
      const scheduleData = this.scheduleForm.value;
      const selectedSchedule = this.scheduleStore.selectedSchedule();

      if (selectedSchedule) {
        this.scheduleStore.update({
          id: selectedSchedule.id,
          scheduleData,
        });
      } else {
        this.scheduleStore.create(scheduleData);
      }
    }
  }
}
