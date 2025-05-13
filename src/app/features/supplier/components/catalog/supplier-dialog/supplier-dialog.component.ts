import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SupplierData } from '@features/supplier/models/supplier.model';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { StepperModule } from 'primeng/stepper';
import { SupplierBasicInfoComponent } from './steps/basic-info/supplier-basic-info.component';
import { SupplierBusinessInfoComponent } from './steps/business-info/supplier-business-info.component';
import { SupplierConfigurationComponent } from './steps/configuration/supplier-configuration.component';
import { SupplierContactInfoComponent } from './steps/contact-info/supplier-contact-info.component';

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    StepperModule,
    ReactiveFormsModule,
    SupplierBasicInfoComponent,
    SupplierContactInfoComponent,
    SupplierBusinessInfoComponent,
    SupplierConfigurationComponent,
  ],
  template: `
    <p-dialog
      [visible]="supplierStore.dialogVisible()"
      (visibleChange)="supplierStore.closeSupplierDialog()"
      [style]="{ width: '90vw', maxWidth: '800px' }"
      [header]="
        supplierStore.selectedSupplier()
          ? 'Editar Proveedor'
          : 'Nuevo Proveedor'
      "
      modal
    >
      <p-stepper [value]="activeStep()">
        <p-step-list>
          <p-step [value]="1">Información Básica</p-step>
          <p-step [value]="2">Contacto</p-step>
          <p-step [value]="3">Negocios</p-step>
          <p-step [value]="4">Configuración</p-step>
        </p-step-list>

        <p-step-panels>
          <!-- Step 1: Basic Information -->
          <p-step-panel [value]="1">
            <ng-template #content let-activateCallback="activateCallback">
              <app-supplier-basic-info
                [formGroup]="supplierForm"
                (nextStep)="activateCallback(2)"
              ></app-supplier-basic-info>
            </ng-template>
          </p-step-panel>

          <!-- Step 2: Contact Information -->
          <p-step-panel [value]="2">
            <ng-template #content let-activateCallback="activateCallback">
              <app-supplier-contact-info
                [formGroup]="supplierForm"
                (previousStep)="activateCallback(1)"
                (nextStep)="activateCallback(3)"
              ></app-supplier-contact-info>
            </ng-template>
          </p-step-panel>

          <!-- Step 3: Business Information -->
          <p-step-panel [value]="3">
            <ng-template #content let-activateCallback="activateCallback">
              <app-supplier-business-info
                [formGroup]="supplierForm"
                (previousStep)="activateCallback(2)"
                (nextStep)="activateCallback(4)"
              ></app-supplier-business-info>
            </ng-template>
          </p-step-panel>

          <!-- Step 4: Additional Configuration -->
          <p-step-panel [value]="4">
            <ng-template #content let-activateCallback="activateCallback">
              <app-supplier-configuration
                [formGroup]="supplierForm"
                (previousStep)="activateCallback(3)"
                (saveSupplier)="saveSupplier()"
              ></app-supplier-configuration>
            </ng-template>
          </p-step-panel>
        </p-step-panels>
      </p-stepper>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (onClick)="supplierStore.closeSupplierDialog()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class SupplierDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly supplierStore = inject(SupplierStore);
  readonly activeStep = signal(1);

  readonly supplierForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    taxId: [''],
    contactPerson: [''],
    phone: [''],
    alternativePhone: [''],
    email: ['', Validators.email],
    address: [''],
    website: [''],
    productsProvided: [''],
    averageDeliveryTime: [null],
    paymentMethod: [null],
    paymentTerms: [''],
    notes: [''],
    status: ['ACTIVE', Validators.required],
    rating: [null],
    preferred: [false],
  });

  constructor() {
    effect(() => {
      const supplier = this.supplierStore.selectedSupplier();
      if (supplier) {
        this.supplierForm.patchValue(supplier);
      } else {
        this.supplierForm.reset({
          status: 'ACTIVE',
          preferred: false,
        });
      }
    });
  }

  saveSupplier(): void {
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }

    const supplierData: SupplierData = this.supplierForm.value;
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
