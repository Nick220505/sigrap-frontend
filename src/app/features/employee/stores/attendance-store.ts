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
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import {
  AttendanceInfo,
  ClockInData,
  ClockOutData,
} from '../models/attendance.model';
import { AttendanceService } from '../services/attendance';

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
    translateService: inject(TranslateService),
  })),
  withMethods(({ attendanceService, messageService, translateService, ...store }) => ({
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
                  summary: translateService.instant('messages.success.clockInRecorded'),
                  detail: translateService.instant('messages.success.clockInRecordedDetail'),
                });
                patchState(store, { clockInDialogVisible: false });
              },
              error: ({ error, message }: HttpErrorResponse) => {
                patchState(store, {
                  error: message ?? 'Unknown error',
                });

                if (
                  error?.message?.includes(
                    'User already has an attendance record for today',
                  )
                ) {
                  messageService.add({
                    severity: 'warn',
                    summary: translateService.instant('messages.errors.duplicateRecord'),
                    detail: translateService.instant('messages.errors.duplicateRecordDetail'),
                  });
                } else {
                  messageService.add({
                    severity: 'error',
                    summary: translateService.instant('messages.errors.error'),
                    detail: translateService.instant('messages.errors.clockInRecordError'),
                  });
                }
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
                  summary: translateService.instant('messages.success.clockOutRecorded'),
                  detail: translateService.instant('messages.success.clockOutRecordedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.clockOutRecordError'),
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
