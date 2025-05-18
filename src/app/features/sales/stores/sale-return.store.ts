import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
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
import { pipe, switchMap, tap } from 'rxjs';
import { SaleReturnData, SaleReturnInfo } from '../models/sale-return.model';
import { SaleReturnService } from '../services/sale-return.service';

export interface SaleReturnState {
  loading: boolean;
  error: string | null;
  selectedSaleReturnId: number | null;
  dialogVisible: boolean;
}

const initialState: SaleReturnState = {
  loading: false,
  error: null,
  selectedSaleReturnId: null,
  dialogVisible: false,
};

export const SaleReturnStore = signalStore(
  { providedIn: 'root' },
  withEntities<SaleReturnInfo>(),
  withState(initialState),
  withComputed(({ entities, selectedSaleReturnId }) => ({
    saleReturnsCount: computed(() => entities().length),
    selectedSaleReturn: computed(() => {
      const id = selectedSaleReturnId();
      return id ? entities().find((sr) => sr.id === id) : null;
    }),
  })),
  withMethods(
    (
      store,
      saleReturnService = inject(SaleReturnService),
      messageService = inject(MessageService),
    ) => ({
      loadAll: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            saleReturnService.findAll().pipe(
              tapResponse({
                next: (saleReturns) =>
                  patchState(store, setAllEntities(saleReturns)),
                error: (error: HttpErrorResponse) => {
                  const errorMsg =
                    error.error?.message || 'Error al cargar devoluciones.';
                  patchState(store, { error: errorMsg });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMsg,
                  });
                },
                finalize: () => patchState(store, { loading: false }),
              }),
            ),
          ),
        ),
      ),
      create: rxMethod<SaleReturnData>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((saleReturnData) =>
            saleReturnService.create(saleReturnData).pipe(
              tapResponse({
                next: (newSaleReturn) => {
                  patchState(store, addEntity(newSaleReturn), {
                    dialogVisible: false,
                  });
                  messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Devolución creada correctamente.',
                  });
                },
                error: (error: HttpErrorResponse) => {
                  const errorMsg =
                    error.error?.message || 'Error al crear la devolución.';
                  patchState(store, { error: errorMsg });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMsg,
                  });
                },
                finalize: () => patchState(store, { loading: false }),
              }),
            ),
          ),
        ),
      ),
      update: rxMethod<{ id: number; data: Partial<SaleReturnData> }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ id, data }) =>
            saleReturnService.update(id, data).pipe(
              tapResponse({
                next: (updatedSaleReturn) => {
                  patchState(
                    store,
                    updateEntity({
                      id: updatedSaleReturn.id,
                      changes: updatedSaleReturn,
                    }),
                    { dialogVisible: false },
                  );
                  messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Devolución actualizada correctamente.',
                  });
                },
                error: (error: HttpErrorResponse) => {
                  const errorMsg =
                    error.error?.message ||
                    'Error al actualizar la devolución.';
                  patchState(store, { error: errorMsg });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMsg,
                  });
                },
                finalize: () => patchState(store, { loading: false }),
              }),
            ),
          ),
        ),
      ),
      deleteById: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((id) =>
            saleReturnService.delete(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, removeEntity(id), {
                    selectedSaleReturnId: null,
                  });
                  messageService.add({
                    severity: 'success',
                    summary: 'Éxito',
                    detail: 'Devolución eliminada correctamente.',
                  });
                },
                error: (error: HttpErrorResponse) => {
                  const errorMsg =
                    error.error?.message || 'Error al eliminar la devolución.';
                  patchState(store, { error: errorMsg });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMsg,
                  });
                },
                finalize: () => patchState(store, { loading: false }),
              }),
            ),
          ),
        ),
      ),
      openReturnDialog(saleReturn?: SaleReturnInfo) {
        patchState(store, {
          dialogVisible: true,
          selectedSaleReturnId: saleReturn ? saleReturn.id : null,
        });
      },
      closeReturnDialog() {
        patchState(store, { dialogVisible: false, selectedSaleReturnId: null });
      },
      selectSaleReturn(saleReturn: SaleReturnInfo | null) {
        patchState(store, {
          selectedSaleReturnId: saleReturn ? saleReturn.id : null,
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
