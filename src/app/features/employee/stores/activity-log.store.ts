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
import { ActivityData, ActivityInfo } from '../models/activity-log.model';
import { ActivityLogService } from '../services/activity-log.service';

export interface ActivityLogState {
  loading: boolean;
  error: string | null;
  selectedActivityLog: ActivityInfo | null;
  dialogVisible: boolean;
}

export const ActivityLogStore = signalStore(
  { providedIn: 'root' },
  withEntities<ActivityInfo>(),
  withState<ActivityLogState>({
    loading: false,
    error: null,
    selectedActivityLog: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    activitiesCount: computed(() => entities().length),
  })),
  withProps(() => ({
    activityLogService: inject(ActivityLogService),
    messageService: inject(MessageService),
  })),
  withMethods(({ activityLogService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          activityLogService.findAll().pipe(
            tapResponse({
              next: (activities: ActivityInfo[]) => {
                patchState(store, setAllEntities(activities));
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
          activityLogService.findByEmployeeId(employeeId).pipe(
            tapResponse({
              next: (activities) => {
                patchState(store, setAllEntities(activities));
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
          activityLogService.findById(id).pipe(
            tapResponse({
              next: (activity: ActivityInfo) => {
                patchState(store, { selectedActivityLog: activity });
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

    create: rxMethod<ActivityData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((activityData) =>
          activityLogService.create(activityData).pipe(
            tapResponse({
              next: (createdActivity: ActivityInfo) => {
                patchState(store, addEntity(createdActivity));
                messageService.add({
                  severity: 'success',
                  summary: 'Actividad creada',
                  detail: `La actividad ha sido creada correctamente`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al crear actividad',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    update: rxMethod<{ id: number; activityData: ActivityData }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, activityData }) =>
          activityLogService.update(id, activityData).pipe(
            tapResponse({
              next: (updatedActivity: ActivityInfo) => {
                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: updatedActivity,
                  }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Actividad actualizada',
                  detail: `La actividad ha sido actualizada correctamente`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar actividad',
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
          activityLogService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Actividad eliminada',
                  detail: 'La actividad ha sido eliminada correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar actividad',
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
          activityLogService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Actividades eliminadas',
                  detail:
                    'Las actividades seleccionadas han sido eliminadas correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar actividades',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openActivityLogDialog: (activity?: ActivityInfo) => {
      patchState(store, {
        selectedActivityLog: activity || null,
        dialogVisible: true,
      });
    },

    closeActivityLogDialog: () => {
      patchState(store, {
        dialogVisible: false,
        selectedActivityLog: null,
      });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
