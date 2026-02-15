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
import { TranslateService } from '@ngx-translate/core';
import { concatMap, forkJoin, of, pipe, switchMap, tap } from 'rxjs';
import {
  PurchaseOrderData,
  PurchaseOrderInfo,
} from '../models/purchase-order.model';
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
    translateService: inject(TranslateService),
  })),
  withMethods(({ purchaseOrderService, messageService, translateService, ...store }) => ({
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
                  summary: translateService.instant('messages.success.orderCreated'),
                  detail: translateService.instant('messages.success.orderCreatedDetail', { id: createdOrder.id }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.orderCreateError'),
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
                  summary: translateService.instant('messages.success.orderUpdated'),
                  detail: translateService.instant('messages.success.orderUpdatedDetail', { id: updatedOrder.id }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.orderUpdateError'),
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
                  summary: translateService.instant('messages.success.orderDeleted'),
                  detail: translateService.instant('messages.success.orderDeletedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.orderDeleteError'),
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
                  summary: translateService.instant('messages.success.ordersDeleted'),
                  detail: translateService.instant('messages.success.ordersDeletedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.ordersDeleteError'),
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
                  summary: translateService.instant('messages.success.orderSubmitted'),
                  detail: translateService.instant('messages.success.orderSubmittedDetail', { id: updatedOrder.id }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.orderSubmitError'),
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
                  summary: translateService.instant('messages.success.orderConfirmed'),
                  detail: translateService.instant('messages.success.orderConfirmedDetail', { id: updatedOrder.id }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.orderConfirmError'),
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
                  summary: translateService.instant('messages.success.orderShipped'),
                  detail: translateService.instant('messages.success.orderShippedDetail', { id: updatedOrder.id }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.orderShipError'),
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
                  summary: translateService.instant('messages.success.orderDelivered'),
                  detail: translateService.instant('messages.success.orderDeliveredDetail', { id: updatedOrder.id }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.orderDeliverError'),
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
                  summary: translateService.instant('messages.success.orderCancelled'),
                  detail: translateService.instant('messages.success.orderCancelledDetail', { id: updatedOrder.id }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.orderCancelError'),
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
