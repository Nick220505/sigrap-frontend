import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { CategoryDialogComponent } from './category-dialog/category-dialog.component';
import { CategoryManagementComponent } from './category-management/category-management.component';

@Component({
  selector: 'app-categories',
  imports: [ToastModule, CategoryDialogComponent, CategoryManagementComponent],
  template: `
    <p-toast />
    <app-category-dialog />
    <app-category-management />
  `,
})
export class CategoriesComponent {}
