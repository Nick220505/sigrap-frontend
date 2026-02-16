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
import { TranslateService } from '@ngx-translate/core';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import { UserData, UserInfo } from '../models/user.model';
import { UserService } from '../services/user';

export interface UserState {
  loading: boolean;
  error: string | null;
  selectedUser: UserInfo | null;
  dialogVisible: boolean;
}

export const UserStore = signalStore(
  { providedIn: 'root' },
  withEntities<UserInfo>(),
  withState<UserState>({
    loading: false,
    error: null,
    selectedUser: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    usersCount: computed(() => entities().length),
  })),
  withProps(() => ({
    userService: inject(UserService),
    messageService: inject(MessageService),
    translateService: inject(TranslateService),
  })),
  withMethods(({ userService, messageService, translateService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          userService.findAll().pipe(
            tapResponse({
              next: (users) => {
                patchState(store, setAllEntities(users));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.userLoadError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    create: rxMethod<UserData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((userData) =>
          userService.create(userData).pipe(
            tapResponse({
              next: (createdUser: UserInfo) => {
                patchState(store, addEntity(createdUser));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.userCreated'),
                  detail: translateService.instant('messages.success.userCreatedDetail', { name: createdUser.name }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.userCreateError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    update: rxMethod<{ id: number; userData: Partial<UserData> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, userData }) =>
          userService.update(id, userData).pipe(
            tapResponse({
              next: (updatedUser: UserInfo) => {
                patchState(store, updateEntity({ id, changes: updatedUser }));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.userUpdated'),
                  detail: translateService.instant('messages.success.userUpdatedDetail', { name: updatedUser.name }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.userUpdateError'),
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
          userService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.userDeleted'),
                  detail: translateService.instant('messages.success.userDeletedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.userDeleteError'),
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
          userService.deleteAllById(ids).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntities(ids));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.usersDeleted'),
                  detail: translateService.instant('messages.success.usersDeletedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.usersDeleteError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    updateProfile: rxMethod<{ id: number; userData: Partial<UserData> }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, userData }) =>
          userService.updateProfile(id, userData).pipe(
            tapResponse({
              next: (updatedUser: UserInfo) => {
                patchState(store, updateEntity({ id, changes: updatedUser }));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.profileUpdated'),
                  detail: translateService.instant('messages.success.profileUpdatedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.profileUpdateError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    changePassword: rxMethod<{
      id: number;
      currentPassword: string;
      newPassword: string;
    }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, currentPassword, newPassword }) =>
          userService.changePassword(id, currentPassword, newPassword).pipe(
            tapResponse({
              next: () => {
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.passwordUpdated'),
                  detail: translateService.instant('messages.success.passwordUpdatedDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.passwordUpdateError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    resetPassword: rxMethod<{ token: string; newPassword: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ token, newPassword }) =>
          userService.resetPassword(token, newPassword).pipe(
            tapResponse({
              next: () => {
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.passwordReset'),
                  detail: translateService.instant('messages.success.passwordResetDetail'),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.passwordResetError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    lockAccount: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          userService.lockAccount(id).pipe(
            tapResponse({
              next: (updatedUser: UserInfo) => {
                patchState(store, updateEntity({ id, changes: updatedUser }));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.accountLocked'),
                  detail: translateService.instant('messages.success.accountLockedDetail', { name: updatedUser.name }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.accountLockError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    unlockAccount: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((id) =>
          userService.unlockAccount(id).pipe(
            tapResponse({
              next: (updatedUser: UserInfo) => {
                patchState(store, updateEntity({ id, changes: updatedUser }));
                messageService.add({
                  severity: 'success',
                  summary: translateService.instant('messages.success.accountUnlocked'),
                  detail: translateService.instant('messages.success.accountUnlockedDetail', { name: updatedUser.name }),
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: translateService.instant('messages.errors.error'),
                  detail: translateService.instant('messages.errors.accountUnlockError'),
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    openUserDialog: (user?: UserInfo) => {
      patchState(store, {
        selectedUser: user || null,
        dialogVisible: true,
      });
    },
    closeUserDialog: () => {
      patchState(store, { dialogVisible: false });
    },
    clearSelectedUser: () => {
      patchState(store, { selectedUser: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
