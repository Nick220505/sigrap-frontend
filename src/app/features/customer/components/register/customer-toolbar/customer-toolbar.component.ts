import { Component, inject, input } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CustomerInfo } from '../../../models/customer.model';
import { CustomerStore } from '../../../stores/customer.store';
import { CustomerTableComponent } from '../customer-table/customer-table.component';

@Component({
  selector: 'app-customer-toolbar',
  imports: [ButtonModule, ToolbarModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-4">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nuevo cliente"
          tooltipPosition="top"
          (onClick)="customerStore.openCustomerDialog()"
        />

        <p-button
          label="Eliminar"
          icon="pi pi-trash"
          severity="danger"
          outlined
          pTooltip="Eliminar clientes seleccionados"
          tooltipPosition="top"
          [disabled]="customerTable().selectedCustomers().length === 0"
          (onClick)="deleteSelectedCustomers()"
          class="mr-2"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          (onClick)="customerTable().dt().exportCSV()"
          [disabled]="customerStore.entities().length === 0"
          pTooltip="Exportar clientes a CSV"
          tooltipPosition="top"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class CustomerToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly customerStore = inject(CustomerStore);
  readonly customerTable = input.required<CustomerTableComponent>();

  deleteSelectedCustomers(): void {
    const customers = this.customerTable().selectedCustomers();
    this.confirmationService.confirm({
      header: 'Eliminar clientes',
      message: `
        ¿Está seguro de que desea eliminar los ${customers.length} clientes seleccionados?
        <ul class='mt-2 mb-0'>
          ${customers
            .map(
              ({ firstName, lastName }: CustomerInfo) =>
                `<li>• <b>${firstName} ${lastName}</b></li>`,
            )
            .join('')}
        </ul>
      `,
      accept: () => {
        const ids = customers.map(({ id }: CustomerInfo) => id);
        this.customerStore.deleteAllById(ids);
      },
    });
  }
}
