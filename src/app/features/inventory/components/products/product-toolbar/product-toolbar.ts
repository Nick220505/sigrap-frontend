import { Component, inject, input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
          [label]="'inventory.products.newButton' | translate"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          [pTooltip]="'inventory.tooltips.createProduct' | translate"
          tooltipPosition="top"
          (onClick)="productStore.openProductDialog()"
        />

        <p-button
          severity="danger"
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          outlined
          [pTooltip]="'inventory.tooltips.deleteProducts' | translate"
          tooltipPosition="top"
          (onClick)="deleteSelectedProducts()"
          [disabled]="productTable().selectedProducts().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          [label]="'inventory.products.exportButton' | translate"
          icon="pi pi-download"
          severity="secondary"
          [pTooltip]="'inventory.tooltips.exportProducts' | translate"
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
  private readonly translateService = inject(TranslateService);
  readonly productStore = inject(ProductStore);

  readonly productTable = input.required<ProductTable>();

  deleteSelectedProducts(): void {
    const products = this.productTable().selectedProducts();
    this.confirmationService.confirm({
      header: this.translateService.instant('common.confirmations.deleteHeaderPlural', { items: 'products' }),
      message: `
        ${this.translateService.instant('common.confirmations.deleteMessagePlural', { count: products.length, items: 'products' })}
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
