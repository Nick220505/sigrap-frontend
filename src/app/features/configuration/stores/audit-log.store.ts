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
import { switchMap, tap } from 'rxjs';
import { AuditLogInfo } from '../models/audit-log.model';
import { AuditLogService, PageResponse } from '../services/audit-log.service';

export interface AuditLogState {
  loading: boolean;
  error: string | null;
  selectedAuditLog: AuditLogInfo | null;
  dialogVisible: boolean;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
}

export const AuditLogStore = signalStore(
  { providedIn: 'root' },
  withEntities<AuditLogInfo>(),
  withState<AuditLogState>({
    loading: false,
    error: null,
    selectedAuditLog: null,
    dialogVisible: false,
    totalRecords: 0,
    currentPage: 0,
    pageSize: 10,
  }),
  withComputed(({ entities }) => ({
    auditLogsCount: computed(() => entities().length),
  })),
  withProps(() => ({
    auditLogService: inject(AuditLogService),
    messageService: inject(MessageService),
  })),
  withMethods(({ auditLogService, messageService, ...store }) => ({
    findAll: rxMethod<{ page?: number; size?: number }>((params$) =>
      params$.pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ page = 0, size = 10 }) =>
          auditLogService.findAll(page, size).pipe(
            tapResponse({
              next: (response: PageResponse<AuditLogInfo>) => {
                patchState(store, setAllEntities(response.content));
                patchState(store, {
                  totalRecords: response.totalElements,
                  currentPage: response.number,
                  pageSize: response.size,
                });
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
    findByUsername: rxMethod<{
      username: string;
      page?: number;
      size?: number;
    }>((params$) =>
      params$.pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ username, page = 0, size = 10 }) =>
          auditLogService.findByUsername(username, page, size).pipe(
            tapResponse({
              next: (response: PageResponse<AuditLogInfo>) => {
                patchState(store, setAllEntities(response.content));
                patchState(store, {
                  totalRecords: response.totalElements,
                  currentPage: response.number,
                  pageSize: response.size,
                });
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
    findByEntityName: rxMethod<{
      entityName: string;
      page?: number;
      size?: number;
    }>((params$) =>
      params$.pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ entityName, page = 0, size = 10 }) =>
          auditLogService.findByEntityName(entityName, page, size).pipe(
            tapResponse({
              next: (response: PageResponse<AuditLogInfo>) => {
                patchState(store, setAllEntities(response.content));
                patchState(store, {
                  totalRecords: response.totalElements,
                  currentPage: response.number,
                  pageSize: response.size,
                });
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
    findByAction: rxMethod<{ action: string; page?: number; size?: number }>(
      (params$) =>
        params$.pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ action, page = 0, size = 10 }) =>
            auditLogService.findByAction(action, page, size).pipe(
              tapResponse({
                next: (response: PageResponse<AuditLogInfo>) => {
                  patchState(store, setAllEntities(response.content));
                  patchState(store, {
                    totalRecords: response.totalElements,
                    currentPage: response.number,
                    pageSize: response.size,
                  });
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
    findByDateRange: rxMethod<{
      startDate: string;
      endDate: string;
      page?: number;
      size?: number;
    }>((params$) =>
      params$.pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ startDate, endDate, page = 0, size = 10 }) =>
          auditLogService.findByDateRange(startDate, endDate, page, size).pipe(
            tapResponse({
              next: (response: PageResponse<AuditLogInfo>) => {
                patchState(store, setAllEntities(response.content));
                patchState(store, {
                  totalRecords: response.totalElements,
                  currentPage: response.number,
                  pageSize: response.size,
                });
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
    findByEntityId: rxMethod<{
      entityId: string;
      page?: number;
      size?: number;
    }>((params$) =>
      params$.pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ entityId, page = 0, size = 10 }) =>
          auditLogService.findByEntityId(entityId, page, size).pipe(
            tapResponse({
              next: (response: PageResponse<AuditLogInfo>) => {
                patchState(store, setAllEntities(response.content));
                patchState(store, {
                  totalRecords: response.totalElements,
                  currentPage: response.number,
                  pageSize: response.size,
                });
              },
              error: (error: Error) => {
                patchState(store, { error: error.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail:
                    'Error al cargar registros de auditoría por ID de entidad',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    findErrors: rxMethod<{ page?: number; size?: number }>((params$) =>
      params$.pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ page = 0, size = 10 }) =>
          auditLogService.findErrors(page, size).pipe(
            tapResponse({
              next: (response: PageResponse<AuditLogInfo>) => {
                patchState(store, setAllEntities(response.content));
                patchState(store, {
                  totalRecords: response.totalElements,
                  currentPage: response.number,
                  pageSize: response.size,
                });
              },
              error: (error: Error) => {
                patchState(store, { error: error.message });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar registros de auditoría con errores',
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
      findAll({});
    },
  }),
);
