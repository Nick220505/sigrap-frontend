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
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { EmployeeStore } from '../../../stores/employee.store';
import { PerformanceStore } from '../../../stores/performance.store';

@Component({
  selector: 'app-performance-dialog',
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InputNumberModule,
  ],
  template: `
    <p-dialog
      [header]="
        performanceStore.selectedPerformance()
          ? 'Editar Evaluación'
          : 'Nueva Evaluación'
      "
      [visible]="performanceStore.dialogVisible()"
      (visibleChange)="
        $event
          ? performanceStore.openPerformanceDialog()
          : performanceStore.closePerformanceDialog()
      "
      [modal]="true"
      [style]="{ width: '450px' }"
      class="p-fluid"
    >
      <form [formGroup]="performanceForm" (ngSubmit)="savePerformance()">
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
          <label for="evaluatorId">Evaluador</label>
          <p-dropdown
            id="evaluatorId"
            formControlName="evaluatorId"
            [options]="employeeStore.entities()"
            optionLabel="firstName"
            optionValue="id"
            placeholder="Seleccione un evaluador"
            [required]="true"
          ></p-dropdown>
        </div>

        <div class="field">
          <label for="period">Periodo</label>
          <input pInputText id="period" formControlName="period" required />
        </div>

        <div class="field">
          <label for="rating">Calificación</label>
          <p-inputNumber
            id="rating"
            formControlName="rating"
            [min]="1"
            [max]="5"
            [step]="0.5"
            [required]="true"
          ></p-inputNumber>
        </div>

        <div class="field">
          <label for="evaluationDate">Fecha de Evaluación</label>
          <p-calendar
            id="evaluationDate"
            formControlName="evaluationDate"
            dateFormat="dd/mm/yy"
            [showIcon]="true"
            [required]="true"
          ></p-calendar>
        </div>

        <div class="field">
          <label for="comments">Comentarios</label>
          <textarea
            pInputText
            id="comments"
            formControlName="comments"
            rows="4"
          ></textarea>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          styleClass="p-button-text"
          (onClick)="performanceStore.closePerformanceDialog()"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          styleClass="p-button-text"
          (onClick)="savePerformance()"
          [disabled]="!performanceForm.valid"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class PerformanceDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly performanceStore = inject(PerformanceStore);
  readonly employeeStore = inject(EmployeeStore);

  readonly performanceForm: FormGroup = this.fb.group({
    employeeId: [null, [Validators.required]],
    evaluatorId: [null, [Validators.required]],
    period: ['', [Validators.required]],
    rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
    evaluationDate: [null, [Validators.required]],
    comments: [''],
  });

  constructor() {
    const selectedPerformance = this.performanceStore.selectedPerformance();
    if (selectedPerformance) {
      this.performanceForm.patchValue({
        ...selectedPerformance,
        evaluationDate: new Date(selectedPerformance.evaluationDate),
      });
    }
  }

  savePerformance(): void {
    if (this.performanceForm.valid) {
      const performanceData = this.performanceForm.value;
      const selectedPerformance = this.performanceStore.selectedPerformance();

      if (selectedPerformance) {
        this.performanceStore.update({
          id: selectedPerformance.id,
          performanceData,
        });
      } else {
        this.performanceStore.create(performanceData);
      }
    }
  }
}
