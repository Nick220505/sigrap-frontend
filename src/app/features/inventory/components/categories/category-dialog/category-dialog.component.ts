import { Component, effect, inject, input, model } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Category } from '@features/inventory/models/category.model';
import { CategoryStore } from '@features/inventory/stores/category.store';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
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
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [style]="{ width: '450px' }"
      [header]="category() ? 'Editar Categoría' : 'Crear Categoría'"
      modal
    >
      <form [formGroup]="categoryForm" class="flex flex-col gap-6 pt-4">
        @let nameControlInvalid =
          categoryForm.get('name')?.invalid &&
          categoryForm.get('name')?.touched;
        <div class="flex flex-col gap-2" [class.p-invalid]="nameControlInvalid">
          <label for="name" class="font-bold">Nombre</label>
          <input
            type="text"
            pInputText
            id="name"
            formControlName="name"
            placeholder="Ingrese el nombre de la categoría"
            [class.ng-dirty]="nameControlInvalid"
            [class.ng-invalid]="nameControlInvalid"
            required
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
          ></textarea>
        </div>
      </form>
      <ng-template #footer>
        <p-button
          label="Cancelar"
          icon="pi pi-times"
          text
          (click)="visible.set(false)"
        />
        <p-button
          label="Guardar"
          icon="pi pi-check"
          (click)="
            categoryForm.valid
              ? saveCategory()
              : categoryForm.markAllAsTouched()
          "
        />
      </ng-template>
    </p-dialog>
  `,
})
export class CategoryDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly categoryStore = inject(CategoryStore);

  readonly visible = model(false);
  readonly category = input<Category | null>(null);

  readonly categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    effect(() => {
      const category = this.category();
      if (category) {
        this.categoryForm.patchValue(category);
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
    this.visible.set(false);
  }
}
