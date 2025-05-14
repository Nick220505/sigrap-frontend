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
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { pipe, switchMap, tap } from 'rxjs';
import {
  PurchaseOrderInfo,
  PurchaseOrderTrackingEventInfo,
} from '../models/purchase-order.model';
import { PurchaseOrderService } from '../services/purchase-order.service';

export interface OrderTrackingState {
  trackableOrders: PurchaseOrderInfo[];
  selectedOrder: PurchaseOrderInfo | null;
  trackingHistory: PurchaseOrderTrackingEventInfo[];
  isLoadingOrders: boolean;
  isLoadingHistory: boolean;
  error: string | null;
}

const initialOrderTrackingState: OrderTrackingState = {
  trackableOrders: [],
  selectedOrder: null,
  trackingHistory: [],
  isLoadingOrders: false,
  isLoadingHistory: false,
  error: null,
};

export const OrderTrackingStore = signalStore(
  { providedIn: 'root' },
  withState(initialOrderTrackingState),
  withComputed(({ trackableOrders, selectedOrder }) => ({
    ordersCount: computed(() => trackableOrders().length),
    hasSelectedOrder: computed(() => selectedOrder() !== null),
  })),
  withProps(() => ({
    purchaseOrderService: inject(PurchaseOrderService),
    messageService: inject(MessageService),
  })),
  withMethods(({ purchaseOrderService, messageService, ...store }) => ({
    loadTrackableOrders: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoadingOrders: true, error: null })),
        switchMap(() =>
          purchaseOrderService.findAll().pipe(
            tapResponse({
              next: (orders) => {
                const filteredOrders = orders.filter(
                  (order) =>
                    order.status !== 'DELIVERED' &&
                    order.status !== 'CANCELLED',
                );
                patchState(store, { trackableOrders: filteredOrders });
              },
              error: ({ message }: Error) =>
                patchState(store, { error: message }),
              finalize: () => patchState(store, { isLoadingOrders: false }),
            }),
          ),
        ),
      ),
    ),
    selectOrderAndLoadHistory: rxMethod<PurchaseOrderInfo>(
      pipe(
        tap((order) => {
          patchState(store, {
            selectedOrder: order,
            trackingHistory: [],
            isLoadingHistory: true,
            error: null,
          });
        }),
        switchMap((order) =>
          purchaseOrderService.getTrackingHistory(order.id).pipe(
            tapResponse({
              next: (history) => {
                patchState(store, { trackingHistory: history });
              },
              error: ({ message }: Error) => {
                patchState(store, { error: message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar historial de seguimiento.',
                });
              },
              finalize: () => patchState(store, { isLoadingHistory: false }),
            }),
          ),
        ),
      ),
    ),
    clearSelectedOrder: () => {
      patchState(store, {
        selectedOrder: null,
        trackingHistory: [],
        error: null,
      });
    },
  })),
  withHooks({
    onInit(store) {
      store.loadTrackableOrders();
    },
  }),
);
