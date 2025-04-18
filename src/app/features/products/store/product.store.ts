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
import { MessageService } from 'primeng/api';
import { catchError, finalize, of, pipe, switchMap, tap } from 'rxjs';
import { Product, ProductService } from '../services/product.service';

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  isDialogVisible: boolean;
  selectedProductForEdit: Product | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  isDialogVisible: false,
  selectedProductForEdit: null,
};

export const ProductStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(
    ({
      products,
      loading,
      error,
      isDialogVisible,
      selectedProductForEdit,
    }) => ({
      isLoading: computed(() => loading()),
      getError: computed(() => error()),
      getProducts: computed(() => products()),
      productCount: computed(() => products().length),
      selectIsDialogVisible: computed(() => isDialogVisible()),
      selectSelectedProductForEdit: computed(() => selectedProductForEdit()),
    }),
  ),
  withMethods(
    (
      store,
      productService = inject(ProductService),
      messageService = inject(MessageService),
    ) => ({
      loadProducts: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            productService.getProducts().pipe(
              tap((products: Product[]) => patchState(store, { products })),
              catchError((err: Error) => {
                console.error('Store Error loading products:', err);
                patchState(store, { error: err.message });
                return of([]);
              }),
              finalize(() => patchState(store, { loading: false })),
            ),
          ),
        ),
      ),
      addProduct: rxMethod<Omit<Product, 'id' | 'code'>>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((product) =>
            productService.createProduct(product).pipe(
              tap((createdProduct: Product) => {
                patchState(store, (state) => ({
                  products: [...state.products, createdProduct],
                }));
                messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Producto Creado',
                });
                patchState(store, {
                  isDialogVisible: false,
                  selectedProductForEdit: null,
                });
              }),
              catchError((err: Error) => {
                console.error('Store Error creating product:', err);
                patchState(store, { error: err.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al crear producto',
                });
                return of(undefined);
              }),
              finalize(() => patchState(store, { loading: false })),
            ),
          ),
        ),
      ),
      updateProduct: rxMethod<Product>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((product) =>
            productService.updateProduct(product).pipe(
              tap((updatedProduct: Product) => {
                patchState(store, (state) => ({
                  products: state.products.map((p) =>
                    p.id === updatedProduct.id ? updatedProduct : p,
                  ),
                }));
                messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Producto Actualizado',
                });
                patchState(store, {
                  isDialogVisible: false,
                  selectedProductForEdit: null,
                });
              }),
              catchError((err: Error) => {
                console.error('Store Error updating product:', err);
                patchState(store, { error: err.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar producto',
                });
                return of(undefined);
              }),
              finalize(() => patchState(store, { loading: false })),
            ),
          ),
        ),
      ),
      deleteProduct: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((id) =>
            productService.deleteProductById(id).pipe(
              tap(() => {
                patchState(store, (state) => ({
                  products: state.products.filter((p) => p.id !== id),
                }));
                messageService.add({
                  severity: 'success',
                  summary: 'Éxito',
                  detail: 'Producto Eliminado',
                });
              }),
              catchError((err: Error) => {
                console.error('Store Error deleting product:', err);
                patchState(store, { error: err.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar producto',
                });
                return of(undefined);
              }),
              finalize(() => patchState(store, { loading: false })),
            ),
          ),
        ),
      ),
      openDialogForNew(): void {
        patchState(store, {
          isDialogVisible: true,
          selectedProductForEdit: null,
        });
      },
      openDialogForEdit(product: Product): void {
        patchState(store, {
          isDialogVisible: true,
          selectedProductForEdit: { ...product },
        });
      },
      closeDialog(): void {
        patchState(store, {
          isDialogVisible: false,
          selectedProductForEdit: null,
        });
      },
    }),
  ),
  withHooks({
    onInit({ loadProducts }) {
      loadProducts();
    },
  }),
);
