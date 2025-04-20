import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { CategoryStore } from '../../store/category.store';

@Component({
  selector: 'app-category-table',
  standalone: true,
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
  ],
  template: `
    @if (categoryStore.getError(); as error) {
      <div
        class="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded"
      >
        <p>Error al cargar categorías:</p>
        <p>{{ error }}</p>
        <p-button
          label="Reintentar"
          (onClick)="categoryStore.loadAll()"
          styleClass="p-button-sm mt-2"
          [loading]="categoryStore.isLoading()"
        />
      </div>
    } @else {
      <p-table
        #dt
        [value]="categoryStore.getCategories()"
        [loading]="categoryStore.isLoading()"
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
                    !categoryStore.categoryCount() || categoryStore.isLoading()
                  "
                />
              </p-iconfield>
              <div class="flex gap-2">
                <p-button
                  label="Nueva"
                  icon="pi pi-plus"
                  severity="secondary"
                  (onClick)="categoryStore.openDialogForNew()"
                  pTooltip="Crear nueva categoría"
                  tooltipPosition="top"
                  [disabled]="categoryStore.isLoading()"
                />
                <p-button
                  label="Exportar"
                  icon="pi pi-upload"
                  severity="secondary"
                  (onClick)="dt.exportCSV()"
                  pTooltip="Exportar datos a CSV"
                  tooltipPosition="top"
                  [disabled]="
                    categoryStore.isLoading() || !categoryStore.categoryCount()
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
                (click)="categoryStore.openDialogForEdit(category)"
                pTooltip="Editar"
                tooltipPosition="top"
                [disabled]="categoryStore.isLoading()"
              />
              <p-button
                icon="pi pi-trash"
                severity="danger"
                [rounded]="true"
                [outlined]="true"
                (click)="categoryStore.deleteWithConfirmation(category)"
                pTooltip="Eliminar"
                tooltipPosition="top"
                [disabled]="categoryStore.isLoading()"
              />
            </td>
          </tr>
        </ng-template>
        <ng-template #empty>
          @if (!categoryStore.isLoading() && !categoryStore.categoryCount()) {
            <tr>
              <td [attr.colspan]="3" class="text-center py-4">
                No hay categorías disponibles.
              </td>
            </tr>
          }
        </ng-template>
      </p-table>

      <p-confirmdialog [style]="{ width: '450px' }" />
    }
  `,
})
export class CategoryTableComponent {
  readonly categoryStore = inject(CategoryStore);
}
