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
import {
  AttendanceInfo,
  ClockInData,
  ClockOutData,
} from '../models/attendance.model';
import { AttendanceService } from '../services/attendance.service';

export interface AttendanceState {
  loading: boolean;
  error: string | null;
  clockInDialogVisible: boolean;
}

export const AttendanceStore = signalStore(
  { providedIn: 'root' },
  withEntities<AttendanceInfo>(),
  withState<AttendanceState>({
    loading: false,
    error: null,
    clockInDialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    attendancesCount: computed(() => entities().length),
  })),
  withProps(() => ({
    attendanceService: inject(AttendanceService),
    messageService: inject(MessageService),
  })),
  withMethods(({ attendanceService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          attendanceService.findAll().pipe(
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
          attendanceService.findByEmployeeId(employeeId).pipe(
            tapResponse({
              next: (attendances) => {
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
    clockIn: rxMethod<ClockInData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((clockInData) =>
          attendanceService.clockIn(clockInData).pipe(
            tapResponse({
              next: (attendance: AttendanceInfo) => {
                patchState(store, addEntity(attendance));
                messageService.add({
                  severity: 'success',
                  summary: 'Entrada registrada',
                  detail: `La entrada ha sido registrada correctamente`,
                });
                patchState(store, { clockInDialogVisible: false });
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
    clockOut: rxMethod<ClockOutData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((clockOutData) =>
          attendanceService.clockOut(clockOutData).pipe(
            tapResponse({
              next: (attendance: AttendanceInfo) => {
                patchState(
                  store,
                  updateEntity({
                    id: clockOutData.attendanceId,
                    changes: attendance,
                  }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Salida registrada',
                  detail: `La salida ha sido registrada correctamente`,
                });
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
    delete: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          attendanceService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Asistencia eliminada',
                  detail: 'La asistencia ha sido eliminada correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar asistencia',
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
          attendanceService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Asistencias eliminadas',
                  detail:
                    'Las asistencias seleccionadas han sido eliminadas correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar asistencias',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    openClockInDialog: () => {
      patchState(store, { clockInDialogVisible: true });
    },
    closeClockInDialog: () => {
      patchState(store, { clockInDialogVisible: false });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
