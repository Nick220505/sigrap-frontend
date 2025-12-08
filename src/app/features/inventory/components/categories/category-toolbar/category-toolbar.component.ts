import { Component, inject, input } from '@angular/core';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryTableComponent } from '../category-table/category-table.component';

@Component({
  selector: 'app-category-toolbar',
  imports: [ToolbarModule, ButtonModule, TooltipModule],
  template: `
    <p-toolbar styleClass="mb-6">
      <ng-template #start>
        <p-button
          label="New"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Create new category"
          tooltipPosition="top"
          (onClick)="categoryStore.openCategoryDialog()"
        />

        <p-button
          severity="danger"
          label="Delete"
          icon="pi pi-trash"
          outlined
          pTooltip="Delete selected categories"
          tooltipPosition="top"
          (onClick)="deleteSelectedCategories()"
          [disabled]="categoryTable().selectedCategories().length === 0"
        />
      </ng-template>

      <ng-template #end>
        <p-button
          label="Export"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Export categories to CSV"
          tooltipPosition="top"
          (onClick)="categoryTable().dt().exportCSV()"
          [disabled]="categoryStore.categoriesCount() === 0"
        />
      </ng-template>
    </p-toolbar>
  `,
})
export class CategoryToolbarComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly categoryStore = inject(CategoryStore);

  readonly categoryTable = input.required<CategoryTableComponent>();

  deleteSelectedCategories(): void {
    const categories = this.categoryTable().selectedCategories();
    this.confirmationService.confirm({
      header: 'Delete categories',
      message: `
      Are you sure you want to delete the ${categories.length} selected categories?
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
