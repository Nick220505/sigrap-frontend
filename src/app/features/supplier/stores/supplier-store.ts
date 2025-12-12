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
import { SupplierData, SupplierInfo } from '../models/supplier';
import { SupplierService } from '../services/supplier';

export interface SupplierState {
  loading: boolean;
  error: string | null;
  selectedSupplier: SupplierInfo | null;
  dialogVisible: boolean;
}

export const SupplierStore = signalStore(
  { providedIn: 'root' },
  withEntities<SupplierInfo>(),
  withState<SupplierState>({
    loading: false,
    error: null,
    selectedSupplier: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    suppliersCount: computed(() => entities().length),
  })),
  withProps(() => ({
    supplierService: inject(SupplierService),
    messageService: inject(MessageService),
  })),
  withMethods(({ supplierService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          supplierService.findAll().pipe(
            tapResponse({
              next: (suppliers) => {
                patchState(store, setAllEntities(suppliers));
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
    create: rxMethod<SupplierData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((supplierData) =>
          supplierService.create(supplierData).pipe(
            tapResponse({
              next: (createdSupplier: SupplierInfo) => {
                patchState(store, addEntity(createdSupplier));
                messageService.add({
                  severity: 'success',
                  summary: 'Supplier created',
                  detail: `The supplier ${createdSupplier.name} has been created successfully`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error creating supplier',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    update: rxMethod<{ id: number; supplierData: Partial<SupplierData> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, supplierData }) =>
          supplierService.update(id, supplierData).pipe(
            tapResponse({
              next: (updatedSupplier: SupplierInfo) => {
                patchState(
                  store,
                  updateEntity({ id, changes: updatedSupplier }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Supplier updated',
                  detail: `The supplier ${updatedSupplier.name} has been updated successfully`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error updating supplier',
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
          supplierService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Supplier deleted',
                  detail: 'The supplier has been deleted successfully',
                });
              },
              error: ({ error: { status, message } }: HttpErrorResponse) => {
                patchState(store, { error: message });
                if (
                  status === HttpStatusCode.Conflict &&
                  typeof message === 'string' &&
                  message.includes('violates foreign key constraint')
                ) {
                  const supplier = store.entities().find((s) => s.id === id);
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Cannot delete supplier "${supplier?.name}" because it is being used.`,
                  });
                } else {
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error deleting supplier',
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
          supplierService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Suppliers deleted',
                  detail:
                    'The selected suppliers have been deleted successfully',
                });
              },
              error: ({ error: { status, message } }: HttpErrorResponse) => {
                patchState(store, { error: message });
                if (
                  status === HttpStatusCode.Conflict &&
                  typeof message === 'string' &&
                  message.includes('violates foreign key constraint')
                ) {
                  let supplierId: number | undefined = undefined;
                  const match = /Key \(id\)=\((\d+)\)/.exec(message);
                  if (match) {
                    supplierId = Number(match[1]);
                  }
                  const supplier = supplierId
                    ? store.entities().find((s) => s.id === supplierId)
                    : undefined;
                  let supplierName: string;
                  if (supplier) {
                    supplierName = supplier.name;
                  } else if (supplierId !== undefined) {
                    supplierName = `ID ${supplierId}`;
                  } else {
                    supplierName = 'unknown';
                  }
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Cannot delete supplier "${supplierName}" because it is being used.`,
                  });
                } else {
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error deleting suppliers',
                  });
                }
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openSupplierDialog: (supplier?: SupplierInfo) => {
      patchState(store, {
        selectedSupplier: supplier || null,
        dialogVisible: true,
      });
    },

    closeSupplierDialog: () => {
      patchState(store, {
        dialogVisible: false,
        selectedSupplier: null,
      });
    },

    clearSelectedSupplier: () => {
      patchState(store, { selectedSupplier: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);

