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
  })),
  withMethods(({ userService, messageService, ...store }) => ({
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
                  summary: 'Error',
                  detail: 'Error loading users',
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
                  summary: 'User Created',
                  detail: `User ${createdUser.name} has been created successfully`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error creating user',
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
                  summary: 'User Updated',
                  detail: `User ${updatedUser.name} has been updated successfully`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error updating user',
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
                  summary: 'User Deleted',
                  detail: 'User has been deleted successfully',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error deleting user',
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
                  summary: 'Users Deleted',
                  detail: 'Selected users have been deleted successfully',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error deleting users',
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
                  summary: 'Profile Updated',
                  detail: 'Profile has been updated successfully',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error updating profile',
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
                  summary: 'Password Updated',
                  detail: 'Password has been updated successfully',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error updating password',
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
                  summary: 'Password Reset',
                  detail: 'Password has been reset successfully',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error resetting password',
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
                  summary: 'Account Locked',
                  detail: `User ${updatedUser.name}'s account has been locked`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error locking account',
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
                  summary: 'Account Unlocked',
                  detail: `User ${updatedUser.name}'s account has been unlocked`,
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error unlocking account',
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
