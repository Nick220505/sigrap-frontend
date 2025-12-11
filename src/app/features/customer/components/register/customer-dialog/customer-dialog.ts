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
import { CustomerStore } from '../../../stores/customer-store';

@Component({
  selector: 'app-customer-dialog',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
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
        customerStore.selectedCustomer() ? 'Edit Customer' : 'New Customer'
      "
      modal
    >
      <form [formGroup]="customerForm" class="flex flex-col gap-4 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-1 md:col-span-2">
            @let fullNameControlInvalid =
              customerForm.get('fullName')?.invalid &&
              customerForm.get('fullName')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="fullNameControlInvalid"
            >
              <label for="fullName" class="font-bold">Full Name</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-user"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="fullName"
                  formControlName="fullName"
                  placeholder="Enter full name"
                  [class.ng-dirty]="fullNameControlInvalid"
                  [class.ng-invalid]="fullNameControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>

              @if (fullNameControlInvalid) {
                <small class="text-red-500">Full name is required.</small>
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
              <label for="documentId" class="font-bold">Document</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-id-card"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="documentId"
                  formControlName="documentId"
                  placeholder="Enter document number"
                  [class.ng-dirty]="documentIdControlInvalid"
                  [class.ng-invalid]="documentIdControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>

              @if (documentIdControlInvalid) {
                <small class="text-red-500">Document is required.</small>
              }
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="phoneNumber" class="font-bold">Phone</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-phone"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="phoneNumber"
                  formControlName="phoneNumber"
                  placeholder="Enter phone number (optional)"
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
                  placeholder="Enter email"
                  [class.ng-dirty]="emailControlInvalid"
                  [class.ng-invalid]="emailControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>

              @if (emailControlInvalid) {
                @if (customerForm.get('email')?.errors?.['required']) {
                  <small class="text-red-500">Email is required.</small>
                } @else if (customerForm.get('email')?.errors?.['email']) {
                  <small class="text-red-500">Enter a valid email.</small>
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
              <label for="address" class="font-bold">Address</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-map-marker"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="address"
                  formControlName="address"
                  placeholder="Enter address"
                  [class.ng-dirty]="addressControlInvalid"
                  [class.ng-invalid]="addressControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>

              @if (addressControlInvalid) {
                <small class="text-red-500">Address is required.</small>
              }
            </div>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancel"
          icon="pi pi-times"
          text
          (click)="customerStore.closeCustomerDialog()"
        />

        <p-button
          label="Save"
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
export class CustomerDialog {
  private readonly fb = inject(FormBuilder);
  readonly customerStore = inject(CustomerStore);

  readonly customerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    documentId: ['', [Validators.required]],
    phoneNumber: [''],
    email: ['', [Validators.required, Validators.email]],
    address: ['', [Validators.required]],
  });

  constructor() {
    effect(() => {
      const customer = this.customerStore.selectedCustomer();
      untracked(() => {
        if (customer) {
          this.customerForm.patchValue(customer);
        } else {
          this.customerForm.reset();
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
