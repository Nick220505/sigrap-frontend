import { HttpErrorResponse } from '@angular/common/http';
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
import {
  catchError,
  finalize,
  forkJoin,
  map,
  of,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { Product } from '../models/product.model';
import { ProductService } from '../services/product.service';

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  isDialogVisible: boolean;
  selectedProductForEdit: Product | null;
  selectedProductIds: ReadonlySet<string>;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  isDialogVisible: false,
  selectedProductForEdit: null,
  selectedProductIds: new Set<string>(),
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
      selectedProductIds,
    }) => ({
      isLoading: computed(() => loading()),
      getError: computed(() => error()),
      getProducts: computed(() => products()),
      productCount: computed(() => products().length),
      selectIsDialogVisible: computed(() => isDialogVisible()),
      selectSelectedProductForEdit: computed(() => selectedProductForEdit()),
      selectSelectedProductIds: computed(() => selectedProductIds()),
      selectedProductsCount: computed(() => selectedProductIds().size),
      getSelectedProductsFromIds: computed(() => {
        const ids = selectedProductIds();
        return products().filter((p) => ids.has(p.id!));
      }),
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
      addProduct: rxMethod<Omit<Product, 'id'>>(
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
      updateProduct: rxMethod<{ id: string; productData: Omit<Product, 'id'> }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ id, productData }) =>
            productService.updateProduct(id, productData).pipe(
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
      deleteProducts: rxMethod<ReadonlySet<string>>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((idsToDelete) => {
            if (idsToDelete.size === 0) {
              patchState(store, { loading: false });
              return of([]);
            }
            const deleteRequests = Array.from(idsToDelete).map((id) =>
              productService.deleteProductById(id).pipe(
                map(() => ({ id, status: 'success' }) as const),
                catchError((err: unknown) => {
                  if (err instanceof HttpErrorResponse && err.status === 404) {
                    console.warn(
                      `[ProductStore] Product ${id} not found during bulk delete (404).`,
                    );
                    return of({ id, status: 'not_found' } as const);
                  } else {
                    console.error(
                      `[ProductStore] Error deleting product ${id}:`,
                      err,
                    );
                    return of({ id, status: 'error', error: err } as const);
                  }
                }),
              ),
            );

            return forkJoin(deleteRequests).pipe(
              tap((results) => {
                const errors404Ids = new Set<string>();
                const otherErrorIds = new Set<string>();
                const successfullyDeletedIds = new Set<string>();

                results.forEach((result) => {
                  switch (result.status) {
                    case 'success':
                      successfullyDeletedIds.add(result.id);
                      break;
                    case 'not_found':
                      errors404Ids.add(result.id);
                      break;
                    case 'error':
                      otherErrorIds.add(result.id);
                      break;
                  }
                });

                if (successfullyDeletedIds.size > 0 || errors404Ids.size > 0) {
                  patchState(store, (state) => ({
                    products: state.products.filter(
                      (p) => !successfullyDeletedIds.has(p.id!),
                    ),
                    selectedProductIds: new Set(
                      Array.from(state.selectedProductIds).filter(
                        (id) =>
                          !successfullyDeletedIds.has(id) &&
                          !errors404Ids.has(id),
                      ),
                    ),
                  }));
                }

                if (successfullyDeletedIds.size > 0) {
                  messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${successfullyDeletedIds.size} Producto(s) Eliminado(s)`,
                  });
                }

                if (otherErrorIds.size > 0) {
                  messageService.add({
                    severity: 'warn',
                    summary: 'Error Parcial',
                    detail: `${otherErrorIds.size} producto(s) no pudieron ser eliminados debido a un error.`,
                  });
                }
              }),
              catchError((err: Error) => {
                console.error(
                  '[ProductStore] Error during bulk delete forkJoin operation:',
                  err,
                );
                patchState(store, {
                  error: 'Error al procesar la eliminación masiva.',
                });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al procesar la eliminación masiva.',
                });
                return of(undefined);
              }),
              finalize(() => {
                patchState(store, { loading: false });
              }),
            );
          }),
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
      setSelectedProducts(selectedProducts: Product[] | null): void {
        const ids = new Set(
          selectedProducts
            ?.map((p) => p.id)
            .filter((id): id is string => !!id) ?? [],
        );
        patchState(store, { selectedProductIds: ids });
      },
      clearSelection(): void {
        patchState(store, { selectedProductIds: new Set<string>() });
      },
    }),
  ),
  withHooks({
    onInit({ loadProducts }) {
      loadProducts();
    },
  }),
);
