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
import { concatMap, forkJoin, of, pipe, switchMap, tap } from 'rxjs';
import {
  PurchaseOrderData,
  PurchaseOrderInfo,
} from '../models/purchase-order.model';
import { PurchaseOrderService } from '../services/purchase-order.service';

export interface PurchaseOrderState {
  loading: boolean;
  error: string | null;
  selectedOrder: PurchaseOrderInfo | null;
  dialogVisible: boolean;
  viewOnly: boolean;
}

export const initialPurchaseOrderState: PurchaseOrderState = {
  loading: false,
  error: null,
  selectedOrder: null,
  dialogVisible: false,
  viewOnly: false,
};

export const PurchaseOrderStore = signalStore(
  { providedIn: 'root' },
  withEntities<PurchaseOrderInfo>(),
  withState(initialPurchaseOrderState),
  withComputed(({ entities }) => ({
    ordersCount: computed(() => entities().length),
  })),
  withProps(() => ({
    purchaseOrderService: inject(PurchaseOrderService),
    messageService: inject(MessageService),
  })),
  withMethods(({ purchaseOrderService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          purchaseOrderService.findAll().pipe(
            tapResponse({
              next: (orders) => {
                patchState(store, setAllEntities(orders));
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

    findBySupplierId: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((supplierId) =>
          purchaseOrderService.findBySupplierId(supplierId).pipe(
            tapResponse({
              next: (orders) => {
                patchState(store, setAllEntities(orders));
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

    findByStatus: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((status) =>
          purchaseOrderService.findByStatus(status).pipe(
            tapResponse({
              next: (orders) => {
                patchState(store, setAllEntities(orders));
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

    create: rxMethod<PurchaseOrderData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((orderData) =>
          purchaseOrderService.create(orderData).pipe(
            tapResponse({
              next: (createdOrder: PurchaseOrderInfo) => {
                patchState(store, addEntity(createdOrder));
                messageService.add({
                  severity: 'success',
                  summary: 'Orden creada',
                  detail: `La orden ${createdOrder.orderNumber} ha sido creada correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al crear orden de compra',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    update: rxMethod<{ id: number; orderData: Partial<PurchaseOrderData> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, orderData }) =>
          purchaseOrderService.update(id, orderData as PurchaseOrderData).pipe(
            tapResponse({
              next: (updatedOrder: PurchaseOrderInfo) => {
                patchState(store, updateEntity({ id, changes: updatedOrder }));
                messageService.add({
                  severity: 'success',
                  summary: 'Orden actualizada',
                  detail: `La orden ${updatedOrder.orderNumber} ha sido actualizada correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar orden de compra',
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
          purchaseOrderService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Orden eliminada',
                  detail: 'La orden de compra ha sido eliminada correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar orden de compra',
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
        concatMap((ids) => {
          if (ids.length === 0) {
            return of(null);
          }

          // Create an array of delete requests
          const deleteRequests = ids.map((id) =>
            purchaseOrderService.delete(id),
          );

          // Execute all delete requests and combine the results
          return forkJoin(deleteRequests).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Órdenes eliminadas',
                  detail:
                    'Las órdenes seleccionadas han sido eliminadas correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar órdenes',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          );
        }),
      ),
    ),

    submitOrder: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          purchaseOrderService.submitOrder(id).pipe(
            tapResponse({
              next: (updatedOrder: PurchaseOrderInfo) => {
                patchState(store, updateEntity({ id, changes: updatedOrder }));
                messageService.add({
                  severity: 'success',
                  summary: 'Orden enviada',
                  detail: `La orden ${updatedOrder.orderNumber} ha sido enviada correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al enviar orden de compra',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    confirmOrder: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          purchaseOrderService.confirmOrder(id).pipe(
            tapResponse({
              next: (updatedOrder: PurchaseOrderInfo) => {
                patchState(store, updateEntity({ id, changes: updatedOrder }));
                messageService.add({
                  severity: 'success',
                  summary: 'Orden confirmada',
                  detail: `La orden ${updatedOrder.orderNumber} ha sido confirmada correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al confirmar orden de compra',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    markAsShipped: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          purchaseOrderService.markAsShipped(id).pipe(
            tapResponse({
              next: (updatedOrder: PurchaseOrderInfo) => {
                patchState(store, updateEntity({ id, changes: updatedOrder }));
                messageService.add({
                  severity: 'success',
                  summary: 'Orden enviada',
                  detail: `La orden ${updatedOrder.orderNumber} ha sido marcada como enviada`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al marcar orden como enviada',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    markAsDelivered: rxMethod<{ id: number; actualDeliveryDate: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, actualDeliveryDate }) =>
          purchaseOrderService.markAsDelivered(id, actualDeliveryDate).pipe(
            tapResponse({
              next: (updatedOrder: PurchaseOrderInfo) => {
                patchState(store, updateEntity({ id, changes: updatedOrder }));
                messageService.add({
                  severity: 'success',
                  summary: 'Orden entregada',
                  detail: `La orden ${updatedOrder.orderNumber} ha sido marcada como entregada`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al marcar orden como entregada',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    cancelOrder: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          purchaseOrderService.cancelOrder(id).pipe(
            tapResponse({
              next: (updatedOrder: PurchaseOrderInfo) => {
                patchState(store, updateEntity({ id, changes: updatedOrder }));
                messageService.add({
                  severity: 'success',
                  summary: 'Orden cancelada',
                  detail: `La orden ${updatedOrder.orderNumber} ha sido cancelada correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cancelar orden de compra',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openOrderDialog: (order?: PurchaseOrderInfo, viewMode = false): void => {
      patchState(store, {
        selectedOrder: order ?? null,
        dialogVisible: true,
        viewOnly: viewMode,
      });
    },

    closeOrderDialog: (): void => {
      patchState(store, {
        selectedOrder: null,
        dialogVisible: false,
        viewOnly: false,
      });
    },

    clearSelectedOrder: () => {
      patchState(store, { selectedOrder: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
