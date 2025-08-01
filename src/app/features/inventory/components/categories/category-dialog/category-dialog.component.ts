import { Component, effect, inject, untracked } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CategoryData } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
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
    ReactiveFormsModule,
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
        categoryStore.selectedCategory()
          ? 'Editar Categoría'
          : 'Crear Categoría'
      "
      modal
    >
      <form [formGroup]="categoryForm" class="flex flex-col gap-6 pt-4">
        @let nameControlInvalid =
          categoryForm.get('name')?.invalid &&
          categoryForm.get('name')?.touched;

        <div class="flex flex-col gap-2" [class.p-invalid]="nameControlInvalid">
          <label for="name" class="font-bold">Nombre</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-tag"></i>
            </p-inputgroup-addon>
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
          </p-inputgroup>

          @if (nameControlInvalid) {
            <small class="text-red-500">El nombre es obligatorio.</small>
          }
        </div>

        <div class="flex flex-col gap-2">
          <label for="description" class="font-bold">Descripción</label>
          <p-inputgroup>
            <p-inputgroup-addon>
              <i class="pi pi-align-left"></i>
            </p-inputgroup-addon>
            <textarea
              rows="3"
              pTextarea
              id="description"
              formControlName="description"
              placeholder="Ingrese una descripción (opcional)"
              class="w-full"
              fluid
            ></textarea>
          </p-inputgroup>
        </div>
      </form>

      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="categoryStore.closeCategoryDialog()"
        />

        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="
            categoryForm.valid
              ? saveCategory()
              : categoryForm.markAllAsTouched()
          "
          [loading]="categoryStore.loading()"
        />
      </ng-template>
    </p-dialog>
  `,
})
export class CategoryDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly categoryStore = inject(CategoryStore);

  readonly categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const category = this.categoryStore.selectedCategory();
      untracked(() => {
        if (category) {
          this.categoryForm.patchValue(category);
        } else {
          this.categoryForm.reset();
        }
      });
    });
  }

  saveCategory(): void {
    const categoryData: CategoryData = this.categoryForm.value;
    const id = this.categoryStore.selectedCategory()?.id;
    if (id) {
      this.categoryStore.update({ id, categoryData });
    } else {
      this.categoryStore.create(categoryData);
    }
    this.categoryStore.closeCategoryDialog();
  }
}
