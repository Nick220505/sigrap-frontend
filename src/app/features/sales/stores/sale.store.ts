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
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import { SaleData, SaleInfo } from '../models/sale.model';
import { SaleService } from '../services/sale.service';

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
  })),
  withMethods(({ saleService, messageService, ...store }) => ({
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
                  summary: 'Éxito',
                  detail: 'Reporte de ventas diarias generado correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error, exportFilePath: null });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al generar el reporte de ventas diarias',
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
                  summary: 'Error',
                  detail: 'Error al cargar ventas',
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
                patchState(store, addEntity(createdSale));
                messageService.add({
                  severity: 'success',
                  summary: 'Venta registrada',
                  detail: `La venta #${createdSale.id} ha sido registrada correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al registrar venta',
                });
              },
              finalize: () => patchState(store, { loading: false }),
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
                patchState(store, updateEntity({ id, changes: updatedSale }));
                messageService.add({
                  severity: 'success',
                  summary: 'Venta actualizada',
                  detail: `La venta #${updatedSale.id} ha sido actualizada correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar venta',
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
          saleService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Venta eliminada',
                  detail: 'La venta ha sido eliminada correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar venta',
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
                  summary: 'Error',
                  detail: 'Error al cargar ventas del cliente',
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
                  summary: 'Error',
                  detail: 'Error al cargar ventas del empleado',
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
                  summary: 'Error',
                  detail: 'Error al cargar ventas por rango de fechas',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openSaleDialog: (sale?: SaleInfo) => {
      patchState(store, {
        selectedSale: sale || null,
        dialogVisible: true,
      });
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
