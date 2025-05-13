import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SupplierData } from '@features/supplier/models/supplier.model';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-supplier-dialog',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    SelectModule,
    InputNumberModule,
    CheckboxModule,
    ReactiveFormsModule,
    InputGroupModule,
    InputGroupAddonModule,
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
      <form [formGroup]="supplierForm" class="flex flex-col gap-4 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Basic Information -->
          <div class="col-span-1">
            @let nameControlInvalid =
              supplierForm.get('name')?.invalid &&
              supplierForm.get('name')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="nameControlInvalid"
            >
              <label for="name" class="font-bold">Nombre*</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-building"></i>
                </p-inputgroup-addon>
                <input
                  id="name"
                  type="text"
                  pInputText
                  formControlName="name"
                  placeholder="Nombre del proveedor"
                  [class.ng-dirty]="nameControlInvalid"
                  [class.ng-invalid]="nameControlInvalid"
                  required
                  fluid
                />
              </p-inputgroup>
              @if (nameControlInvalid) {
                <small class="text-red-500">El nombre es requerido.</small>
              }
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="taxId" class="font-bold">RUC</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-id-card"></i>
                </p-inputgroup-addon>
                <input
                  id="taxId"
                  type="text"
                  pInputText
                  formControlName="taxId"
                  placeholder="Número de RUC"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="contactPerson" class="font-bold"
                >Persona de contacto</label
              >
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-user"></i>
                </p-inputgroup-addon>
                <input
                  id="contactPerson"
                  type="text"
                  pInputText
                  formControlName="contactPerson"
                  placeholder="Nombre del contacto"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            @let emailControlInvalid =
              supplierForm.get('email')?.errors?.['email'] &&
              supplierForm.get('email')?.touched;

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
                  id="email"
                  type="email"
                  pInputText
                  formControlName="email"
                  placeholder="correo@ejemplo.com"
                  [class.ng-dirty]="emailControlInvalid"
                  [class.ng-invalid]="emailControlInvalid"
                  fluid
                />
              </p-inputgroup>
              @if (emailControlInvalid) {
                <small class="text-red-500">Email inválido.</small>
              }
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="phone" class="font-bold">Teléfono</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-phone"></i>
                </p-inputgroup-addon>
                <input
                  id="phone"
                  type="text"
                  pInputText
                  formControlName="phone"
                  placeholder="Número de teléfono"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="alternativePhone" class="font-bold"
                >Teléfono alternativo</label
              >
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-mobile"></i>
                </p-inputgroup-addon>
                <input
                  id="alternativePhone"
                  type="text"
                  pInputText
                  formControlName="alternativePhone"
                  placeholder="Teléfono alternativo"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="website" class="font-bold">Sitio web</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-globe"></i>
                </p-inputgroup-addon>
                <input
                  id="website"
                  type="text"
                  pInputText
                  formControlName="website"
                  placeholder="www.ejemplo.com"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            @let statusControlInvalid =
              supplierForm.get('status')?.invalid &&
              supplierForm.get('status')?.touched;

            <div
              class="flex flex-col gap-2"
              [class.p-invalid]="statusControlInvalid"
            >
              <label for="status" class="font-bold">Estado*</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-check-circle"></i>
                </p-inputgroup-addon>
                <p-select
                  id="status"
                  formControlName="status"
                  [options]="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccionar estado"
                  [class.ng-dirty]="statusControlInvalid"
                  [class.ng-invalid]="statusControlInvalid"
                  appendTo="body"
                  styleClass="w-full"
                  required
                />
              </p-inputgroup>
              @if (statusControlInvalid) {
                <small class="text-red-500">El estado es requerido.</small>
              }
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="address" class="font-bold">Dirección</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-map-marker"></i>
                </p-inputgroup-addon>
                <textarea
                  id="address"
                  pTextarea
                  formControlName="address"
                  [rows]="2"
                  placeholder="Dirección completa"
                  class="w-full"
                ></textarea>
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1 md:col-span-2">
            <div class="flex flex-col gap-2">
              <label for="productsProvided" class="font-bold"
                >Productos/Servicios</label
              >
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-shopping-cart"></i>
                </p-inputgroup-addon>
                <textarea
                  id="productsProvided"
                  pTextarea
                  formControlName="productsProvided"
                  [rows]="2"
                  placeholder="Describa los productos o servicios que ofrece"
                  class="w-full"
                ></textarea>
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="paymentMethod" class="font-bold"
                >Método de pago</label
              >
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-credit-card"></i>
                </p-inputgroup-addon>
                <p-select
                  id="paymentMethod"
                  formControlName="paymentMethod"
                  [options]="paymentMethods"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Seleccionar método"
                  appendTo="body"
                  styleClass="w-full"
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="paymentTerms" class="font-bold"
                >Términos de pago</label
              >
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-wallet"></i>
                </p-inputgroup-addon>
                <input
                  id="paymentTerms"
                  type="text"
                  pInputText
                  formControlName="paymentTerms"
                  placeholder="Términos de pago"
                  fluid
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="averageDeliveryTime" class="font-bold"
                >Tiempo de entrega (días)</label
              >
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-clock"></i>
                </p-inputgroup-addon>
                <p-inputNumber
                  id="averageDeliveryTime"
                  formControlName="averageDeliveryTime"
                  [showButtons]="true"
                  [min]="1"
                  buttonLayout="horizontal"
                  placeholder="Días"
                  styleClass="w-full"
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1">
            <div class="flex flex-col gap-2">
              <label for="rating" class="font-bold">Calificación</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-star"></i>
                </p-inputgroup-addon>
                <p-inputNumber
                  id="rating"
                  formControlName="rating"
                  [showButtons]="true"
                  [min]="1"
                  [max]="5"
                  buttonLayout="horizontal"
                  placeholder="1-5"
                  styleClass="w-full"
                />
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1 md:col-span-2">
            <div class="flex flex-col gap-2">
              <label for="notes" class="font-bold">Notas</label>
              <p-inputgroup>
                <p-inputgroup-addon>
                  <i class="pi pi-file"></i>
                </p-inputgroup-addon>
                <textarea
                  id="notes"
                  pTextarea
                  formControlName="notes"
                  [rows]="2"
                  placeholder="Notas adicionales"
                  class="w-full"
                ></textarea>
              </p-inputgroup>
            </div>
          </div>

          <div class="col-span-1 md:col-span-2">
            <div class="field-checkbox">
              <p-checkbox
                formControlName="preferred"
                [binary]="true"
                inputId="preferred"
              ></p-checkbox>
              <label for="preferred" class="ml-2">Proveedor preferido</label>
            </div>
          </div>
        </div>
      </form>

      <ng-template pTemplate="footer">
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (onClick)="supplierStore.closeSupplierDialog()"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          (onClick)="
            supplierForm.valid
              ? saveSupplier()
              : supplierForm.markAllAsTouched()
          "
          [disabled]="supplierForm.invalid"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class SupplierDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly supplierStore = inject(SupplierStore);

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

  readonly paymentMethods = [
    { label: 'Transferencia Bancaria', value: 'BANK_TRANSFER' },
    { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
    { label: 'Efectivo', value: 'CASH' },
    { label: 'Cheque', value: 'CHECK' },
    { label: 'PayPal', value: 'PAYPAL' },
    { label: 'Otro', value: 'OTHER' },
  ];

  readonly statusOptions = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' },
    { label: 'En Prueba', value: 'PROBATION' },
    { label: 'Terminado', value: 'TERMINATED' },
    { label: 'Lista Negra', value: 'BLACKLISTED' },
  ];

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
