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
import { ScheduleData, ScheduleInfo } from '../models/schedule.model';
import { ScheduleService } from '../services/schedule';

export interface ScheduleState {
  loading: boolean;
  error: string | null;
  selectedSchedule: ScheduleInfo | null;
  dialogVisible: boolean;
}

export const ScheduleStore = signalStore(
  { providedIn: 'root' },
  withEntities<ScheduleInfo>(),
  withState<ScheduleState>({
    loading: false,
    error: null,
    selectedSchedule: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    schedulesCount: computed(() => entities().length),
    schedulesGroupedByDay: computed(() => {
      const result: Record<string, ScheduleInfo[]> = {};

      entities().forEach((schedule) => {
        const day = schedule.day ?? 'UNDEFINED';
        if (!result[day]) {
          result[day] = [];
        }
        result[day].push(schedule);
      });

      return result;
    }),
  })),
  withProps(() => ({
    scheduleService: inject(ScheduleService),
    messageService: inject(MessageService),
  })),
  withMethods(({ scheduleService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          scheduleService.findAll().pipe(
            tapResponse({
              next: (schedules: ScheduleInfo[]) => {
                patchState(store, setAllEntities(schedules));
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
          scheduleService.findByEmployeeId(employeeId).pipe(
            tapResponse({
              next: (schedules: ScheduleInfo[]) => {
                patchState(store, setAllEntities(schedules));
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
          scheduleService.findById(id).pipe(
            tapResponse({
              next: (schedule) => {
                patchState(store, { selectedSchedule: schedule });
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

    create: rxMethod<ScheduleData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((scheduleData) =>
          scheduleService.create(scheduleData).pipe(
            tapResponse({
              next: (createdSchedule: ScheduleInfo) => {
                patchState(store, addEntity(createdSchedule));
                messageService.add({
                  severity: 'success',
                  summary: 'Schedule created',
                  detail: `The schedule has been created successfully`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error creating schedule',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    update: rxMethod<{ id: number; scheduleData: ScheduleData }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, scheduleData }) =>
          scheduleService.update(id, scheduleData).pipe(
            tapResponse({
              next: (updatedSchedule: ScheduleInfo) => {
                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: updatedSchedule,
                  }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Schedule updated',
                  detail: `The schedule has been updated successfully`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error updating schedule',
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
          scheduleService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Schedule deleted',
                  detail: 'The schedule has been deleted successfully',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error deleting schedule',
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
          scheduleService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Schedules deleted',
                  detail:
                    'The selected schedules have been deleted successfully',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error deleting schedules',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openScheduleDialog: (schedule?: ScheduleInfo) => {
      patchState(store, {
        selectedSchedule: schedule || null,
        dialogVisible: true,
      });
    },

    closeScheduleDialog: () => {
      patchState(store, {
        dialogVisible: false,
        selectedSchedule: null,
      });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
