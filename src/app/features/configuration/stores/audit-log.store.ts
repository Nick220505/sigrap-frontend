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
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { map, pipe, switchMap, tap } from 'rxjs';
import { AuditLogInfo } from '../models/audit-log.model';
import { AuditLogService } from '../services/audit-log.service';

export interface AuditLogState {
  loading: boolean;
  error: string | null;
  selectedAuditLog: AuditLogInfo | null;
  dialogVisible: boolean;
}

export const AuditLogStore = signalStore(
  { providedIn: 'root' },
  withEntities<AuditLogInfo>(),
  withState<AuditLogState>({
    loading: false,
    error: null,
    selectedAuditLog: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    auditLogsCount: computed(() => entities().length),
  })),
  withProps(() => ({
    auditLogService: inject(AuditLogService),
    messageService: inject(MessageService),
  })),
  withMethods(({ auditLogService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          auditLogService.findAll().pipe(
            map((auditLogs) => auditLogs || []),
            tapResponse({
              next: (auditLogs) => {
                patchState(store, setAllEntities(auditLogs));
              },
              error: (error: Error) => {
                patchState(store, { error: error.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar registros de auditoría',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    findByUserId: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((userId) =>
          auditLogService.findByUserId(userId).pipe(
            map((auditLogs) => auditLogs || []),
            tapResponse({
              next: (auditLogs) => {
                patchState(store, setAllEntities(auditLogs));
              },
              error: (error: Error) => {
                patchState(store, { error: error.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar registros de auditoría del usuario',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    findByEntityName: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((entityName) =>
          auditLogService.findByEntityName(entityName).pipe(
            map((auditLogs) => auditLogs || []),
            tapResponse({
              next: (auditLogs) => {
                patchState(store, setAllEntities(auditLogs));
              },
              error: (error: Error) => {
                patchState(store, { error: error.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail:
                    'Error al cargar registros de auditoría de la entidad',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    findByAction: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((action) =>
          auditLogService.findByAction(action).pipe(
            map((auditLogs) => auditLogs || []),
            tapResponse({
              next: (auditLogs) => {
                patchState(store, setAllEntities(auditLogs));
              },
              error: (error: Error) => {
                patchState(store, { error: error.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar registros de auditoría por acción',
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
          auditLogService.findByDateRange(startDate, endDate).pipe(
            map((auditLogs) => auditLogs || []),
            tapResponse({
              next: (auditLogs) => {
                patchState(store, setAllEntities(auditLogs));
              },
              error: (error: Error) => {
                patchState(store, { error: error.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail:
                    'Error al cargar registros de auditoría por rango de fechas',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    openAuditLogDialog: (auditLog?: AuditLogInfo) => {
      patchState(store, {
        selectedAuditLog: auditLog || null,
        dialogVisible: true,
      });
    },
    closeAuditLogDialog: () => {
      patchState(store, { dialogVisible: false });
    },
    clearSelectedAuditLog: () => {
      patchState(store, { selectedAuditLog: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
