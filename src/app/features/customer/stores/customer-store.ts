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
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import { CustomerData, CustomerInfo } from '../models/customer.model';
import { CustomerService } from '../services/customer';

export interface CustomerState {
  loading: boolean;
  error: string | null;
  selectedCustomer: CustomerInfo | null;
  dialogVisible: boolean;
}

export const CustomerStore = signalStore(
  { providedIn: 'root' },
  withEntities<CustomerInfo>(),
  withState<CustomerState>({
    loading: false,
    error: null,
    selectedCustomer: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    customersCount: computed(() => entities().length),
  })),
  withProps(() => ({
    customerService: inject(CustomerService),
    messageService: inject(MessageService),
    translateService: inject(TranslateService),
  })),
  withMethods(({ customerService, messageService, translateService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          customerService.findAll().pipe(
            tapResponse({
              next: (customers: CustomerInfo[]) => {
                patchState(store, setAllEntities(customers));
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

    findById: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((id) =>
          customerService.findById(id).pipe(
            tapResponse({
              next: (customer: CustomerInfo) => {
                patchState(store, { selectedCustomer: customer });
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

    create: rxMethod<CustomerData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((customerData) =>
          customerService.create(customerData).pipe(
            tapResponse({
              next: (createdCustomer: CustomerInfo) => {
                patchState(store, addEntity(createdCustomer));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.customerCreated'),
                  detail: translateService.instant('messages.success.customerCreatedDetail', { name: createdCustomer.fullName }),
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.customerCreateError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    update: rxMethod<{ id: number; customerData: CustomerData }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, customerData }) =>
          customerService.update(id, customerData).pipe(
            tapResponse({
              next: (updatedCustomer: CustomerInfo) => {
                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: updatedCustomer,
                  }),
                );
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.customerUpdated'),
                  detail: translateService.instant('messages.success.customerUpdatedDetail', { name: updatedCustomer.fullName }),
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.customerUpdateError'),
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
          customerService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.customerDeleted'),
                  detail: translateService.instant('messages.success.customerDeletedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.customerDeleteError'),
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
        concatMap((ids) =>
          customerService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.customersDeleted'),
                  detail: translateService.instant('messages.success.customersDeletedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.customersDeleteError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openCustomerDialog: (customer?: CustomerInfo) => {
      patchState(store, {
        selectedCustomer: customer || null,
        dialogVisible: true,
      });
    },

    closeCustomerDialog: () => {
      patchState(store, {
        dialogVisible: false,
        selectedCustomer: null,
      });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
