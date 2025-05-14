import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-supplier-contact-info',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <form [formGroup]="formGroup()" class="flex flex-col gap-4 py-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            formGroup().get('email')?.errors?.['email'] &&
            formGroup().get('email')?.touched;

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
      </div>

      <div class="flex justify-between mt-4">
        <p-button
          label="Atrás"
          icon="pi pi-arrow-left"
          (onClick)="onPreviousStep()"
        ></p-button>
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
export class SupplierContactInfoComponent {
  formGroup = input.required<FormGroup>();
  previousStep = output<void>();
  nextStep = output<void>();

  onPreviousStep(): void {
    this.previousStep.emit();
  }

  onNextStep(): void {
    this.nextStep.emit();
  }
}
