import {
  Component,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryInfo } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category-store';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { Table, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-category-table',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    MessageModule,
    FormsModule,
    TranslateModule,
  ],
  template: `
    @let columns =
      [
        { field: 'name', header: 'Name' },
        { field: 'description', header: 'Description' },
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
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords} categories"
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
            <h5 class="m-0 text-left">Manage Categories</h5>
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
                [placeholder]="'common.searchPlaceholder' | translate"
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
                  placeholder="Filter by {{ column.header.toLowerCase() }}"
                  pTooltip="Filter by {{ column.header.toLowerCase() }}"
                  tooltipPosition="top"
                />
              </div>
            </th>
          }

          <th>
            <div class="flex items-center gap-2">
              <span>Actions</span>
              <button
                type="button"
                pButton
                icon="pi pi-filter-slash"
                class="p-button-rounded p-button-text p-button-secondary"
                [pTooltip]="'common.clearAllFilters' | translate"
                tooltipPosition="top"
                (click)="clearAllFilters()"
                [attr.aria-label]="'common.clearAllFilters' | translate"
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
              (click)="categoryStore.openCategoryDialog(category)"
              pTooltip="Edit category"
              tooltipPosition="top"
              [disabled]="categoryStore.loading()"
            />

            <p-button
              icon="pi pi-trash"
              severity="danger"
              rounded
              outlined
              (click)="deleteCategory(category)"
              pTooltip="Delete category"
              tooltipPosition="top"
              [disabled]="categoryStore.loading()"
            />
          </td>
        </tr>
      </ng-template>

      <ng-template #emptymessage>
        <tr>
          <td [attr.colspan]="columns.length + 2" class="text-center py-4">
            @if (categoryStore.error()) {
              <div class="flex justify-center p-6">
                <p-message severity="error">
                  <div class="flex flex-col gap-4 text-center p-3">
                    <strong>Error loading categories:</strong>
                    <p>{{ categoryStore.error() }}</p>
                    <div class="flex justify-center">
                      <p-button
                        [label]="'common.retry' | translate"
                        (onClick)="categoryStore.findAll()"
                        styleClass="p-button-sm"
                        [loading]="categoryStore.loading()"
                      />
                    </div>
                  </div>
                </p-message>
              </div>
            } @else {
              <p>No categories found.</p>
            }
          </td>
        </tr>
      </ng-template>
    </p-table>
  `,
})
export class CategoryTable {
  private readonly confirmationService = inject(ConfirmationService);
  readonly categoryStore = inject(CategoryStore);

  readonly dt = viewChild.required<Table>('dt');
  readonly searchValue = signal('');
  readonly selectedCategories = linkedSignal<CategoryInfo[], CategoryInfo[]>({
    source: this.categoryStore.entities,
    computation: (entities, previous) => {
      const prevSelected = previous?.value ?? [];
      const entityIds = new Set(entities.map(({ id }: CategoryInfo) => id));
      return prevSelected.filter(({ id }: CategoryInfo) => entityIds.has(id));
    },
  });

  clearAllFilters(): void {
    this.searchValue.set('');
    this.dt().clear();
  }

  deleteCategory({ id, name }: CategoryInfo): void {
    this.confirmationService.confirm({
      header: 'Delete category',
      message: `Are you sure you want to delete category <b>${name}</b>?`,
      accept: () => this.categoryStore.delete(id),
    });
  }
}
