import { CommonModule } from '@angular/common';
import { Component, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Category } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryDialogComponent } from '../category-dialog/category-dialog.component';

@Component({
  selector: 'app-category-table',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    ConfirmDialogModule,
    CategoryDialogComponent,
    ToolbarModule,
    FileUploadModule,
  ],
  template: `
    @if (categoryStore.error(); as error) {
      <div
        class="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded"
      >
        <p>Error al cargar categorías:</p>
        <p>{{ error }}</p>
        <p-button
          label="Reintentar"
          (onClick)="categoryStore.loadAll()"
          styleClass="p-button-sm mt-2"
          [loading]="categoryStore.loading()"
        />
      </div>
    } @else {
      <p-toolbar class="mb-6">
        <ng-template #start>
          <p-button
            label="Nueva"
            icon="pi pi-plus"
            outlined
            class="mr-2"
            pTooltip="Crear nueva categoría"
            tooltipPosition="top"
            (onClick)="openCategoryDialog()"
          />
          <p-button
            severity="danger"
            label="Eliminar"
            icon="pi pi-trash"
            outlined
            pTooltip="Eliminar categorías seleccionadas"
            tooltipPosition="top"
            (onClick)="
              selectedCategories().length > 1
                ? deleteSelectedCategories()
                : deleteCategory(selectedCategories()[0])
            "
            [disabled]="!selectedCategories().length"
          />
        </ng-template>
        <ng-template #end>
          <p-button
            label="Exportar"
            icon="pi pi-download"
            severity="secondary"
            pTooltip="Exportar categorías a CSV"
            tooltipPosition="top"
            (onClick)="dt.exportCSV()"
          />
        </ng-template>
      </p-toolbar>

      @let columns =
        [
          { field: 'name', header: 'Nombre' },
          { field: 'description', header: 'Descripción' },
        ];
      <p-table
        #dt
        [value]="categoryStore.entities()"
        [loading]="categoryStore.loading()"
        [rows]="10"
        [columns]="columns"
        [paginator]="true"
        [rowsPerPageOptions]="[10, 25, 50]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
        [globalFilterFields]="['name', 'description']"
        [tableStyle]="{ 'min-width': '50rem' }"
        [rowHover]="true"
        dataKey="id"
        [(selection)]="selectedCategories"
      >
        <ng-template #caption>
          <div class="flex items-center justify-between">
            <h5 class="m-0">Administrar Categorías</h5>
            <p-iconfield>
              <p-inputicon><i class="pi pi-search"></i></p-inputicon>
              <input
                pInputText
                type="text"
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                [(ngModel)]="searchValue"
                placeholder="Buscar..."
              />
            </p-iconfield>
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th style="width: 3rem">
              <p-tableHeaderCheckbox />
            </th>
            @for (column of columns; track column.field) {
              <th pSortableColumn="{{ column.field }}">
                <div class="flex items-center gap-2">
                  <span>{{ column.header }}</span>
                  <p-sortIcon field="{{ column.field }}" />
                  <p-columnFilter
                    type="text"
                    field="{{ column.field }}"
                    display="menu"
                    class="ml-auto"
                    placeholder="Filtrar por {{ column.header | lowercase }}"
                    pTooltip="Filtrar por {{ column.header | lowercase }}"
                    tooltipPosition="top"
                  />
                </div>
              </th>
            }
            <th>
              <div class="flex items-center gap-2">
                <span>Acciones</span>
                <button
                  type="button"
                  pButton
                  icon="pi pi-filter-slash"
                  class="p-button-rounded p-button-text p-button-secondary"
                  pTooltip="Limpiar todos los filtros"
                  tooltipPosition="top"
                  (click)="clearAllFilters(dt)"
                  aria-label="Limpiar todos los filtros"
                ></button>
              </div>
            </th>
          </tr>
        </ng-template>
        <ng-template #body let-category let-columns="columns">
          <tr>
            <td style="width: 3rem">
              <p-tableCheckbox [value]="category" />
            </td>
            @for (column of columns; track column.field) {
              <td>{{ category[column.field] }}</td>
            }
            <td>
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="openCategoryDialog(category)"
                pTooltip="Editar categoría"
                tooltipPosition="top"
                [disabled]="categoryStore.loading()"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="deleteCategory(category)"
                pTooltip="Eliminar categoría"
                tooltipPosition="top"
                [disabled]="categoryStore.loading()"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #empty>
          <tr>
            <td [attr.colspan]="columns.length + 2" class="text-center py-4">
              No hay categorías disponibles.
            </td>
          </tr>
        </ng-template>
      </p-table>

      <app-category-dialog
        [(visible)]="dialogVisible"
        [(inputCategory)]="selectedCategory"
      />

      <p-confirmdialog [style]="{ width: '450px' }" />
    }
  `,
})
export class CategoryTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly categoryStore = inject(CategoryStore);

  readonly dialogVisible = signal(false);
  readonly selectedCategory = signal<Category | null>(null);
  readonly searchValue = signal('');
  readonly selectedCategories = linkedSignal<Category[], Category[]>({
    source: this.categoryStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }) => id));
      return prevSelected.filter(({ id }) => entityIds.has(id));
    },
  });

  openCategoryDialog(category?: Category): void {
    this.selectedCategory.set(category ?? null);
    this.dialogVisible.set(true);
  }

  deleteCategory({ id, name }: Category): void {
    this.confirmationService.confirm({
      header: 'Eliminar categoría',
      message: `¿Está seguro de que desea eliminar la categoría <b>${name}</b>?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.categoryStore.delete(id),
    });
  }

  deleteSelectedCategories(): void {
    this.confirmationService.confirm({
      message: `
        ¿Está seguro de que desea eliminar las ${this.selectedCategories().length} categorías seleccionadas?
        <ul class='mt-2 mb-0'>
          ${this.selectedCategories()
            .map(({ name }) => `<li>• <b>${name}</b></li>`)
            .join('')}
        </ul>
      `,
      header: 'Eliminar categorías',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        const ids = this.selectedCategories().map(({ id }) => id);
        this.categoryStore.deleteMany(ids);
      },
    });
  }

  clearAllFilters(dt: Table): void {
    this.searchValue.set('');
    dt.clear();
  }
}
