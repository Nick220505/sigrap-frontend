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
import {
  CreateProductDto,
  Product,
  UpdateProductDto,
} from '../models/product.model';
import { ProductService } from '../services/product.service';

export interface ProductState {
  loading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  dialogVisible: boolean;
}

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withEntities<Product>(),
  withState<ProductState>({
    loading: false,
    error: null,
    selectedProduct: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    productsCount: computed(() => entities().length),
  })),
  withProps(() => ({
    productService: inject(ProductService),
    messageService: inject(MessageService),
  })),
  withMethods(({ productService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          productService.findAll().pipe(
            tapResponse({
              next: (products) => {
                patchState(store, setAllEntities(products));
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
    create: rxMethod<CreateProductDto>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((product) =>
          productService.create(product).pipe(
            tapResponse({
              next: (createdProduct: Product) => {
                patchState(store, addEntity(createdProduct));
                messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Producto Creado',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al crear producto',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    update: rxMethod<{ id: number; productData: UpdateProductDto }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, productData }) =>
          productService.update(id, productData).pipe(
            tapResponse({
              next: (updatedProduct: Product) => {
                patchState(
                  store,
                  updateEntity({ id, changes: updatedProduct }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Producto Actualizado',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar producto',
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
          productService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Producto Eliminado',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar producto',
                });
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
          productService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Productos eliminados',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar productos',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openProductDialog: (product?: Product) => {
      patchState(store, {
        selectedProduct: product,
        dialogVisible: true,
      });
    },

    closeProductDialog: () => {
      patchState(store, { dialogVisible: false });
    },

    clearSelectedProduct: () => {
      patchState(store, { selectedProduct: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
