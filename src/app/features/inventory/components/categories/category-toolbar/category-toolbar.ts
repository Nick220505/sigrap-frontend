import { Component, inject, input } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CategoryStore } from '@features/inventory/stores/category-store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryTable } from '../category-table/category-table';

@Component({
  selector: 'app-category-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule, TranslateModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          [label]="'inventory.categories.newButton' | translate"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          [pTooltip]="'inventory.tooltips.createCategory' | translate"
          tooltipPosition="top"
          (onClick)="categoryStore.openCategoryDialog()"
        />

        <p-button
          severity="danger"
          [label]="'common.delete' | translate"
          icon="pi pi-trash"
          outlined
          [pTooltip]="'inventory.tooltips.deleteCategories' | translate"
          tooltipPosition="top"
          (onClick)="deleteSelectedCategories()"
          [disabled]="categoryTable().selectedCategories().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          [label]="'inventory.categories.exportButton' | translate"
          icon="pi pi-download"
          severity="secondary"
          [pTooltip]="'inventory.tooltips.exportCategories' | translate"
          tooltipPosition="top"
          (onClick)="categoryTable().dt().exportCSV()"
          [disabled]="categoryStore.categoriesCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class CategoryToolbar {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly translateService = inject(TranslateService);
  readonly categoryStore = inject(CategoryStore);

  readonly categoryTable = input.required<CategoryTable>();

  deleteSelectedCategories(): void {
    const categories = this.categoryTable().selectedCategories();
    this.confirmationService.confirm({
      header: this.translateService.instant('common.confirmations.deleteHeaderPlural', { items: 'categories' }),
      message: `
        ${this.translateService.instant('common.confirmations.deleteMessagePlural', { count: categories.length, items: 'categories' })}
        <ul class='mt-2 mb-0'>
          ${categories.map(({ name }) => `<li>• <b>${name}</b></li>`).join('')}
        </ul>
      `,
      accept: () => {
        const ids = categories.map(({ id }) => id);
        this.categoryStore.deleteAllById(ids);
      },
    });
  }
}
