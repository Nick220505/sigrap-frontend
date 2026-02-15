import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { CustomerStore } from '@features/customer/stores/customer-store';

@Component({
  selector: 'app-customer-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    FormField,
    TranslateModule,
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
      <form
        (submit)="$event.preventDefault(); onSubmit()"
        class="flex flex-col gap-4 pt-4"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-1 md:col-span-2">
            @let fullNameInvalid =
              customerForm.fullName().invalid() &&
              customerForm.fullName().touched();
            @let fullNameErrors = customerForm.fullName().errors();

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="fullNameInvalid"
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
                  [formField]="customerForm.fullName"
                  placeholder="Enter full name"
                  [class.ng-dirty]="fullNameInvalid"
                  [class.ng-invalid]="fullNameInvalid"
                  fluid
                />
              </p-inputgroup>

              @if (fullNameInvalid) {
                <ul>
                  @for (error of fullNameErrors; track error.kind) {
                    <li class="text-red-500">{{ error.message }}</li>
                  }
                </ul>
              }
            </div>
          </div>

          <div class="col-span-1">
            @let documentIdInvalid =
              customerForm.documentId().invalid() &&
              customerForm.documentId().touched();
            @let documentIdErrors = customerForm.documentId().errors();

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="documentIdInvalid"
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
                  [formField]="customerForm.documentId"
                  placeholder="Enter document number"
                  [class.ng-dirty]="documentIdInvalid"
                  [class.ng-invalid]="documentIdInvalid"
                  fluid
                />
              </p-inputgroup>

              @if (documentIdInvalid) {
                <ul>
                  @for (error of documentIdErrors; track error.kind) {
                    <li class="text-red-500">{{ error.message }}</li>
                  }
                </ul>
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
                  [formField]="customerForm.phoneNumber"
                  placeholder="Enter phone number (optional)"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1 md:col-span-2">
            @let emailInvalid =
              customerForm.email().invalid() && customerForm.email().touched();
            @let emailErrors = customerForm.email().errors();

            <div class="flex flex-col gap-2" [class.p-invalid]="emailInvalid">
              <label for="email" class="font-bold">Email</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-envelope"></i>
                </p-inputgroup-addon>
                <input
                  type="email"
                  pInputText
                  id="email"
                  [formField]="customerForm.email"
                  placeholder="Enter email"
                  [class.ng-dirty]="emailInvalid"
                  [class.ng-invalid]="emailInvalid"
                  fluid
                />
              </p-inputgroup>

              @if (emailInvalid) {
                <ul>
                  @for (error of emailErrors; track error.kind) {
                    <li class="text-red-500">{{ error.message }}</li>
                  }
                </ul>
              }
            </div>
          </div>

          <div class="col-span-1 md:col-span-2">
            @let addressInvalid =
              customerForm.address().invalid() &&
              customerForm.address().touched();
            @let addressErrors = customerForm.address().errors();

            <div class="flex flex-col gap-2" [class.p-invalid]="addressInvalid">
              <label for="address" class="font-bold">Address</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-map-marker"></i>
                </p-inputgroup-addon>
                <input
                  type="text"
                  pInputText
                  id="address"
                  [formField]="customerForm.address"
                  placeholder="Enter address"
                  [class.ng-dirty]="addressInvalid"
                  [class.ng-invalid]="addressInvalid"
                  fluid
                />
              </p-inputgroup>

              @if (addressInvalid) {
                <ul>
                  @for (error of addressErrors; track error.kind) {
                    <li class="text-red-500">{{ error.message }}</li>
                  }
                </ul>
              }
            </div>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          [label]="'common.cancel' | translate"
          icon="pi pi-times"
          text
          (click)="customerStore.closeCustomerDialog()"
        />

        <p-button
          [label]="'common.save' | translate"
          icon="pi pi-check"
          type="submit"
          (onClick)="onSubmit()"
          [disabled]="customerStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class CustomerDialog {
  readonly customerStore = inject(CustomerStore);

  private readonly customerModel = signal({
    fullName: '',
    documentId: '',
    phoneNumber: '',
    email: '',
    address: '',
  });

  readonly customerForm = form(this.customerModel, (customer) => {
    required(customer.fullName, { message: 'validation.required' });
    required(customer.documentId, { message: 'validation.required' });
    required(customer.email, { message: 'validation.required' });
    email(customer.email, { message: 'validation.email' });
    required(customer.address, { message: 'validation.required' });
  });

  constructor() {
    effect(() => {
      const customer = this.customerStore.selectedCustomer();
      untracked(() => {
        if (customer) {
          this.customerModel.set({
            fullName: customer.fullName,
            documentId: customer.documentId ?? '',
            phoneNumber: customer.phoneNumber ?? '',
            email: customer.email,
            address: customer.address,
          });
        } else {
          this.customerModel.set({
            fullName: '',
            documentId: '',
            phoneNumber: '',
            email: '',
            address: '',
          });
        }
      });
    });
  }

  onSubmit(): void {
    if (this.customerForm().valid()) {
      this.saveCustomer();
      return;
    }

    this.customerForm.fullName().markAsTouched();
    this.customerForm.documentId().markAsTouched();
    this.customerForm.email().markAsTouched();
    this.customerForm.address().markAsTouched();
  }

  saveCustomer(): void {
    const customerData = this.customerForm().value();
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
