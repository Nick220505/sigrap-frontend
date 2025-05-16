import { Component, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { EmployeeStore } from '../../../stores/employee.store';
import { ScheduleStore } from '../../../stores/schedule.store';

@Component({
  selector: 'app-schedule-dialog',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    Select,
    CalendarModule,
    InputGroupModule,
    InputGroupAddonModule,
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
      [style]="{ width: '500px' }"
      modal
    >
      <form [formGroup]="scheduleForm" class="flex flex-col gap-4 pt-4">
        @let employeeIdControlInvalid =
          scheduleForm.get('employeeId')?.invalid &&
          scheduleForm.get('employeeId')?.touched;

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
            />
          </p-inputgroup>
          @if (employeeIdControlInvalid) {
            <small class="text-red-500">El empleado es obligatorio.</small>
          }
        </div>

        @let dayControlInvalid =
          scheduleForm.get('day')?.invalid && scheduleForm.get('day')?.touched;
        <div class="flex flex-col gap-2" [class.p-invalid]="dayControlInvalid">
          <label for="day" class="font-bold">Día de la Semana</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-calendar"></i>
            </p-inputgroup-addon>
            <p-select
              id="day"
              formControlName="day"
              [options]="daysOfWeek"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione un día"
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
              El día de la semana es obligatorio.
            </small>
          }
        </div>

        <div class="grid grid-cols-2 gap-4">
          @let startTimeControlInvalid =
            scheduleForm.get('startTime')?.invalid &&
            scheduleForm.get('startTime')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="startTimeControlInvalid"
          >
            <label for="startTime" class="font-bold">Hora de Inicio</label>
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
                >La hora de inicio es obligatoria.</small
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
            <label for="endTime" class="font-bold">Hora de Fin</label>
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
              <small class="text-red-500">La hora de fin es obligatoria.</small>
            }
          </div>
        </div>

        @let typeControlInvalid =
          scheduleForm.get('type')?.invalid &&
          scheduleForm.get('type')?.touched;
        <div class="flex flex-col gap-2" [class.p-invalid]="typeControlInvalid">
          <label for="type" class="font-bold">Tipo de Horario</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-briefcase"></i>
            </p-inputgroup-addon>
            <p-select
              id="type"
              formControlName="type"
              [options]="scheduleTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione un tipo"
              [required]="true"
              [class.ng-dirty]="typeControlInvalid"
              [class.ng-invalid]="typeControlInvalid"
              appendTo="body"
              styleClass="w-full"
            />
          </p-inputgroup>
          @if (typeControlInvalid) {
            <small class="text-red-500">
              El tipo de horario es obligatorio.
            </small>
          }
        </div>
      </form>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="scheduleStore.closeScheduleDialog()"
        />
        <p-button
          label="Guardar"
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
    day: ['', [Validators.required]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    type: ['REGULAR', [Validators.required]],
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
          this.scheduleForm.reset({
            type: 'REGULAR',
            employeeId: null,
            day: '',
            startTime: '',
            endTime: '',
          });
        }
      });
    });
  }

  saveSchedule(): void {
    const scheduleData = this.scheduleForm.value;
    const id = this.scheduleStore.selectedSchedule()?.id;

    if (id) {
      this.scheduleStore.update({
        id,
        scheduleData,
      });
    } else {
      this.scheduleStore.create(scheduleData);
    }
    this.scheduleStore.closeScheduleDialog();
  }
}
