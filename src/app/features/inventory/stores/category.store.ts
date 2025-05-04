import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import {
  addEntity,
  removeEntities,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import { CategoryData, CategoryInfo } from '../models/category.model';
import { CategoryService } from '../services/category.service';

export interface CategoryState {
  loading: boolean;
  error: string | null;
  selectedCategory: CategoryInfo | null;
  dialogVisible: boolean;
}

export const CategoryStore = signalStore(
  { providedIn: 'root' },
  withEntities<CategoryInfo>(),
  withState<CategoryState>({
    loading: false,
    error: null,
    selectedCategory: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    categoriesCount: computed(() => entities().length),
  })),
  withProps(() => ({
    categoryService: inject(CategoryService),
    messageService: inject(MessageService),
  })),
  withMethods(({ categoryService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          categoryService.findAll().pipe(
            tapResponse({
              next: (categories) => {
                patchState(store, setAllEntities(categories));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    create: rxMethod<CategoryData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((categoryData) =>
          categoryService.create(categoryData).pipe(
            tapResponse({
              next: (createdCategory: CategoryInfo) => {
                patchState(store, addEntity(createdCategory));
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
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    update: rxMethod<{ id: number; categoryData: Partial<CategoryData> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, categoryData }) =>
          categoryService.update(id, categoryData).pipe(
            tapResponse({
              next: (updatedCategory: CategoryInfo) => {
                patchState(
                  store,
                  updateEntity({ id, changes: updatedCategory }),
                );
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
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    delete: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          categoryService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Categoría Eliminada',
                });
              },
              error: ({ error: { status, message } }: HttpErrorResponse) => {
                patchState(store, { error: message });
                if (
                  status === 409 &&
                  typeof message === 'string' &&
                  message.includes('violates foreign key constraint')
                ) {
                  const category = store.entities().find((c) => c.id === id);
                  const categoryName = category ? category.name : `ID ${id}`;
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `No se puede eliminar la categoría "${categoryName}" porque está siendo utilizada por un producto.`,
                  });
                } else {
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar categoría',
                  });
                }
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    deleteAllById: rxMethod<number[]>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((ids) =>
          categoryService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Categorías eliminadas',
                });
              },
              error: ({ error: { status, message } }: HttpErrorResponse) => {
                patchState(store, { error: message });
                if (
                  status === 409 &&
                  typeof message === 'string' &&
                  message.includes('violates foreign key constraint')
                ) {
                  let categoryId: number | undefined = undefined;
                  const match = /Key \(id\)=\((\d+)\)/.exec(message);
                  if (match) {
                    categoryId = Number(match[1]);
                  }
                  const category = categoryId
                    ? store.entities().find((c) => c.id === categoryId)
                    : undefined;
                  let categoryName: string;
                  if (category) {
                    categoryName = category.name;
                  } else if (categoryId !== undefined) {
                    categoryName = `ID ${categoryId}`;
                  } else {
                    categoryName = 'desconocida';
                  }
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `No se puede eliminar la categoría "${categoryName}" porque está siendo utilizada por un producto.`,
                  });
                } else {
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar categorías',
                  });
                }
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openCategoryDialog: (category?: CategoryInfo) => {
      patchState(store, {
        selectedCategory: category,
        dialogVisible: true,
      });
    },

    closeCategoryDialog: () => {
      patchState(store, { dialogVisible: false });
    },

    clearSelectedCategory: () => {
      patchState(store, { selectedCategory: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
