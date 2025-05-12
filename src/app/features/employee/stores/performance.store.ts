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
import { PerformanceData, PerformanceInfo } from '../models/performance.model';
import { PerformanceService } from '../services/performance.service';

export interface PerformanceState {
  loading: boolean;
  error: string | null;
  selectedPerformance: PerformanceInfo | null;
  dialogVisible: boolean;
}

export const PerformanceStore = signalStore(
  { providedIn: 'root' },
  withEntities<PerformanceInfo>(),
  withState<PerformanceState>({
    loading: false,
    error: null,
    selectedPerformance: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    performancesCount: computed(() => entities().length),
    averagePerformanceScore: computed(() => {
      const performances = entities();
      if (performances.length === 0) return 0;

      const sum = performances.reduce(
        (acc, perf) => acc + (perf.overallScore || 0),
        0,
      );
      return sum / performances.length;
    }),
  })),
  withProps(() => ({
    performanceService: inject(PerformanceService),
    messageService: inject(MessageService),
  })),
  withMethods(({ performanceService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          performanceService.findAll().pipe(
            tapResponse({
              next: (performances: PerformanceInfo[]) => {
                patchState(store, setAllEntities(performances));
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
    findByEmployeeId: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((employeeId) =>
          performanceService.findByEmployeeId(employeeId).pipe(
            tapResponse({
              next: (performances) => {
                patchState(store, setAllEntities(performances));
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
          performanceService.findById(id).pipe(
            tapResponse({
              next: (performance: PerformanceInfo) => {
                patchState(store, { selectedPerformance: performance });
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
    create: rxMethod<PerformanceData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((performanceData) =>
          performanceService.create(performanceData).pipe(
            tapResponse({
              next: (createdPerformance: PerformanceInfo) => {
                patchState(store, addEntity(createdPerformance));
                messageService.add({
                  severity: 'success',
                  summary: 'Evaluación creada',
                  detail: `La evaluación de rendimiento ha sido creada correctamente`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al crear evaluación de rendimiento',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    update: rxMethod<{ id: number; performanceData: PerformanceData }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, performanceData }) =>
          performanceService.update(id, performanceData).pipe(
            tapResponse({
              next: (updatedPerformance: PerformanceInfo) => {
                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: updatedPerformance,
                  }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Evaluación actualizada',
                  detail: `La evaluación de rendimiento ha sido actualizada correctamente`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar evaluación de rendimiento',
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
          performanceService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Evaluación eliminada',
                  detail:
                    'La evaluación de rendimiento ha sido eliminada correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar evaluación de rendimiento',
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
          performanceService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Evaluaciones eliminadas',
                  detail:
                    'Las evaluaciones seleccionadas han sido eliminadas correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar evaluaciones',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    openPerformanceDialog: (performance?: PerformanceInfo) => {
      patchState(store, {
        selectedPerformance: performance || null,
        dialogVisible: true,
      });
    },
    closePerformanceDialog: () => {
      patchState(store, {
        dialogVisible: false,
        selectedPerformance: null,
      });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
