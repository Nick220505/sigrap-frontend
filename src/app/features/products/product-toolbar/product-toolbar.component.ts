import { Component, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProductStore } from '../store/product.store';

@Component({
  selector: 'app-product-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          severity="secondary"
          class="mr-2"
          (onClick)="productStore.openDialogForNew()"
          pTooltip="Crear nuevo producto"
          tooltipPosition="top"
          [disabled]="productStore.isLoading()"
        />
        <p-button
          severity="secondary"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          (onClick)="deleteSelectedProducts()"
          [disabled]="
            productStore.isLoading() || !productStore.selectedProductsCount()
          "
          pTooltip="Eliminar productos seleccionados"
          tooltipPosition="top"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-upload"
          severity="secondary"
          (onClick)="productStore.getTableInstance()?.exportCSV()"
          pTooltip="Exportar datos a CSV"
          tooltipPosition="top"
          [disabled]="
            productStore.isLoading() ||
            !productStore.productCount() ||
            !productStore.getTableInstance()
          "
        />
      </ng-template>
    </p-toolbar>
  `,
  styles: ``,
})
export class ProductToolbarComponent {
  readonly productStore = inject(ProductStore);
  private readonly confirmationService = inject(ConfirmationService);

  deleteSelectedProducts(): void {
    const selectedIds = this.productStore.selectSelectedProductIds();
    if (!selectedIds || selectedIds.size === 0) {
      return;
    }

    this.confirmationService.confirm({
      message:
        '¿Estás seguro de que deseas eliminar los productos seleccionados?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => this.productStore.deleteProducts(selectedIds),
    });
  }
}
