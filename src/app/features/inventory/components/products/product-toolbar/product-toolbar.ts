import { Component, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProductStore } from '@features/inventory/stores/product-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ProductTable } from '../product-table/product-table';

@Component({
  selector: 'app-product-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule, TranslateModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Create new product"
          tooltipPosition="top"
          (onClick)="productStore.openProductDialog()"
        />

        <p-button
          severity="danger"
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          outlined
          pTooltip="Delete selected products"
          tooltipPosition="top"
          (onClick)="deleteSelectedProducts()"
          [disabled]="productTable().selectedProducts().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Export products to CSV"
          tooltipPosition="top"
          (onClick)="productTable().dt().exportCSV()"
          [disabled]="productStore.productsCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class ProductToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  readonly productStore = inject(ProductStore);

  readonly productTable = input.required<ProductTable>();

  deleteSelectedProducts(): void {
    const products = this.productTable().selectedProducts();
    this.confirmationService.confirm({
      header: 'Delete products',
      message: `
          Are you sure you want to delete the ${products.length} selected products?
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
