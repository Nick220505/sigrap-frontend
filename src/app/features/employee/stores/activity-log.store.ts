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
  setAllEntities,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import {
  ActivityData,
  ActivityInfo,
  ActivityType,
} from '../models/activity.model';
import { ActivityService } from '../services/activity.service';

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
    activityLogsCount: computed(() => entities().length),
    activitiesByDate: computed(() => {
      const result: Record<string, ActivityInfo[]> = {};

      entities().forEach((log) => {
        const date = log.timestamp.split('T')[0];
        if (!result[date]) {
          result[date] = [];
        }
        result[date].push(log);
      });

      return result;
    }),
    activitiesByType: computed(() => {
      const result: Record<string, ActivityInfo[]> = {};

      entities().forEach((log) => {
        const type = log.activityType;
        if (!result[type]) {
          result[type] = [];
        }
        result[type].push(log);
      });

      return result;
    }),
    loginActivities: computed(() =>
      entities().filter((log) => log.activityType === ActivityType.LOGIN),
    ),
    saleActivities: computed(() =>
      entities().filter((log) => log.activityType === ActivityType.SALE),
    ),
  })),
  withProps(() => ({
    activityService: inject(ActivityService),
    messageService: inject(MessageService),
  })),
  withMethods(({ activityService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          activityService.findAll().pipe(
            tapResponse({
              next: (logs: ActivityInfo[]) => {
                patchState(store, setAllEntities(logs));
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
          activityService.findByEmployeeId(employeeId).pipe(
            tapResponse({
              next: (logs: ActivityInfo[]) => {
                patchState(store, setAllEntities(logs));
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
          activityService.create(activityData).pipe(
            tapResponse({
              next: (createdLog: ActivityInfo) => {
                patchState(store, addEntity(createdLog));
                messageService.add({
                  severity: 'success',
                  summary: 'Actividad registrada',
                  detail: `La actividad ha sido registrada correctamente`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al registrar actividad',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openActivityLogDialog: (log?: ActivityInfo) => {
      patchState(store, {
        selectedActivityLog: log || null,
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
