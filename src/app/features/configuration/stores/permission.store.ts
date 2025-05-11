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
import { pipe, switchMap, tap } from 'rxjs';
import { PermissionInfo } from '../models/permission.model';
import { PermissionService } from '../services/permission.service';

export interface PermissionState {
  loading: boolean;
  error: string | null;
  selectedPermission: PermissionInfo | null;
  dialogVisible: boolean;
}

export const PermissionStore = signalStore(
  { providedIn: 'root' },
  withEntities<PermissionInfo>(),
  withState<PermissionState>({
    loading: false,
    error: null,
    selectedPermission: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    permissionsCount: computed(() => entities().length),
  })),
  withProps(() => ({
    permissionService: inject(PermissionService),
    messageService: inject(MessageService),
  })),
  withMethods(({ permissionService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          permissionService.findAll().pipe(
            tapResponse({
              next: (permissions) => {
                patchState(store, setAllEntities(permissions));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar permisos',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    findByResource: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap((resource) =>
          permissionService.findByResource(resource).pipe(
            tapResponse({
              next: (permissions) => {
                patchState(store, setAllEntities(permissions));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar permisos del recurso',
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
          permissionService.findByAction(action).pipe(
            tapResponse({
              next: (permissions) => {
                patchState(store, setAllEntities(permissions));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar permisos por acción',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    openPermissionDialog: (permission?: PermissionInfo) => {
      patchState(store, {
        selectedPermission: permission || null,
        dialogVisible: true,
      });
    },
    closePermissionDialog: () => {
      patchState(store, { dialogVisible: false });
    },
    clearSelectedPermission: () => {
      patchState(store, { selectedPermission: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
