import { Component, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { EmployeeStore } from '../../../stores/employee.store';

@Component({
  selector: 'app-employee-dialog',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      [visible]="employeeStore.dialogVisible()"
      (visibleChange)="
        $event
          ? employeeStore.openEmployeeDialog()
          : employeeStore.closeEmployeeDialog()
      "
      [style]="{ width: '90vw', maxWidth: '800px' }"
      [header]="
        employeeStore.selectedEmployee() ? 'Editar Empleado' : 'Nuevo Empleado'
      "
      modal
    >
      <form [formGroup]="employeeForm" class="flex flex-col gap-4 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-1">
            @let firstNameControlInvalid =
              employeeForm.get('firstName')?.invalid &&
              employeeForm.get('firstName')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="firstNameControlInvalid"
            >
              <label for="firstName" class="font-bold">Nombre</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-user"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="firstName"
                  formControlName="firstName"
                  placeholder="Ingrese el nombre"
                  [class.ng-dirty]="firstNameControlInvalid"
                  [class.ng-invalid]="firstNameControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>

              @if (firstNameControlInvalid) {
                <small class="text-red-500">El nombre es obligatorio.</small>
              }
            </div>
          </div>

          <div class="col-span-1">
            @let lastNameControlInvalid =
              employeeForm.get('lastName')?.invalid &&
              employeeForm.get('lastName')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="lastNameControlInvalid"
            >
              <label for="lastName" class="font-bold">Apellido</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-user"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="lastName"
                  formControlName="lastName"
                  placeholder="Ingrese el apellido"
                  [class.ng-dirty]="lastNameControlInvalid"
                  [class.ng-invalid]="lastNameControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>

              @if (lastNameControlInvalid) {
                <small class="text-red-500">El apellido es obligatorio.</small>
              }
            </div>
          </div>

          <div class="col-span-1">
            @let documentIdControlInvalid =
              employeeForm.get('documentId')?.invalid &&
              employeeForm.get('documentId')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="documentIdControlInvalid"
            >
              <label for="documentId" class="font-bold">Documento</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-id-card"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="documentId"
                  formControlName="documentId"
                  placeholder="Ingrese el número de documento"
                  [class.ng-dirty]="documentIdControlInvalid"
                  [class.ng-invalid]="documentIdControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>

              @if (documentIdControlInvalid) {
                <small class="text-red-500">El documento es obligatorio.</small>
              }
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="phoneNumber" class="font-bold">Teléfono</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-phone"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="phoneNumber"
                  formControlName="phoneNumber"
                  placeholder="Ingrese el número de teléfono (opcional)"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1 md:col-span-2">
            @let emailControlInvalid =
              employeeForm.get('email')?.invalid &&
              employeeForm.get('email')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="emailControlInvalid"
            >
              <label for="email" class="font-bold">Email</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-envelope"></i>
                </p-inputgroup-addon>
                <input
                  type="email"
                  pInputText
                  id="email"
                  formControlName="email"
                  placeholder="Ingrese el email"
                  [class.ng-dirty]="emailControlInvalid"
                  [class.ng-invalid]="emailControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>

              @if (emailControlInvalid) {
                @if (employeeForm.get('email')?.errors?.['required']) {
                  <small class="text-red-500">El email es obligatorio.</small>
                } @else if (employeeForm.get('email')?.errors?.['email']) {
                  <small class="text-red-500">Ingrese un email válido.</small>
                }
              }
            </div>
          </div>

          <div class="col-span-1">
            @let hireDateControlInvalid =
              employeeForm.get('hireDate')?.invalid &&
              employeeForm.get('hireDate')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="hireDateControlInvalid"
            >
              <label for="hireDate" class="font-bold"
                >Fecha de Contratación</label
              >
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-calendar"></i>
                </p-inputgroup-addon>
                <p-datepicker
                  id="hireDate"
                  formControlName="hireDate"
                  dateFormat="dd/mm/yy"
                  [showIcon]="true"
                  [class.ng-dirty]="hireDateControlInvalid"
                  [class.ng-invalid]="hireDateControlInvalid"
                  placeholder="Seleccione la fecha"
                  styleClass="w-full"
                  required
                  iconDisplay="input"
                />
              </p-inputgroup>

              @if (hireDateControlInvalid) {
                <small class="text-red-500"
                  >La fecha de contratación es obligatoria.</small
                >
              }
            </div>
          </div>

          <div class="col-span-1">
            @let statusControlInvalid =
              employeeForm.get('status')?.invalid &&
              employeeForm.get('status')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="statusControlInvalid"
            >
              <label for="status" class="font-bold">Estado</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-check-circle"></i>
                </p-inputgroup-addon>
                <p-select
                  id="status"
                  formControlName="status"
                  [options]="statuses"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccione un estado"
                  [class.ng-dirty]="statusControlInvalid"
                  [class.ng-invalid]="statusControlInvalid"
                  appendTo="body"
                  styleClass="w-full"
                  required
                />
              </p-inputgroup>

              @if (statusControlInvalid) {
                <small class="text-red-500">El estado es obligatorio.</small>
              }
            </div>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="employeeStore.closeEmployeeDialog()"
        />

        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="
            employeeForm.valid
              ? saveEmployee()
              : employeeForm.markAllAsTouched()
          "
          [disabled]="employeeStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class EmployeeDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly employeeStore = inject(EmployeeStore);

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
    hireDate: [null, [Validators.required]],
    profileImageUrl: [''],
    status: ['ACTIVE', [Validators.required]],
    userId: [null, [Validators.required]],
  });

  constructor() {
    effect(() => {
      const employee = this.employeeStore.selectedEmployee();
      untracked(() => {
        if (employee) {
          this.employeeForm.patchValue({
            ...employee,
            hireDate: employee.hireDate ? new Date(employee.hireDate) : null,
          });
        } else {
          this.employeeForm.reset({
            status: 'ACTIVE',
            userId: null,
          });
        }
      });
    });
  }

  saveEmployee(): void {
    const employeeData = this.employeeForm.value;
    const selectedEmployee = this.employeeStore.selectedEmployee();

    if (selectedEmployee) {
      this.employeeStore.update({ id: selectedEmployee.id, employeeData });
    } else {
      this.employeeStore.create(employeeData);
    }
  }
}
