import { CommonModule } from '@angular/common';
import { Component, effect, inject, model } from '@angular/core';
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
import { Category } from '../../models/category.model';
import { CategoryStore } from '../../store/category.store';

@Component({
  selector: 'app-category-dialog',
  standalone: true,
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
      [(visible)]="visible"
      [style]="{ width: '450px' }"
      [header]="isEditMode() ? 'Editar Categoría' : 'Crear Categoría'"
      [modal]="true"
      (onHide)="close()"
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
        <p-button label="Cancelar" icon="pi pi-times" text (click)="close()" />
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
  visible = model(false);
  category = model<Category | null>(null);
  readonly categoryStore = inject(CategoryStore);
  private readonly fb = inject(FormBuilder);

  categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });
  isEditMode = model(false);

  constructor() {
    effect(() => {
      const cat = this.category();
      this.isEditMode.set(!!cat);
      if (cat) {
        this.categoryForm.patchValue(cat);
      } else {
        this.categoryForm.reset();
      }
    });
  }

  saveCategory(): void {
    const categoryData = this.categoryForm.value;
    const id = this.category()?.id;
    if (id) {
      this.categoryStore.update({ id, categoryData });
    } else {
      this.categoryStore.create(categoryData);
    }
    this.close();
  }

  close() {
    this.visible.set(false);
    this.category.set(null);
  }
}
