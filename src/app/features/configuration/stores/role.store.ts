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
import { RoleData, RoleInfo } from '../models/role.model';
import { RoleService } from '../services/role.service';

export interface RoleState {
  loading: boolean;
  error: string | null;
  dialogVisible: boolean;
  selectedRole: RoleInfo | null;
}

const initialState: RoleState = {
  loading: false,
  error: null,
  dialogVisible: false,
  selectedRole: null,
};

export const RoleStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<RoleInfo>(),
  withComputed(({ entities }) => ({
    rolesCount: computed(() => entities().length),
  })),
  withProps(() => ({
    roleService: inject(RoleService),
    messageService: inject(MessageService),
  })),
  withMethods(({ roleService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          roleService.findAll().pipe(
            tapResponse({
              next: (roles) => {
                patchState(store, setAllEntities(roles));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar roles',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    create: rxMethod<RoleData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((roleData) =>
          roleService.create(roleData).pipe(
            tapResponse({
              next: (createdRole: RoleInfo) => {
                patchState(store, addEntity(createdRole));
                messageService.add({
                  severity: 'success',
                  summary: 'Rol creado',
                  detail: `El rol ${createdRole.name} ha sido creado correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al crear rol',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    update: rxMethod<{ id: number; roleData: Partial<RoleData> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, roleData }) =>
          roleService.update(id, roleData).pipe(
            tapResponse({
              next: (updatedRole: RoleInfo) => {
                patchState(store, updateEntity({ id, changes: updatedRole }));
                messageService.add({
                  severity: 'success',
                  summary: 'Rol actualizado',
                  detail: `El rol ${updatedRole.name} ha sido actualizado correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar rol',
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
          roleService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Rol eliminado',
                  detail: 'El rol ha sido eliminado correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar rol',
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
          roleService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: 'Roles eliminados',
                  detail:
                    'Los roles seleccionados han sido eliminados correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar roles',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    assignToUser: rxMethod<{ roleId: number; userId: number }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ roleId, userId }) =>
          roleService.assignToUser(roleId, userId).pipe(
            tapResponse({
              next: (updatedRole: RoleInfo) => {
                patchState(
                  store,
                  updateEntity({ id: roleId, changes: updatedRole }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Rol asignado',
                  detail: `El rol ${updatedRole.name} ha sido asignado correctamente`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al asignar rol',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    removeFromUser: rxMethod<{ roleId: number; userId: number }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ roleId, userId }) =>
          roleService.removeFromUser(roleId, userId).pipe(
            tapResponse({
              next: () => {
                messageService.add({
                  severity: 'success',
                  summary: 'Rol removido',
                  detail: 'El rol ha sido removido correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al remover rol',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    openRoleDialog: (role?: RoleInfo) => {
      patchState(store, {
        selectedRole: role || null,
        dialogVisible: true,
      });
    },
    closeRoleDialog: () => {
      patchState(store, {
        selectedRole: null,
        dialogVisible: false,
      });
    },
    clearSelectedRole: () => {
      patchState(store, { selectedRole: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
