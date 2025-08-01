import { Component, inject, input } from '@angular/core';
import { ProductStore } from '@features/inventory/stores/product.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProductTableComponent } from '../product-table/product-table.component';

@Component({
  selector: 'app-product-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="Nuevo"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nuevo producto"
          tooltipPosition="top"
          (onClick)="productStore.openProductDialog()"
        />

        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar productos seleccionados"
          tooltipPosition="top"
          (onClick)="deleteSelectedProducts()"
          [disabled]="productTable().selectedProducts().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar productos a CSV"
          tooltipPosition="top"
          (onClick)="productTable().dt().exportCSV()"
          [disabled]="productStore.productsCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class ProductToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly productStore = inject(ProductStore);

  readonly productTable = input.required<ProductTableComponent>();

  deleteSelectedProducts(): void {
    const products = this.productTable().selectedProducts();
    this.confirmationService.confirm({
      header: 'Eliminar productos',
      message: `
          ¿Está seguro de que desea eliminar los ${products.length} productos seleccionados?
          <ul class='mt-2 mb-0'>
            ${products.map(({ name }) => `<li>• <b>${name}</b></li>`).join('')}
          </ul>
        `,
      accept: () => {
        const ids = products.map(({ id }) => id);
        this.productStore.deleteAllById(ids);
      },
    });
  }
}
