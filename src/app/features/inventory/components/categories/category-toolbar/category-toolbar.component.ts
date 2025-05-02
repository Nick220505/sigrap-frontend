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
          label="Nueva"
          icon="pi pi-plus"
          outlined
          class="mr-2"
          pTooltip="Crear nueva categoría"
          tooltipPosition="top"
          (onClick)="categoryStore.openCategoryDialog()"
        />
        <p-button
          severity="danger"
          label="Eliminar"
          icon="pi pi-trash"
          outlined
          pTooltip="Eliminar categorías seleccionadas"
          tooltipPosition="top"
          (onClick)="deleteSelectedCategories()"
          [disabled]="categoryTable().selectedCategories().length === 0"
        />
      </ng-template>
      <ng-template #end>
        <p-button
          label="Exportar"
          icon="pi pi-download"
          severity="secondary"
          pTooltip="Exportar categorías a CSV"
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
      message: `
      ¿Está seguro de que desea eliminar las ${categories.length} categorías seleccionadas?
      <ul class='mt-2 mb-0'>
          ${categories.map(({ name }) => `<li>• <b>${name}</b></li>`).join('')}
          </ul>
      `,
      header: 'Eliminar categorías',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        const ids = categories.map(({ id }) => id);
        this.categoryStore.deleteAllById(ids);
      },
    });
  }
}
