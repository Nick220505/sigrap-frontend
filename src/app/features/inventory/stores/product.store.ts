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
import { ProductData, ProductInfo } from '../models/product.model';
import { ProductService } from '../services/product.service';

export interface ProductState {
  loading: boolean;
  error: string | null;
  selectedProduct: ProductInfo | null;
  dialogVisible: boolean;
}

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withEntities<ProductInfo>(),
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
    create: rxMethod<ProductData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((productData) =>
          productService.create(productData).pipe(
            tapResponse({
              next: (createdProduct: ProductInfo) => {
                patchState(store, addEntity(createdProduct));
                messageService.add({
                  severity: 'success',
                  summary: 'Producto creado',
                  detail: `El producto ${createdProduct.name} ha sido creado correctamente`,
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
    update: rxMethod<{ id: number; productData: Partial<ProductData> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, productData }) =>
          productService.update(id, productData).pipe(
            tapResponse({
              next: (updatedProduct: ProductInfo) => {
                patchState(
                  store,
                  updateEntity({ id, changes: updatedProduct }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Producto actualizado',
                  detail: `El producto ${updatedProduct.name} ha sido actualizado correctamente`,
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
                  summary: 'Producto eliminado',
                  detail: 'El producto ha sido eliminado correctamente',
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
                  summary: 'Productos eliminados',
                  detail:
                    'Los productos seleccionados han sido eliminados correctamente',
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

    openProductDialog: (product?: ProductInfo) => {
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
