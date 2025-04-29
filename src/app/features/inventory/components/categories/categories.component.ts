import { Component, inject, linkedSignal, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Category } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-categories',
  imports: [
    ToastModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    ConfirmDialogModule,
    ToolbarModule,
    FileUploadModule,
    MessageModule,
    DialogModule,
    TextareaModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
    <p-toast />
    <p-toolbar styleClass="mb-6">
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
          [disabled]="!categoryStore.entities().length"
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
      paginator
      [rowsPerPageOptions]="[10, 25, 50]"
      showCurrentPageReport
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} categorías"
      [globalFilterFields]="['name', 'description']"
      [tableStyle]="{ 'min-width': '50rem' }"
      rowHover
      dataKey="id"
      [(selection)]="selectedCategories"
    >
      <ng-template #caption>
        <div
          class="flex flex-col sm:flex-row items-center gap-4 sm:justify-between w-full"
        >
          <div class="self-start">
            <h5 class="m-0 text-left">Administrar Categorías</h5>
          </div>
          <div class="flex items-center w-full sm:w-auto">
            <p-iconfield class="w-full">
              <p-inputicon>
                <i class="pi pi-search"></i>
              </p-inputicon>
              <input
                pInputText
                type="text"
                (input)="dt.filterGlobal($any($event.target).value, 'contains')"
                [(ngModel)]="searchValue"
                placeholder="Buscar..."
                class="w-full"
              />
            </p-iconfield>
          </div>
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
                  placeholder="Filtrar por {{ column.header.toLowerCase() }}"
                  pTooltip="Filtrar por {{ column.header.toLowerCase() }}"
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
              rounded
              outlined
              (click)="openCategoryDialog(category)"
              pTooltip="Editar categoría"
              tooltipPosition="top"
              [disabled]="categoryStore.loading()"
            />
            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteCategory(category)"
              pTooltip="Eliminar categoría"
              tooltipPosition="top"
              [disabled]="categoryStore.loading()"
            />
          </td>
        </tr>
      </ng-template>
      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (categoryStore.error(); as error) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error al cargar categorías:</strong>
                    <p>{{ error }}</p>
                    <div class="flex justify-center">
                      <p-button
                        label="Reintentar"
                        (onClick)="categoryStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="categoryStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No se encontraron categorías.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>

    <p-dialog
      [(visible)]="dialogVisible"
      [style]="{ width: '450px' }"
      [header]="selectedCategory() ? 'Editar Categoría' : 'Crear Categoría'"
      modal
    >
      <form [formGroup]="categoryForm" class="flex flex-col gap-6 pt-4">
        @let nameControlInvalid =
          categoryForm.get('name')?.invalid &&
          categoryForm.get('name')?.touched;
        <div class="flex flex-col gap-2" [class.p-invalid]="nameControlInvalid">
          <label for="name" class="font-bold">Nombre</label>
          <input
            type="text"
            pInputText
            id="name"
            formControlName="name"
            placeholder="Ingrese el nombre de la categoría"
            [class.ng-dirty]="nameControlInvalid"
            [class.ng-invalid]="nameControlInvalid"
            required
            fluid
          />
          @if (nameControlInvalid) {
            <small class="text-red-500">El nombre es obligatorio.</small>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold">Descripción</label>
          <textarea
            rows="3"
            pTextarea
            id="description"
            formControlName="description"
            placeholder="Ingrese una descripción (opcional)"
            fluid
          ></textarea>
        </div>
      </form>
      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="dialogVisible.set(false)"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="
            categoryForm.valid
              ? saveCategory()
              : categoryForm.markAllAsTouched()
          "
          [disabled]="categoryStore.loading()"
        />
      </ng-template>
    </p-dialog>

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class CategoriesComponent {
  private readonly confirmationService = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  readonly categoryStore = inject(CategoryStore);

  readonly dialogVisible = signal(false);
  readonly selectedCategory = signal<Category | null>(null);
  readonly searchValue = signal('');
  readonly selectedCategories = linkedSignal<Category[], Category[]>({
    source: this.categoryStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: Category) => id));
      return prevSelected.filter(({ id }: Category) => entityIds.has(id));
    },
  });

  readonly categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  openCategoryDialog(category?: Category): void {
    this.selectedCategory.set(category ?? null);
    if (category) {
      this.categoryForm.patchValue(category);
    } else {
      this.categoryForm.reset();
    }
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
        this.categoryStore.deleteAllById(ids);
      },
    });
  }

  clearAllFilters(dt: Table): void {
    this.searchValue.set('');
    dt.clear();
  }

  saveCategory(): void {
    const categoryData = this.categoryForm.value;
    const id = this.selectedCategory()?.id;
    if (id) {
      this.categoryStore.update({ id, categoryData });
    } else {
      this.categoryStore.create(categoryData);
    }
    this.dialogVisible.set(false);
  }
}
