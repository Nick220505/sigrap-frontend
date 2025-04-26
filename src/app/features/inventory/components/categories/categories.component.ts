import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CategoryTableComponent } from './category-table/category-table.component';

@Component({
  selector: 'app-categories',
  imports: [ToastModule, CategoryDialogComponent, CategoryTableComponent],
  template: `
    <p-toast />
    <app-category-dialog />
    <app-category-table />
  `,
})
export class CategoriesComponent {}
