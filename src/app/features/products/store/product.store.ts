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
      getActiveProducts: computed(() =>
        products().filter((p) => p.active && !p.deleted),
      ),
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
      confirmationService = inject(ConfirmationService),
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
      update: rxMethod<{ id: number; productData: UpdateProductDto }>(
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
      toggleStatus: rxMethod<number>(
        pipe(
          tap((id) => {
            patchState(store, { loading: true, error: null });
            productService
              .toggleStatus(id)
              .pipe(finalize(() => patchState(store, { loading: false })))
              .subscribe({
                next: (updatedProduct: Product) => {
                  patchState(store, (state) => ({
                    products: state.products.map((p) =>
                      p.id === updatedProduct.id ? updatedProduct : p,
                    ),
                  }));
                  messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: `Producto ${updatedProduct.active ? 'activado' : 'desactivado'}`,
                  });
                },
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cambiar estado del producto',
                  });
                },
              });
          }),
        ),
      ),
      deleteWithConfirmation(product: Product): void {
        confirmationService.confirm({
          message: `¿Está seguro de que desea eliminar el producto "${product.name}"?`,
          header: 'Eliminar producto',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Eliminar',
          rejectLabel: 'Cancelar',
          acceptButtonStyleClass: 'p-button-danger',
          rejectButtonStyleClass: 'p-button-secondary',
          accept: () => this.delete(product.id),
        });
      },
      delete: rxMethod<number>(
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
    onInit({ loadAll }) {
      loadAll();
    },
  }),
);
