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
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
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
    DropdownModule,
    TextareaModule,
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
      [style]="{ width: '450px' }"
      class="p-fluid"
    >
      <form [formGroup]="activityForm" (ngSubmit)="saveActivity()">
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
          <label for="activityType">Tipo de Actividad</label>
          <p-dropdown
            id="activityType"
            formControlName="activityType"
            [options]="activityTypes"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione un tipo"
            [required]="true"
          ></p-dropdown>
        </div>

        <div class="field">
          <label for="description">Descripción</label>
          <textarea
            pInputTextarea
            id="description"
            formControlName="description"
            rows="4"
            required
          ></textarea>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          styleClass="p-button-text"
          (onClick)="activityLogStore.closeActivityLogDialog()"
        ></p-button>
        <p-button
          label="Guardar"
          icon="pi pi-check"
          styleClass="p-button-text"
          (onClick)="saveActivity()"
          [disabled]="!activityForm.valid"
        ></p-button>
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
    if (this.activityForm.valid) {
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
}
