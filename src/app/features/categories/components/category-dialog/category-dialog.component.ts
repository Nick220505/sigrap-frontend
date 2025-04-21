import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CategoryStore } from '../../store/category.store';

@Component({
  selector: 'app-category-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
  ],
  template: `
    <p-dialog
      [(visible)]="isDialogVisible"
      [style]="{ width: '450px' }"
      [header]="isEditMode() ? 'Editar Categoría' : 'Crear Categoría'"
      [modal]="true"
      (onHide)="categoryStore.closeDialog()"
    >
      <ng-template #content>
        <form [formGroup]="categoryForm" class="flex flex-col gap-6 pt-4">
          @let nameControlInvalid =
            categoryForm.get('name')?.invalid &&
            categoryForm.get('name')?.touched;
          <div
            class="flex flex-col gap-2"
            [class.p-invalid]="nameControlInvalid"
          >
            <label for="name" class="font-bold">Nombre</label>
            <input
              type="text"
              pInputText
              id="name"
              formControlName="name"
              placeholder="Ingrese el nombre de la categoría"
              [ngClass]="{ 'ng-dirty ng-invalid': nameControlInvalid }"
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
      </ng-template>
      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="categoryStore.closeDialog()"
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
  `,
})
export class CategoryDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly categoryStore = inject(CategoryStore);

  categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });
  isDialogVisible = signal(false);
  isEditMode = signal(false);

  constructor() {
    effect(() => {
      const isDialogVisible = this.categoryStore.isDialogVisible();
      const selectedCategory = this.categoryStore.selectedCategory();
      this.isDialogVisible.set(isDialogVisible);
      this.isEditMode.set(!!selectedCategory);
      if (selectedCategory) {
        this.categoryForm.patchValue(selectedCategory);
      } else {
        this.categoryForm.reset();
      }
    });
  }

  saveCategory(): void {
    const categoryData = this.categoryForm.value;
    const id = this.categoryStore.selectedCategory()?.id;
    if (id) {
      this.categoryStore.update({ id, categoryData });
    } else {
      this.categoryStore.create(categoryData);
    }
  }
}
