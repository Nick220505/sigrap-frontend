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
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '../models/category.model';
import { CategoryService } from '../services/category.service';

export interface CategoryState {
  loading: boolean;
  error: string | null;
}

export const CategoryStore = signalStore(
  { providedIn: 'root' },
  withEntities<Category>(),
  withState<CategoryState>({
    loading: false,
    error: null,
  }),
  withComputed(({ entities }) => ({
    categoriesCount: computed(() => entities().length),
  })),
  withProps(() => ({
    categoryService: inject(CategoryService),
    messageService: inject(MessageService),
  })),
  withMethods(({ categoryService, messageService, ...store }) => ({
    loadAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          categoryService.getAll().pipe(
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
    create: rxMethod<CreateCategoryDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((category) =>
          categoryService.create(category).pipe(
            tapResponse({
              next: (createdCategory: Category) => {
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
    update: rxMethod<{ id: number; categoryData: UpdateCategoryDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, categoryData }) =>
          categoryService.update(id, categoryData).pipe(
            tapResponse({
              next: (updatedCategory: Category) => {
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
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar categoría',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
  withHooks({
    onInit({ loadAll }) {
      loadAll();
    },
  }),
);
