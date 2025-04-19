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
import { Table } from 'primeng/table';
import { finalize, forkJoin, pipe, tap } from 'rxjs';
import {
  CreateProductDto,
  Product,
  UpdateProductDto,
} from '../models/product.model';
import { ProductService } from '../services/product.service';

export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
  isDialogVisible: boolean;
  selectedProductForEdit: Product | null;
  selectedProductIds: ReadonlySet<string>;
  tableInstance: Table | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  isDialogVisible: false,
  selectedProductForEdit: null,
  selectedProductIds: new Set<string>(),
  tableInstance: null,
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
      tableInstance,
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
      getTableInstance: computed(() => tableInstance()),
    }),
  ),
  withMethods(
    (
      store,
      productService = inject(ProductService),
      messageService = inject(MessageService),
    ) => ({
      loadAll: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, { loading: true, error: null });
            productService
              .getAll()
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: (products) => patchState(store, { products }),
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                },
              });
          }),
        ),
      ),
      create: rxMethod<CreateProductDto>(
        pipe(
          tap((product) => {
            patchState(store, { loading: true, error: null });
            productService
              .create(product)
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: (createdProduct: Product) => {
                  patchState(store, (state) => ({
                    products: [...state.products, createdProduct],
                    isDialogVisible: false,
                    selectedProductForEdit: null,
                  }));
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
              });
          }),
        ),
      ),
      update: rxMethod<{ id: string; productData: UpdateProductDto }>(
        pipe(
          tap(({ id, productData }) => {
            patchState(store, { loading: true, error: null });
            productService
              .update(id, productData)
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: (updatedProduct: Product) => {
                  patchState(store, (state) => ({
                    products: state.products.map((p) =>
                      p.id === updatedProduct.id ? updatedProduct : p,
                    ),
                    isDialogVisible: false,
                    selectedProductForEdit: null,
                  }));
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
              });
          }),
        ),
      ),
      delete: rxMethod<string>(
        pipe(
          tap((id) => {
            patchState(store, { loading: true, error: null });
            productService
              .delete(id)
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: () => {
                  patchState(store, (state) => ({
                    products: state.products.filter((p) => p.id !== id),
                  }));
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
              });
          }),
        ),
      ),
      deleteProducts: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, { loading: true, error: null });
            const idsToDelete = store.selectedProductIds();
            if (idsToDelete.size === 0) {
              patchState(store, { loading: false });
              return;
            }
            const deleteRequests = Array.from(idsToDelete).map((id) =>
              productService.delete(id),
            );

            forkJoin(deleteRequests)
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: () => {
                  patchState(store, (state) => ({
                    products: state.products.filter(
                      (p) => !idsToDelete.has(p.id!),
                    ),
                    selectedProductIds: new Set<string>(),
                  }));
                  messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `${idsToDelete.size} Producto(s) Eliminado(s)`,
                  });
                },
                error: (error) => {
                  const errorMessage =
                    (error as Error)?.message ||
                    'Error desconocido durante la eliminación masiva.';
                  patchState(store, { error: errorMessage });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al procesar la eliminación masiva.',
                  });
                },
              });
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
      setTableInstance(table: Table | null): void {
        patchState(store, { tableInstance: table });
      },
    }),
  ),
  withHooks({
    onInit({ loadAll }) {
      loadAll();
    },
  }),
);
