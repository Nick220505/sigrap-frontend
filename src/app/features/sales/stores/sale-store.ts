import { HttpErrorResponse } from '@angular/common/http';
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
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import { ProductStore } from '@features/inventory/stores/product-store';
import { SaleData, SaleInfo } from '../models/sale.model';
import { SaleService } from '../services/sale';

export interface SaleState {
  loading: boolean;
  error: string | null;
  selectedSale: SaleInfo | null;
  dialogVisible: boolean;
  exportFilePath: string | null;
}

export const SaleStore = signalStore(
  { providedIn: 'root' },
  withEntities<SaleInfo>(),
  withState<SaleState>({
    loading: false,
    error: null,
    selectedSale: null,
    dialogVisible: false,
    exportFilePath: null,
  }),
  withComputed(({ entities }) => ({
    salesCount: computed(() => entities().length),
  })),
  withProps(() => ({
    saleService: inject(SaleService),
    messageService: inject(MessageService),
    translateService: inject(TranslateService),
    productStore: inject(ProductStore),
  })),
  withMethods(({ saleService, messageService, translateService, productStore, ...store }) => ({
    generateDailySalesReport: rxMethod<{ date?: Date; exportPath: string }>(
      pipe(
        tap(() =>
          patchState(store, {
            loading: true,
            error: null,
            exportFilePath: null,
          }),
        ),
        concatMap(({ date, exportPath }) =>
          saleService.generateDailySalesReport(date, exportPath).pipe(
            tapResponse({
              next: (filePath: string) => {
                patchState(store, { exportFilePath: filePath });
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.reportGenerated'),
                  detail: translateService.instant('messages.success.reportGeneratedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error, exportFilePath: null });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.reportGenerateError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          saleService.findAll().pipe(
            tapResponse({
              next: (sales) => {
                patchState(store, setAllEntities(sales));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.salesLoadError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    create: rxMethod<SaleData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((saleData) =>
          saleService.create(saleData).pipe(
            tapResponse({
              next: (createdSale: SaleInfo) => {
                patchState(store, addEntity(createdSale), {
                  dialogVisible: false,
                });

                saleService.findById(createdSale.id).subscribe({
                  next: (fullSale) => {
                    patchState(
                      store,
                      updateEntity({ id: fullSale.id, changes: fullSale }),
                    );
                  },
                });

                productStore.findAll();

                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.saleRegistered'),
                  detail: translateService.instant('messages.success.saleRegisteredDetail', { id: createdSale.id }),
                });
              },
              error: (error: HttpErrorResponse) => {
                let errorMessage = '';
                let productName = '';

                // Extract product name from error message
                const stockMatch = error.error?.message?.match(/Insufficient stock for product: (.*)/) ||
                                   error.message?.match(/Insufficient stock for product: (.*)/);
                
                if (stockMatch) {
                  productName = stockMatch[1];
                  errorMessage = translateService.instant('messages.errors.insufficientStock', { product: productName });
                } else {
                  errorMessage = translateService.instant('messages.errors.saleRegisterError');
                }

                patchState(store, {
                  error: errorMessage,
                  loading: false,
                });

                if (
                  (error.error &&
                    typeof error.error === 'string' &&
                    error.error.includes('stock')) ||
                  error.message?.includes('stock') ||
                  error.error?.message?.includes('stock')
                ) {
                  messageService.add({
                    severity: 'error',
                    summary: translateService.instant('messages.errors.inventoryError'),
                    detail: errorMessage,
                  });
                } else {
                  messageService.add({
                    severity: 'error',
                    summary: translateService.instant('messages.errors.error'),
                    detail: errorMessage,
                  });
                }
              },
              finalize: () => {
                if (!store.error()) {
                  patchState(store, { loading: false });
                }
              },
            }),
          ),
        ),
      ),
    ),

    update: rxMethod<{ id: number; saleData: Partial<SaleData> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, saleData }) =>
          saleService.update(id, saleData).pipe(
            tapResponse({
              next: (updatedSale: SaleInfo) => {
                patchState(store, updateEntity({ id, changes: updatedSale }), {
                  dialogVisible: false,
                });

                saleService.findById(id).subscribe({
                  next: (fullSale) => {
                    patchState(
                      store,
                      updateEntity({ id: fullSale.id, changes: fullSale }),
                    );
                  },
                });

                productStore.findAll();

                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.saleUpdated'),
                  detail: translateService.instant('messages.success.saleUpdatedDetail', { id: updatedSale.id }),
                });
              },
              error: (error: HttpErrorResponse) => {
                let errorMessage = '';
                let productName = '';

                // Extract product name from error message
                const stockMatch = error.error?.message?.match(/Insufficient stock for product: (.*)/) ||
                                   error.message?.match(/Insufficient stock for product: (.*)/);
                
                if (stockMatch) {
                  productName = stockMatch[1];
                  errorMessage = translateService.instant('messages.errors.insufficientStock', { product: productName });
                } else {
                  errorMessage = translateService.instant('messages.errors.saleUpdateError');
                }

                patchState(store, {
                  error: errorMessage,
                  loading: false,
                });

                if (
                  (error.error &&
                    typeof error.error === 'string' &&
                    error.error.includes('stock')) ||
                  error.message?.includes('stock') ||
                  error.error?.message?.includes('stock')
                ) {
                  messageService.add({
                    severity: 'error',
                    summary: translateService.instant('messages.errors.inventoryError'),
                    detail: errorMessage,
                  });
                } else {
                  messageService.add({
                    severity: 'error',
                    summary: translateService.instant('messages.errors.error'),
                    detail: errorMessage,
                  });
                }
              },
              finalize: () => {
                if (!store.error()) {
                  patchState(store, { loading: false });
                }
              },
            }),
          ),
        ),
      ),
    ),

    delete: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          saleService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.saleDeleted'),
                  detail: translateService.instant('messages.success.saleDeletedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.saleDeleteError'),
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
          saleService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.salesDeleted'),
                  detail: translateService.instant('messages.success.salesDeletedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.salesDeleteError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    findByCustomerId: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((customerId) =>
          saleService.findByCustomerId(customerId).pipe(
            tapResponse({
              next: (sales) => {
                patchState(store, setAllEntities(sales));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.customerSalesLoadError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    findByEmployeeId: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((employeeId) =>
          saleService.findByEmployeeId(employeeId).pipe(
            tapResponse({
              next: (sales) => {
                patchState(store, setAllEntities(sales));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.employeeSalesLoadError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    findByDateRange: rxMethod<{ startDate: string; endDate: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ startDate, endDate }) =>
          saleService.findByDateRange(startDate, endDate).pipe(
            tapResponse({
              next: (sales) => {
                patchState(store, setAllEntities(sales));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.salesDateRangeLoadError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openSaleDialog: (sale?: SaleInfo) => {
      if (sale) {
        patchState(store, { loading: true });
        saleService.findById(sale.id).subscribe({
          next: (freshSale) => {
            patchState(store, {
              selectedSale: freshSale,
              dialogVisible: true,
              loading: false,
            });
          },
          error: () => {
            patchState(store, {
              selectedSale: sale,
              dialogVisible: true,
              loading: false,
            });
          },
        });
      } else {
        patchState(store, {
          selectedSale: null,
          dialogVisible: true,
        });
      }
    },

    closeSaleDialog: () => {
      patchState(store, { dialogVisible: false });
    },

    clearSelectedSale: () => {
      patchState(store, { selectedSale: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
