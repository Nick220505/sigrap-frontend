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

@Component({
  selector: 'app-employee-dialog',
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
        employeeStore.selectedEmployee() ? 'Editar Empleado' : 'Nuevo Empleado'
      "
      [visible]="employeeStore.dialogVisible()"
      (visibleChange)="
        $event
          ? employeeStore.openEmployeeDialog()
          : employeeStore.closeEmployeeDialog()
      "
      [modal]="true"
      [style]="{ width: '450px' }"
      class="p-fluid"
    >
      <form [formGroup]="employeeForm" (ngSubmit)="saveEmployee()">
        <div class="field">
          <label for="firstName">Nombre</label>
          <input
            pInputText
            id="firstName"
            formControlName="firstName"
            required
          />
        </div>

        <div class="field">
          <label for="lastName">Apellido</label>
          <input pInputText id="lastName" formControlName="lastName" required />
        </div>

        <div class="field">
          <label for="documentId">Documento</label>
          <input
            pInputText
            id="documentId"
            formControlName="documentId"
            required
          />
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input pInputText id="email" formControlName="email" required />
        </div>

        <div class="field">
          <label for="phoneNumber">Teléfono</label>
          <input pInputText id="phoneNumber" formControlName="phoneNumber" />
        </div>

        <div class="field">
          <label for="position">Cargo</label>
          <input pInputText id="position" formControlName="position" required />
        </div>

        <div class="field">
          <label for="department">Departamento</label>
          <p-dropdown
            id="department"
            formControlName="department"
            [options]="departments"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione un departamento"
            [required]="true"
          ></p-dropdown>
        </div>

        <div class="field">
          <label for="hireDate">Fecha de Contratación</label>
          <p-calendar
            id="hireDate"
            formControlName="hireDate"
            dateFormat="dd/mm/yy"
            [showIcon]="true"
            [required]="true"
          ></p-calendar>
        </div>

        <div class="field">
          <label for="status">Estado</label>
          <p-dropdown
            id="status"
            formControlName="status"
            [options]="statuses"
            optionLabel="label"
            optionValue="value"
            placeholder="Seleccione un estado"
            [required]="true"
          ></p-dropdown>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          styleClass="p-button-text"
          (onClick)="employeeStore.closeEmployeeDialog()"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          styleClass="p-button-text"
          (onClick)="saveEmployee()"
          [disabled]="!employeeForm.valid"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class EmployeeDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly employeeStore = inject(EmployeeStore);

  readonly departments = [
    { label: 'Ventas', value: 'SALES' },
    { label: 'Almacén', value: 'WAREHOUSE' },
    { label: 'Administración', value: 'ADMIN' },
    { label: 'Soporte', value: 'SUPPORT' },
  ];

  readonly statuses = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' },
    { label: 'Terminado', value: 'TERMINATED' },
    { label: 'Prueba', value: 'PROBATION' },
  ];

  readonly employeeForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    documentId: ['', [Validators.required]],
    phoneNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    position: ['', [Validators.required]],
    department: ['', [Validators.required]],
    hireDate: [null, [Validators.required]],
    profileImageUrl: [''],
    status: ['ACTIVE'],
  });

  constructor() {
    const selectedEmployee = this.employeeStore.selectedEmployee();
    if (selectedEmployee) {
      this.employeeForm.patchValue({
        ...selectedEmployee,
        hireDate: new Date(selectedEmployee.hireDate),
      });
    }
  }

  saveEmployee(): void {
    if (this.employeeForm.valid) {
      const employeeData = this.employeeForm.value;
      const selectedEmployee = this.employeeStore.selectedEmployee();

      if (selectedEmployee) {
        this.employeeStore.update({
          id: selectedEmployee.id,
          employeeData,
        });
      } else {
        this.employeeStore.create(employeeData);
      }
    }
  }
}
