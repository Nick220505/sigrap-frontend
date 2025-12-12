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
} from '../models/purchase-order';
import { PurchaseOrderService } from '../services/purchase-order';

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
                  summary: 'Order created',
                  detail: `Order #${createdOrder.id} has been created successfully`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error creating purchase order',
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
                  summary: 'Order updated',
                  detail: `Order #${updatedOrder.id} has been updated successfully`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error updating purchase order',
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
                  summary: 'Order deleted',
                  detail: 'The purchase order has been deleted successfully',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error deleting purchase order',
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

          const deleteRequests = ids.map((id) =>
            purchaseOrderService.delete(id),
          );

          return forkJoin(deleteRequests).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Orders deleted',
                  detail: 'The selected orders have been deleted successfully',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error deleting orders',
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
                  summary: 'Order submitted',
                  detail: `Order #${updatedOrder.id} has been submitted successfully`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error submitting purchase order',
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
                  summary: 'Order confirmed',
                  detail: `Order #${updatedOrder.id} has been confirmed successfully`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error confirming purchase order',
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
                  summary: 'Order shipped',
                  detail: `Order #${updatedOrder.id} has been marked as shipped`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error marking order as shipped',
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
                  summary: 'Order delivered',
                  detail: `Order #${updatedOrder.id} has been marked as delivered`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error marking order as delivered',
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
                  summary: 'Order cancelled',
                  detail: `Order #${updatedOrder.id} has been cancelled successfully`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error cancelling purchase order',
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

