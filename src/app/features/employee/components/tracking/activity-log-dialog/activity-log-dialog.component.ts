import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ActivityLogStore } from '../../../stores/activity-log.store';
import { EmployeeStore } from '../../../stores/employee.store';

@Component({
  selector: 'app-activity-log-dialog',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    Select,
    TextareaModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      [header]="
        activityLogStore.selectedActivityLog()
          ? 'Editar Actividad'
          : 'Nueva Actividad'
      "
      [visible]="activityLogStore.dialogVisible()"
      (visibleChange)="activityLogStore.closeActivityLogDialog()"
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <form [formGroup]="activityForm" class="flex flex-col gap-4 pt-4">
        @let employeeIdControlInvalid =
          activityForm.get('employeeId')?.invalid &&
          activityForm.get('employeeId')?.touched;
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

        @let activityTypeControlInvalid =
          activityForm.get('activityType')?.invalid &&
          activityForm.get('activityType')?.touched;
        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="activityTypeControlInvalid"
        >
          <label for="activityType" class="font-bold">Tipo de Actividad</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-briefcase"></i>
            </p-inputgroup-addon>
            <p-select
              id="activityType"
              formControlName="activityType"
              [options]="activityTypes"
              optionLabel="label"
              optionValue="value"
              placeholder="Seleccione un tipo"
              [required]="true"
              [class.ng-dirty]="activityTypeControlInvalid"
              [class.ng-invalid]="activityTypeControlInvalid"
              appendTo="body"
              styleClass="w-full"
              showClear
            />
          </p-inputgroup>
          @if (activityTypeControlInvalid) {
            <small class="text-red-500">
              El tipo de actividad es obligatorio.
            </small>
          }
        </div>

        @let descriptionControlInvalid =
          activityForm.get('description')?.invalid &&
          activityForm.get('description')?.touched;
        <div
          class="flex flex-col gap-2"
          [class.p-invalid]="descriptionControlInvalid"
        >
          <label for="description" class="font-bold">Descripción</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-align-left"></i>
            </p-inputgroup-addon>
            <textarea
              pInputTextarea
              id="description"
              formControlName="description"
              rows="3"
              placeholder="Ingrese una descripción"
              [required]="true"
              [class.ng-dirty]="descriptionControlInvalid"
              [class.ng-invalid]="descriptionControlInvalid"
              class="w-full"
            ></textarea>
          </p-inputgroup>
          @if (descriptionControlInvalid) {
            <small class="text-red-500">La descripción es obligatoria.</small>
          }
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (onClick)="activityLogStore.closeActivityLogDialog()"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          (onClick)="
            activityForm.valid
              ? saveActivity()
              : activityForm.markAllAsTouched()
          "
        />
      </ng-template>
    </p-dialog>
  `,
})
export class ActivityLogDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly activityLogStore = inject(ActivityLogStore);
  readonly employeeStore = inject(EmployeeStore);

  readonly activityTypes = [
    { label: 'Tarea', value: 'TASK' },
    { label: 'Descanso', value: 'BREAK' },
    { label: 'Reunión', value: 'MEETING' },
    { label: 'Capacitación', value: 'TRAINING' },
  ];

  readonly activityForm: FormGroup = this.fb.group({
    employeeId: [null, [Validators.required]],
    activityType: ['', [Validators.required]],
    description: ['', [Validators.required]],
  });

  constructor() {
    const selectedActivity = this.activityLogStore.selectedActivityLog();
    if (selectedActivity) {
      this.activityForm.patchValue(selectedActivity);
    }
  }

  saveActivity(): void {
    const activityData = this.activityForm.value;
    const selectedActivity = this.activityLogStore.selectedActivityLog();

    if (selectedActivity) {
      this.activityLogStore.update({
        id: selectedActivity.id,
        activityData,
      });
    } else {
      this.activityLogStore.create(activityData);
    }
  }
}
