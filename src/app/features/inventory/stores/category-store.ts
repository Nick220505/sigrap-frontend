import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
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
import { CategoryData, CategoryInfo } from '../models/category';
import { CategoryService } from '../services/category';

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
                  summary: 'Category created',
                  detail: `Category ${createdCategory.name} has been created successfully`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error creating category',
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
                  summary: 'Category updated',
                  detail: `Category ${updatedCategory.name} has been updated successfully`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error updating category',
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
                  summary: 'Category deleted',
                  detail: 'The category has been deleted successfully',
                });
              },
              error: ({ error: { status, message } }: HttpErrorResponse) => {
                patchState(store, { error: message });
                if (
                  status === HttpStatusCode.Conflict &&
                  typeof message === 'string' &&
                  message.includes('violates foreign key constraint')
                ) {
                  const category = store.entities().find((c) => c.id === id);
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Cannot delete category "${category?.name}" because it is being used by a product.`,
                  });
                } else {
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error deleting category',
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
                  summary: 'Categories deleted',
                  detail:
                    'The selected categories have been deleted successfully',
                });
              },
              error: ({ error: { status, message } }: HttpErrorResponse) => {
                patchState(store, { error: message });
                if (
                  status === HttpStatusCode.Conflict &&
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
                    categoryName = 'unknown';
                  }
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Cannot delete category "${categoryName}" because it is being used by a product.`,
                  });
                } else {
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error deleting categories',
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

