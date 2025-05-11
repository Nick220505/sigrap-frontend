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
import { PermissionData, PermissionInfo } from '../models/permission.model';
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
    create: rxMethod<PermissionData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((permissionData) =>
          permissionService.create(permissionData).pipe(
            tapResponse({
              next: (createdPermission: PermissionInfo) => {
                patchState(store, addEntity(createdPermission));
                messageService.add({
                  severity: 'success',
                  summary: 'Permiso creado',
                  detail: `El permiso ${createdPermission.name} ha sido creado correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al crear permiso',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    update: rxMethod<{ id: number; permissionData: Partial<PermissionData> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, permissionData }) =>
          permissionService.update(id, permissionData).pipe(
            tapResponse({
              next: (updatedPermission: PermissionInfo) => {
                patchState(
                  store,
                  updateEntity({ id, changes: updatedPermission }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Permiso actualizado',
                  detail: `El permiso ${updatedPermission.name} ha sido actualizado correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar permiso',
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
          permissionService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Permiso eliminado',
                  detail: 'El permiso ha sido eliminado correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar permiso',
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
          permissionService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Permisos eliminados',
                  detail:
                    'Los permisos seleccionados han sido eliminados correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar permisos',
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
