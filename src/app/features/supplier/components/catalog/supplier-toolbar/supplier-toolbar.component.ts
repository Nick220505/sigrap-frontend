import { Component, inject, input } from '@angular/core';
import { SupplierStore } from '@features/supplier/stores/supplier.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SupplierTableComponent } from '../supplier-table/supplier-table.component';

@Component({
  selector: 'app-supplier-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template pTemplate="start">
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nuevo proveedor"
          tooltipPosition="top"
          (onClick)="supplierStore.openSupplierDialog()"
        />

        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar proveedores seleccionados"
          tooltipPosition="top"
          (onClick)="deleteSelectedSuppliers()"
          [disabled]="supplierTable().selectedSuppliers().length === 0"
        />
      </ng-template>

      <ng-template pTemplate="end">
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar proveedores a CSV"
          tooltipPosition="top"
          (onClick)="supplierTable().dt().exportCSV()"
          [disabled]="supplierStore.suppliersCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class SupplierToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly supplierStore = inject(SupplierStore);

  readonly supplierTable = input.required<SupplierTableComponent>();

  deleteSelectedSuppliers(): void {
    const suppliers = this.supplierTable().selectedSuppliers();
    this.confirmationService.confirm({
      header: 'Eliminar proveedores',
      message: `
      ¿Está seguro de que desea eliminar los ${suppliers.length} proveedores seleccionados?
      <ul class='mt-2 mb-0'>
          ${suppliers.map(({ name }) => `<li>• <b>${name}</b></li>`).join('')}
      </ul>
      `,
      accept: () => {
        const ids = suppliers.map(({ id }) => id);
        this.supplierStore.deleteAllById(ids);
      },
    });
  }
}
