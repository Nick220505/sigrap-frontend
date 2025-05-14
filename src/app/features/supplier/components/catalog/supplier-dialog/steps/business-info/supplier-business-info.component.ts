import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-supplier-business-info',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputGroupModule,
    InputGroupAddonModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
  ],
  template: `
    <form [formGroup]="formGroup()" class="flex flex-col gap-4 py-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <label for="paymentMethod" class="font-bold">Método de pago</label>
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
            <label for="paymentTerms" class="font-bold">Términos de pago</label>
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
export class SupplierBusinessInfoComponent {
  formGroup = input.required<FormGroup>();
  previousStep = output<void>();
  nextStep = output<void>();

  readonly paymentMethods = [
    { label: 'Transferencia Bancaria', value: 'BANK_TRANSFER' },
    { label: 'Tarjeta de Crédito', value: 'CREDIT_CARD' },
    { label: 'Efectivo', value: 'CASH' },
    { label: 'Cheque', value: 'CHECK' },
    { label: 'PayPal', value: 'PAYPAL' },
    { label: 'Otro', value: 'OTHER' },
  ];

  onPreviousStep(): void {
    this.previousStep.emit();
  }

  onNextStep(): void {
    this.nextStep.emit();
  }
}
