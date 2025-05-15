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
  removeEntities,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { pipe, switchMap, tap } from 'rxjs';
import {
  PaymentData,
  PaymentInfo,
  PaymentStatus,
} from '../models/payment.model';
import { PaymentService } from '../services/payment.service';

export interface PaymentState {
  isLoading: boolean;
  error: HttpErrorResponse | null;
  selectedPaymentId: number | null;
  isDialogVisible: boolean;
  viewOnly: boolean;
}

const initialPaymentState: PaymentState = {
  isLoading: false,
  error: null,
  selectedPaymentId: null,
  isDialogVisible: false,
  viewOnly: false,
};

export const PaymentStore = signalStore(
  { providedIn: 'root' },
  withEntities<PaymentInfo>(),
  withState(initialPaymentState),
  withComputed(({ entities, isLoading }) => ({
    paymentsCount: computed(() => entities().length),
    isLoadingOrRefreshing: computed(
      () => isLoading() && entities().length === 0,
    ),
    pendingPaymentsAmount: computed(() =>
      entities()
        .filter(
          (p: PaymentInfo) =>
            p.status === PaymentStatus.PENDING ||
            p.status === PaymentStatus.OVERDUE,
        )
        .reduce((sum: number, p: PaymentInfo) => sum + p.amount, 0),
    ),
    completedPaymentsLast30DaysAmount: computed(() => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return entities()
        .filter(
          (p: PaymentInfo) =>
            p.status === PaymentStatus.COMPLETED &&
            p.paymentDate &&
            new Date(p.paymentDate) >= thirtyDaysAgo,
        )
        .reduce((sum: number, p: PaymentInfo) => sum + p.amount, 0);
    }),
    overdueInvoicesCount: computed(
      () =>
        entities().filter(
          (p: PaymentInfo) => p.status === PaymentStatus.OVERDUE,
        ).length,
    ),
    overdueInvoicesAmount: computed(() =>
      entities()
        .filter((p: PaymentInfo) => p.status === PaymentStatus.OVERDUE)
        .reduce((sum: number, p: PaymentInfo) => sum + p.amount, 0),
    ),
    upcomingPaymentsNext7DaysCount: computed(() => {
      const today = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(today.getDate() + 7);
      return entities().filter(
        (p: PaymentInfo) =>
          p.dueDate &&
          (p.status === PaymentStatus.PENDING ||
            p.status === PaymentStatus.OVERDUE) &&
          new Date(p.dueDate) >= today &&
          new Date(p.dueDate) <= sevenDaysLater,
      ).length;
    }),
  })),
  withMethods(
    (
      store,
      paymentService = inject(PaymentService),
      messageService = inject(MessageService),
    ) => ({
      loadPayments: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            paymentService.findAll().pipe(
              tapResponse({
                next: (payments) => patchState(store, setAllEntities(payments)),
                error: (error: HttpErrorResponse) =>
                  patchState(store, { error }),
                finalize: () => patchState(store, { isLoading: false }),
              }),
            ),
          ),
        ),
      ),
      createPayment: rxMethod<PaymentData>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((paymentData) =>
            paymentService.create(paymentData).pipe(
              tapResponse({
                next: (createdPayment) => {
                  patchState(store, addEntity(createdPayment));
                },
                error: (error: HttpErrorResponse) =>
                  patchState(store, { error }),
                finalize: () => patchState(store, { isLoading: false }),
              }),
            ),
          ),
        ),
      ),
      updatePayment: rxMethod<{ id: number; paymentData: PaymentData }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ id, paymentData }) =>
            paymentService.update(id, paymentData).pipe(
              tapResponse({
                next: (updatedPayment) => {
                  patchState(
                    store,
                    updateEntity({
                      id: updatedPayment.id,
                      changes: updatedPayment,
                    }),
                  );
                },
                error: (error: HttpErrorResponse) =>
                  patchState(store, { error }),
                finalize: () => patchState(store, { isLoading: false }),
              }),
            ),
          ),
        ),
      ),
      deletePayment: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            paymentService.delete(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, removeEntity(id));
                  messageService.add({
                    severity: 'success',
                    summary: 'Pago Eliminado',
                    detail: 'El pago ha sido eliminado.',
                  });
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error al Eliminar',
                    detail: error.message || 'No se pudo eliminar el pago.',
                  });
                },
                finalize: () => patchState(store, { isLoading: false }),
              }),
            ),
          ),
        ),
      ),
      deleteManyPayments: rxMethod<number[]>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((ids) =>
            paymentService.deleteAllById(ids).pipe(
              tapResponse({
                next: () => {
                  patchState(store, removeEntities(ids));
                  messageService.add({
                    severity: 'success',
                    summary: 'Pagos Eliminados',
                    detail: 'Los pagos seleccionados han sido eliminados.',
                  });
                },
                error: (error: HttpErrorResponse) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error al Eliminar',
                    detail:
                      error.message || 'No se pudieron eliminar los pagos.',
                  });
                },
                finalize: () => patchState(store, { isLoading: false }),
              }),
            ),
          ),
        ),
      ),
      markAsCompleted: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((id) =>
            paymentService.markAsCompleted(id).pipe(
              tapResponse({
                next: (updatedPayment) => {
                  patchState(
                    store,
                    updateEntity({
                      id: updatedPayment.id,
                      changes: updatedPayment,
                    }),
                  );
                },
                error: (error: HttpErrorResponse) =>
                  patchState(store, { error }),
                finalize: () => patchState(store, { isLoading: false }),
              }),
            ),
          ),
        ),
      ),
      openPaymentDialog(payment?: PaymentInfo, viewMode = false): void {
        patchState(store, {
          isDialogVisible: true,
          selectedPaymentId: payment ? payment.id : null,
          viewOnly: viewMode,
        });
      },
      closePaymentDialog(): void {
        patchState(store, {
          isDialogVisible: false,
          selectedPaymentId: null,
          viewOnly: false,
        });
      },
      setSelectedPaymentId(id: number | null): void {
        patchState(store, { selectedPaymentId: id });
      },
    }),
  ),
  withHooks({
    onInit({ loadPayments }) {
      loadPayments();
    },
  }),
);
