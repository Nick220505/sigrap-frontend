import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField, email, form, required } from '@angular/forms/signals';
import { TranslateModule } from '@ngx-translate/core';
import { SupplierData } from '@features/supplier/models/supplier.model';
import { SupplierStore } from '@features/supplier/stores/supplier-store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-supplier-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TextareaModule,
    InputNumberModule,
    FormField,
    FormsModule,
    TranslateModule,
  ],
  template: `
    <p-dialog
      [visible]="supplierStore.dialogVisible()"
      (visibleChange)="supplierStore.closeSupplierDialog()"
      [style]="{ width: '90vw', maxWidth: '800px' }"
      [header]="
        supplierStore.selectedSupplier() ? ('suppliers.editSupplier' | translate) : ('suppliers.createSupplier' | translate)
      "
      modal
    >
      <form
        (submit)="$event.preventDefault(); onSubmit()"
        class="flex flex-col gap-4 py-4"
      >
        <h3 class="text-lg font-semibold mb-2">{{ 'suppliers.labels.basicInformation' | translate }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-1 md:col-span-2">
            @let nameInvalid =
              supplierForm.name().invalid() && supplierForm.name().touched();
            @let nameErrors = supplierForm.name().errors();

            <div class="flex flex-col gap-2" [class.p-invalid]="nameInvalid">
              <label for="name" class="font-bold">{{ 'suppliers.labels.name' | translate }}*</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-building"></i>
                </p-inputgroup-addon>
                <input
                  id="name"
                  type="text"
                  pInputText
                  [formField]="supplierForm.name"
                  [placeholder]="'suppliers.catalog.supplierNamePlaceholder' | translate"
                  [class.ng-dirty]="nameInvalid"
                  [class.ng-invalid]="nameInvalid"
                  fluid
                />
              </p-inputgroup>
              @if (nameInvalid) {
                <ul>
                  @for (error of nameErrors; track error.kind) {
                    <li class="text-red-500">{{ error.message }}</li>
                  }
                </ul>
              }
            </div>
          </div>

          <div class="col-span-1 md:col-span-2">
            <div class="flex flex-col gap-2">
              <label for="address" class="font-bold">{{ 'suppliers.labels.address' | translate }}</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-map-marker"></i>
                </p-inputgroup-addon>
                <textarea
                  id="address"
                  [formField]="supplierForm.address"
                  [rows]="2"
                  [placeholder]="'suppliers.catalog.addressPlaceholder' | translate"
                  class="w-full"
                ></textarea>
              </p-inputgroup>
            </div>
          </div>
        </div>

        <h3 class="text-lg font-semibold mt-4 mb-2">{{ 'suppliers.labels.contactInformation' | translate }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="contactPerson" class="font-bold">{{ 'suppliers.labels.contactPerson' | translate }}</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-user"></i>
                </p-inputgroup-addon>
                <input
                  id="contactPerson"
                  type="text"
                  pInputText
                  [formField]="supplierForm.contactPerson"
                  [placeholder]="'suppliers.catalog.contactNamePlaceholder' | translate"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            @let emailInvalid =
              supplierForm.email().invalid() && supplierForm.email().touched();
            @let emailErrors = supplierForm.email().errors();

            <div class="flex flex-col gap-2" [class.p-invalid]="emailInvalid">
              <label for="email" class="font-bold">{{ 'suppliers.labels.email' | translate }}</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-envelope"></i>
                </p-inputgroup-addon>
                <input
                  id="email"
                  type="email"
                  pInputText
                  [formField]="supplierForm.email"
                  [placeholder]="'suppliers.catalog.emailPlaceholder' | translate"
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

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="phone" class="font-bold">{{ 'suppliers.labels.phone' | translate }}</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-phone"></i>
                </p-inputgroup-addon>
                <input
                  id="phone"
                  type="text"
                  pInputText
                  [formField]="supplierForm.phone"
                  [placeholder]="'suppliers.catalog.phonePlaceholder' | translate"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="alternativePhone" class="font-bold">{{ 'suppliers.labels.alternativePhone' | translate }}</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-mobile"></i>
                </p-inputgroup-addon>
                <input
                  id="alternativePhone"
                  type="text"
                  pInputText
                  [formField]="supplierForm.alternativePhone"
                  [placeholder]="'suppliers.catalog.alternativePhonePlaceholder' | translate"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="website" class="font-bold">{{ 'suppliers.labels.website' | translate }}</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-globe"></i>
                </p-inputgroup-addon>
                <input
                  id="website"
                  type="text"
                  pInputText
                  [formField]="supplierForm.website"
                  [placeholder]="'suppliers.catalog.websitePlaceholder' | translate"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>
        </div>

        <h3 class="text-lg font-semibold mt-4 mb-2">{{ 'suppliers.labels.businessInformation' | translate }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="col-span-1 md:col-span-2">
            <div class="flex flex-col gap-2">
              <label for="productsProvided" class="font-bold">{{ 'suppliers.labels.productsServices' | translate }}</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-shopping-cart"></i>
                </p-inputgroup-addon>
                <textarea
                  id="productsProvided"
                  [formField]="supplierForm.productsProvided"
                  [rows]="2"
                  [placeholder]="'suppliers.catalog.productsProvidedPlaceholder' | translate"
                  class="w-full"
                ></textarea>
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="paymentTerms" class="font-bold">{{ 'suppliers.labels.paymentTerms' | translate }}</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-wallet"></i>
                </p-inputgroup-addon>
                <input
                  id="paymentTerms"
                  type="text"
                  pInputText
                  [formField]="supplierForm.paymentTerms"
                  [placeholder]="'suppliers.catalog.paymentTermsLabel' | translate"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="averageDeliveryTime" class="font-bold">{{ 'suppliers.labels.deliveryTimeDays' | translate }}</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-clock"></i>
                </p-inputgroup-addon>
                <p-inputNumber
                  id="averageDeliveryTime"
                  [ngModel]="supplierForm.averageDeliveryTime().value()"
                  (ngModelChange)="supplierForm.averageDeliveryTime().value.set($event)"
                  [ngModelOptions]="{ standalone: true }"
                  [showButtons]="true"
                  [min]="1"
                  buttonLayout="horizontal"
                  [placeholder]="'suppliers.catalog.daysLabel' | translate"
                  styleClass="w-full"
                />
              </p-inputgroup>
            </div>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <div class="flex justify-end gap-2">
          <p-button
            [label]="'common.cancel' | translate"
            icon="pi pi-times"
            text
            (onClick)="supplierStore.closeSupplierDialog()"
          />
          <p-button
            [label]="'common.save' | translate"
            icon="pi pi-check"
            type="submit"
            (onClick)="onSubmit()"
          />
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class SupplierDialog {
  readonly supplierStore = inject(SupplierStore);

  private readonly supplierModel = signal({
    name: '',
    contactPerson: '',
    phone: '',
    alternativePhone: '',
    email: '',
    address: '',
    website: '',
    productsProvided: '',
    averageDeliveryTime: null as number | null,
    paymentTerms: '',
  });

  readonly supplierForm = form(this.supplierModel, (supplier) => {
    required(supplier.name, { message: 'validation.required' });
    email(supplier.email, { message: 'validation.email' });
  });

  constructor() {
    effect(() => {
      const supplier = this.supplierStore.selectedSupplier();
      if (supplier) {
        this.supplierModel.set({
          name: supplier.name,
          contactPerson: supplier.contactPerson ?? '',
          phone: supplier.phone ?? '',
          alternativePhone: supplier.alternativePhone ?? '',
          email: supplier.email ?? '',
          address: supplier.address ?? '',
          website: supplier.website ?? '',
          productsProvided: supplier.productsProvided ?? '',
          averageDeliveryTime: supplier.averageDeliveryTime ?? null,
          paymentTerms: supplier.paymentTerms ?? '',
        });
      } else {
        this.supplierModel.set({
          name: '',
          contactPerson: '',
          phone: '',
          alternativePhone: '',
          email: '',
          address: '',
          website: '',
          productsProvided: '',
          averageDeliveryTime: null,
          paymentTerms: '',
        });
      }
    });
  }

  onSubmit(): void {
    if (this.supplierForm().valid()) {
      this.saveSupplier();
      return;
    }

    this.supplierForm.name().markAsTouched();
    this.supplierForm.email().markAsTouched();
  }

  saveSupplier(): void {
    const supplier = this.supplierForm().value();
    const supplierData: SupplierData = {
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      alternativePhone: supplier.alternativePhone,
      email: supplier.email,
      address: supplier.address,
      website: supplier.website,
      productsProvided: supplier.productsProvided,
      averageDeliveryTime: supplier.averageDeliveryTime ?? undefined,
      paymentTerms: supplier.paymentTerms,
    };
    const selectedSupplier = this.supplierStore.selectedSupplier();

    if (selectedSupplier) {
      this.supplierStore.update({
        id: selectedSupplier.id,
        supplierData,
      });
    } else {
      this.supplierStore.create(supplierData);
    }

    this.supplierStore.closeSupplierDialog();
  }
}
