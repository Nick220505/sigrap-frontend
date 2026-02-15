import { Component, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SupplierStore } from '@features/supplier/stores/supplier-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SupplierTable } from '../supplier-table/supplier-table';

@Component({
  selector: 'app-supplier-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule, TranslateModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template pTemplate="start">
        <p-button
          label="New"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Create new supplier"
          tooltipPosition="top"
          (onClick)="supplierStore.openSupplierDialog()"
        />

        <p-button
          severity="danger"
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          outlined
          pTooltip="Delete selected suppliers"
          tooltipPosition="top"
          (onClick)="deleteSelectedSuppliers()"
          [disabled]="supplierTable().selectedSuppliers().length === 0"
        />
      </ng-template>

      <ng-template pTemplate="end">
        <p-button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Export suppliers to CSV"
          tooltipPosition="top"
          (onClick)="supplierTable().dt().exportCSV()"
          [disabled]="supplierStore.suppliersCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class SupplierToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  readonly supplierStore = inject(SupplierStore);

  readonly supplierTable = input.required<SupplierTable>();

  deleteSelectedSuppliers(): void {
    const suppliers = this.supplierTable().selectedSuppliers();
    this.confirmationService.confirm({
      header: 'Delete suppliers',
      message: `
      Are you sure you want to delete the ${suppliers.length} selected suppliers?
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
