import { Component, inject, viewChild } from '@angular/core';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CategoryTableComponent } from './category-table/category-table.component';
import { CategoryToolbarComponent } from './category-toolbar/category-toolbar.component';

@Component({
  selector: 'app-categories',
  imports: [
    ToastModule,
    ConfirmDialogModule,
    CategoryToolbarComponent,
    CategoryTableComponent,
    CategoryDialogComponent,
  ],
  template: `
    <p-toast />

    <app-category-toolbar [categoryTable]="categoryTable" />

    <app-category-table #categoryTable />

    <app-category-dialog />

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class CategoriesComponent {
  readonly categoryStore = inject(CategoryStore);
  readonly categoryTable = viewChild.required(CategoryTableComponent);
}
