import { Component, inject, viewChild } from '@angular/core';
import { CategoryStore } from '@features/inventory/stores/category-store';
import { CategoryDialog } from './category-dialog/category-dialog';
import { CategoryTable } from './category-table/category-table';
import { CategoryToolbar } from './category-toolbar/category-toolbar';

@Component({
  selector: 'app-categories',
  imports: [CategoryToolbar, CategoryTable, CategoryDialog],
  template: `
    <app-category-toolbar [categoryTable]="categoryTable" />

    <app-category-table #categoryTable />

    <app-category-dialog />
  `,
})
export class Categories {
  readonly categoryStore = inject(CategoryStore);
  readonly categoryTable = viewChild.required(CategoryTable);
}
