import { Component, effect, inject, untracked } from '@angular/core';
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
import { SelectModule } from 'primeng/select';
import { CustomerStore } from '../../../stores/customer.store';

@Component({
  selector: 'app-customer-dialog',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      [visible]="customerStore.dialogVisible()"
      (visibleChange)="
        $event
          ? customerStore.openCustomerDialog()
          : customerStore.closeCustomerDialog()
      "
      [style]="{ width: '90vw', maxWidth: '800px' }"
      [header]="
        customerStore.selectedCustomer() ? 'Editar Cliente' : 'Nuevo Cliente'
      "
      modal
    >
      <form [formGroup]="customerForm" class="flex flex-col gap-4 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-1">
            @let firstNameControlInvalid =
              customerForm.get('firstName')?.invalid &&
              customerForm.get('firstName')?.touched;

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
              customerForm.get('lastName')?.invalid &&
              customerForm.get('lastName')?.touched;

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
              customerForm.get('documentId')?.invalid &&
              customerForm.get('documentId')?.touched;

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
              customerForm.get('email')?.invalid &&
              customerForm.get('email')?.touched;

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
                @if (customerForm.get('email')?.errors?.['required']) {
                  <small class="text-red-500">El email es obligatorio.</small>
                } @else if (customerForm.get('email')?.errors?.['email']) {
                  <small class="text-red-500">Ingrese un email válido.</small>
                }
              }
            </div>
          </div>

          <div class="col-span-1 md:col-span-2">
            @let addressControlInvalid =
              customerForm.get('address')?.invalid &&
              customerForm.get('address')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="addressControlInvalid"
            >
              <label for="address" class="font-bold">Dirección</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-map-marker"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="address"
                  formControlName="address"
                  placeholder="Ingrese la dirección"
                  [class.ng-dirty]="addressControlInvalid"
                  [class.ng-invalid]="addressControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>

              @if (addressControlInvalid) {
                <small class="text-red-500">La dirección es obligatoria.</small>
              }
            </div>
          </div>

          <div class="col-span-1">
            @let statusControlInvalid =
              customerForm.get('status')?.invalid &&
              customerForm.get('status')?.touched;

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
          (click)="customerStore.closeCustomerDialog()"
        />

        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="
            customerForm.valid
              ? saveCustomer()
              : customerForm.markAllAsTouched()
          "
          [disabled]="customerStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class CustomerDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly customerStore = inject(CustomerStore);

  readonly statuses = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' },
    { label: 'Bloqueado', value: 'BLOCKED' },
  ];

  readonly customerForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    documentId: ['', [Validators.required]],
    phoneNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required]],
    status: ['ACTIVE', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const customer = this.customerStore.selectedCustomer();
      untracked(() => {
        if (customer) {
          this.customerForm.patchValue(customer);
        } else {
          this.customerForm.reset({
            status: 'ACTIVE',
          });
        }
      });
    });
  }

  saveCustomer(): void {
    const customerData = this.customerForm.value;
    const selectedCustomer = this.customerStore.selectedCustomer();

    if (selectedCustomer) {
      this.customerStore.update({
        id: selectedCustomer.id,
        customerData,
      });
    } else {
      this.customerStore.create(customerData);
    }
    this.customerStore.closeCustomerDialog();
  }
}
