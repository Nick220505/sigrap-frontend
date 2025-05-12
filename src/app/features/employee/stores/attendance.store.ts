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
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import {
  AttendanceData,
  AttendanceInfo,
  AttendanceStatus,
} from '../models/attendance.model';
import { ActivityService } from '../services/activity.service';

export interface AttendanceState {
  loading: boolean;
  error: string | null;
  selectedAttendance: AttendanceInfo | null;
  dialogVisible: boolean;
}

export const AttendanceStore = signalStore(
  { providedIn: 'root' },
  withEntities<AttendanceInfo>(),
  withState<AttendanceState>({
    loading: false,
    error: null,
    selectedAttendance: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    attendancesCount: computed(() => entities().length),
    attendancesByDate: computed(() => {
      const result: Record<string, AttendanceInfo[]> = {};

      entities().forEach((attendance) => {
        const date = attendance.clockInTime.split('T')[0];
        if (!result[date]) {
          result[date] = [];
        }
        result[date].push(attendance);
      });

      return result;
    }),
    lateAttendances: computed(() =>
      entities().filter(
        (attendance) => attendance.status === AttendanceStatus.LATE,
      ),
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
          activityService.findAllAttendance().pipe(
            tapResponse({
              next: (attendances: AttendanceInfo[]) => {
                patchState(store, setAllEntities(attendances));
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
          activityService.findAttendanceByEmployeeId(employeeId).pipe(
            tapResponse({
              next: (attendances: AttendanceInfo[]) => {
                patchState(store, setAllEntities(attendances));
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
          activityService.findAttendanceById(id).pipe(
            tapResponse({
              next: (attendance: AttendanceInfo) => {
                patchState(store, { selectedAttendance: attendance });
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

    clockIn: rxMethod<AttendanceData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((attendanceData) =>
          activityService.clockIn(attendanceData).pipe(
            tapResponse({
              next: (createdAttendance: AttendanceInfo) => {
                patchState(store, addEntity(createdAttendance));
                messageService.add({
                  severity: 'success',
                  summary: 'Entrada registrada',
                  detail: `La entrada ha sido registrada correctamente`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al registrar entrada',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    clockOut: rxMethod<{ id: number; attendanceData: AttendanceData }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, attendanceData }) =>
          activityService.clockOut(id, attendanceData).pipe(
            tapResponse({
              next: (updatedAttendance: AttendanceInfo) => {
                patchState(
                  store,
                  updateEntity({
                    id,
                    changes: updatedAttendance,
                  }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Salida registrada',
                  detail: `La salida ha sido registrada correctamente`,
                });
                patchState(store, { dialogVisible: false });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al registrar salida',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),

    openAttendanceDialog: (attendance?: AttendanceInfo) => {
      patchState(store, {
        selectedAttendance: attendance || null,
        dialogVisible: true,
      });
    },

    closeAttendanceDialog: () => {
      patchState(store, {
        dialogVisible: false,
        selectedAttendance: null,
      });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
