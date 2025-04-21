import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ConfirmationService, MessageService } from 'primeng/api';
import { finalize, pipe, tap } from 'rxjs';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../models/category.model';
import { CategoryService } from '../services/category.service';

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  isDialogVisible: boolean;
  selectedCategory: Category | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  isDialogVisible: false,
  selectedCategory: null,
};

export const CategoryStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ categories }) => ({
    categoryCount: computed(() => categories().length),
  })),
  withMethods(
    (
      store,
      categoryService = inject(CategoryService),
      messageService = inject(MessageService),
      confirmationService = inject(ConfirmationService),
    ) => ({
      loadAll: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, { loading: true, error: null });
            categoryService
              .getAll()
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: (categories) => patchState(store, { categories }),
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                },
              });
          }),
        ),
      ),
      create: rxMethod<CreateCategoryDto>(
        pipe(
          tap((category) => {
            patchState(store, { loading: true, error: null });
            categoryService
              .create(category)
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: (createdCategory: Category) => {
                  patchState(store, (state) => ({
                    categories: [...state.categories, createdCategory],
                    isDialogVisible: false,
                    selectedCategory: null,
                  }));
                  messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Categoría Creada',
                  });
                },
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al crear categoría',
                  });
                },
              });
          }),
        ),
      ),
      update: rxMethod<{ id: number; categoryData: UpdateCategoryDto }>(
        pipe(
          tap(({ id, categoryData }) => {
            patchState(store, { loading: true, error: null });
            categoryService
              .update(id, categoryData)
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: (updatedCategory: Category) => {
                  patchState(store, (state) => ({
                    categories: state.categories.map((c) =>
                      c.id === updatedCategory.id ? updatedCategory : c,
                    ),
                    isDialogVisible: false,
                    selectedCategory: null,
                  }));
                  messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Categoría Actualizada',
                  });
                },
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar categoría',
                  });
                },
              });
          }),
        ),
      ),
      deleteWithConfirmation(category: Category): void {
        confirmationService.confirm({
          message: `¿Está seguro de que desea eliminar la categoría "${category.name}"?`,
          header: 'Eliminar categoría',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Eliminar',
          rejectLabel: 'Cancelar',
          acceptButtonStyleClass: 'p-button-danger',
          rejectButtonStyleClass: 'p-button-secondary',
          accept: () => this.delete(category.id),
        });
      },
      delete: rxMethod<number>(
        pipe(
          tap((id) => {
            patchState(store, { loading: true, error: null });
            categoryService
              .delete(id)
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: () => {
                  patchState(store, (state) => ({
                    categories: state.categories.filter((c) => c.id !== id),
                  }));
                  messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Categoría Eliminada',
                  });
                },
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar categoría',
                  });
                },
              });
          }),
        ),
      ),
      openDialogForNew(): void {
        patchState(store, {
          isDialogVisible: true,
          selectedCategory: null,
        });
      },
      openDialogForEdit(category: Category): void {
        patchState(store, {
          isDialogVisible: true,
          selectedCategory: { ...category },
        });
      },
      closeDialog(): void {
        patchState(store, {
          isDialogVisible: false,
          selectedCategory: null,
        });
      },
    }),
  ),
  withHooks({ onInit: ({ loadAll }) => loadAll() }),
);
