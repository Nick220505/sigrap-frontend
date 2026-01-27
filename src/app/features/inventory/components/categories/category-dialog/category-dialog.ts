import { Component, effect, inject, signal, untracked } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { CategoryData } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category-store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-category-dialog',
  imports: [
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FormField,
    InputGroupModule,
    InputGroupAddonModule,
  ],
  template: `
    <p-dialog
      [visible]="categoryStore.dialogVisible()"
      (visibleChange)="
        $event
          ? categoryStore.openCategoryDialog()
          : categoryStore.closeCategoryDialog()
      "
      [style]="{ width: '450px' }"
      [header]="
        categoryStore.selectedCategory() ? 'Edit Category' : 'Create Category'
      "
      modal
    >
      <form
        (submit)="$event.preventDefault(); onSubmit()"
        class="flex flex-col gap-6 pt-4"
      >
        @let nameInvalid =
          categoryForm.name().invalid() && categoryForm.name().touched();
        @let nameErrors = categoryForm.name().errors();

        <div class="flex flex-col gap-2" [class.p-invalid]="nameInvalid">
          <label for="name" class="font-bold">Name</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-tag"></i>
            </p-inputgroup-addon>
            <input
              type="text"
              pInputText
              id="name"
              [formField]="categoryForm.name"
              placeholder="Enter category name"
              [class.ng-dirty]="nameInvalid"
              [class.ng-invalid]="nameInvalid"
              fluid
            />
          </p-inputgroup>

          @if (nameInvalid) {
            <ul>
              @for (error of nameErrors; track error.kind) {
                <li class="text-red-500">{{ error.message }}</li>
              }
            </ul>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold">Description</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-align-left"></i>
            </p-inputgroup-addon>
            <textarea
              rows="3"
              id="description"
              [formField]="categoryForm.description"
              placeholder="Enter a description (optional)"
              class="w-full"
              fluid
            ></textarea>
          </p-inputgroup>
        </div>
      </form>

      <ng-template #footer>
        <p-button
          label="Cancel"
          icon="pi pi-times"
          text
          (click)="categoryStore.closeCategoryDialog()"
        />

        <p-button
          label="Save"
          icon="pi pi-check"
          type="submit"
          (click)="onSubmit()"
          [loading]="categoryStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class CategoryDialog {
  readonly categoryStore = inject(CategoryStore);

  private readonly categoryModel = signal({
    name: '',
    description: '',
  });

  readonly categoryForm = form(this.categoryModel, (category) => {
    required(category.name, { message: 'Name is required.' });
  });

  constructor() {
    effect(() => {
      const category = this.categoryStore.selectedCategory();
      untracked(() => {
        if (category) {
          this.categoryModel.set({
            name: category.name,
            description: category.description ?? '',
          });
        } else {
          this.categoryModel.set({
            name: '',
            description: '',
          });
        }
      });
    });
  }

  onSubmit(): void {
    if (this.categoryForm().valid()) {
      this.saveCategory();
      return;
    }

    this.categoryForm.name().markAsTouched();
  }

  saveCategory(): void {
    const categoryData: CategoryData = this.categoryForm().value();
    const id = this.categoryStore.selectedCategory()?.id;
    if (id) {
      this.categoryStore.update({ id, categoryData });
    } else {
      this.categoryStore.create(categoryData);
    }
    this.categoryStore.closeCategoryDialog();
  }
}
