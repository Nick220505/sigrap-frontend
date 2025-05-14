import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-supplier-configuration',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    TextareaModule,
    InputNumberModule,
    CheckboxModule,
  ],
  template: `
    <form [formGroup]="formGroup()" class="flex flex-col gap-4 py-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <div class="flex justify-between mt-4">
        <p-button
          label="Atrás"
          icon="pi pi-arrow-left"
          (onClick)="onPreviousStep()"
        ></p-button>
        <p-button
          label="Guardar"
          icon="pi pi-check"
          (onClick)="
            formGroup().valid
              ? onSaveSupplier()
              : formGroup().markAllAsTouched()
          "
          [disabled]="formGroup().invalid"
        ></p-button>
      </div>
    </form>
  `,
})
export class SupplierConfigurationComponent {
  formGroup = input.required<FormGroup>();
  previousStep = output<void>();
  saveSupplier = output<void>();

  onPreviousStep(): void {
    this.previousStep.emit();
  }

  onSaveSupplier(): void {
    this.saveSupplier.emit();
  }
}
