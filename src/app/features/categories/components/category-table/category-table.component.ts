import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { Category } from '../../models/category.model';
import { CategoryStore } from '../../store/category.store';
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
      <p-table
        #dt
        [value]="categoryStore.entities()"
        [loading]="categoryStore.loading()"
        [rows]="10"
        [columns]="[{ field: 'name', header: 'Nombre' }]"
        [paginator]="true"
        [globalFilterFields]="['name', 'description']"
        [tableStyle]="{ 'min-width': '40rem' }"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10, 20, 30]"
      >
        <ng-template #caption>
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
          >
            <h5 class="text-xl font-semibold m-0">Administrar Categorías</h5>
            <div class="flex flex-col sm:flex-row sm:items-center gap-2">
              <p-iconfield iconPosition="left">
                <p-inputicon class="pi pi-search" />
                <input
                  pInputText
                  type="text"
                  (input)="
                    dt.filterGlobal($any($event.target).value, 'contains')
                  "
                  placeholder="Buscar..."
                  class="w-full sm:w-auto"
                  [disabled]="
                    !categoryStore.categoriesCount() || categoryStore.loading()
                  "
                />
              </p-iconfield>
              <div class="flex gap-2">
                <p-button
                  label="Nueva"
                  icon="pi pi-plus"
                  severity="secondary"
                  (onClick)="openDialogForNew()"
                  pTooltip="Crear nueva categoría"
                  tooltipPosition="top"
                  [disabled]="categoryStore.loading()"
                />
                <p-button
                  label="Exportar"
                  icon="pi pi-upload"
                  severity="secondary"
                  (onClick)="dt.exportCSV()"
                  pTooltip="Exportar datos a CSV"
                  tooltipPosition="top"
                  [disabled]="
                    categoryStore.loading() || !categoryStore.categoriesCount()
                  "
                />
              </div>
            </div>
          </div>
        </ng-template>
        <ng-template #header>
          <tr>
            <th scope="col" pSortableColumn="name" style="min-width: 16rem">
              Nombre
              <p-sortIcon field="name" />
            </th>
            <th
              scope="col"
              pSortableColumn="description"
              style="min-width: 20rem"
            >
              Descripción
              <p-sortIcon field="description" />
            </th>
            <th scope="col" style="width: 8rem">Acciones</th>
          </tr>
        </ng-template>
        <ng-template #body let-category>
          <tr>
            <td style="min-width: 16rem">{{ category.name }}</td>
            <td style="min-width: 20rem">{{ category.description }}</td>
            <td style="width: 8rem">
              <p-button
                icon="pi pi-pencil"
                class="mr-2"
                [rounded]="true"
                [outlined]="true"
                (click)="openDialogForEdit(category)"
                pTooltip="Editar"
                tooltipPosition="top"
                [disabled]="categoryStore.loading()"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="confirmDelete(category)"
                pTooltip="Eliminar"
                tooltipPosition="top"
                [disabled]="categoryStore.loading()"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #empty>
          @if (!categoryStore.loading() && !categoryStore.categoriesCount()) {
            <tr>
              <td [attr.colspan]="3" class="text-center py-4">
                No hay categorías disponibles.
              </td>
            </tr>
          }
        </ng-template>
      </p-table>

      <app-category-dialog
        [(visible)]="dialogVisible"
        [(category)]="selectedCategory"
      ></app-category-dialog>

      <p-confirmdialog [style]="{ width: '450px' }" />
    }
  `,
})
export class CategoryTableComponent {
  private readonly confirmationService = inject(ConfirmationService);
  readonly categoryStore = inject(CategoryStore);

  dialogVisible = signal(false);
  selectedCategory = signal<Category | null>(null);

  openDialogForNew() {
    this.selectedCategory.set(null);
    this.dialogVisible.set(true);
  }

  openDialogForEdit(category: Category) {
    this.selectedCategory.set(category);
    this.dialogVisible.set(true);
  }

  confirmDelete({ id, name }: Category): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la categoría "${name}"?`,
      header: 'Eliminar categoría',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.categoryStore.delete(id),
    });
  }
}
