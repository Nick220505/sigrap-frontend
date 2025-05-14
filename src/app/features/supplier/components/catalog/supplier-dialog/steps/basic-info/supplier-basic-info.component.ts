import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-supplier-basic-info',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TextareaModule,
    SelectModule,
  ],
  template: `
    <form [formGroup]="formGroup()" class="flex flex-col gap-4 py-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="col-span-1">
          @let nameControlInvalid =
            formGroup().get('name')?.invalid &&
            formGroup().get('name')?.touched;

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

        <div class="col-span-1 md:col-span-2">
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

        <div class="col-span-1">
          @let statusControlInvalid =
            formGroup().get('status')?.invalid &&
            formGroup().get('status')?.touched;

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
      </div>

      <div class="flex justify-end mt-4">
        <p-button
          label="Siguiente"
          icon="pi pi-arrow-right"
          iconPos="right"
          (onClick)="onNextStep()"
        ></p-button>
      </div>
    </form>
  `,
})
export class SupplierBasicInfoComponent {
  formGroup = input.required<FormGroup>();
  nextStep = output<void>();

  readonly statusOptions = [
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' },
    { label: 'En Prueba', value: 'PROBATION' },
    { label: 'Terminado', value: 'TERMINATED' },
    { label: 'Lista Negra', value: 'BLACKLISTED' },
  ];

  onNextStep(): void {
    this.nextStep.emit();
  }
}
