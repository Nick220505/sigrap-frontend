import { Component, signal, viewChild } from '@angular/core';
import { Category } from '@features/inventory/models/category.model';
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

    <app-category-toolbar
      [categoryTable]="categoryTable"
      [(dialogVisible)]="dialogVisible"
      [(selectedCategory)]="selectedCategory"
    />

    <app-category-table
      #categoryTable
      [(dialogVisible)]="dialogVisible"
      [(selectedCategory)]="selectedCategory"
    />

    <app-category-dialog
      [(visible)]="dialogVisible"
      [selectedCategory]="selectedCategory()"
    />

    <p-confirmdialog [style]="{ width: '450px' }" />
  `,
})
export class CategoriesComponent {
  readonly categoryTable = viewChild.required(CategoryTableComponent);
  readonly dialogVisible = signal(false);
  readonly selectedCategory = signal<Category | null>(null);
}
