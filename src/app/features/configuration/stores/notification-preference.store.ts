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
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, switchMap, tap } from 'rxjs';
import {
  NotificationPreferenceData,
  NotificationPreferenceInfo,
} from '../models/notification-preference.model';
import { NotificationPreferenceService } from '../services/notification-preference.service';

export interface NotificationPreferenceState {
  loading: boolean;
  error: string | null;
  selectedPreference: NotificationPreferenceInfo | null;
  dialogVisible: boolean;
}

export const NotificationPreferenceStore = signalStore(
  { providedIn: 'root' },
  withEntities<NotificationPreferenceInfo>(),
  withState<NotificationPreferenceState>({
    loading: false,
    error: null,
    selectedPreference: null,
    dialogVisible: false,
  }),
  withComputed(({ entities }) => ({
    preferencesCount: computed(() => entities().length),
  })),
  withProps(() => ({
    preferenceService: inject(NotificationPreferenceService),
    messageService: inject(MessageService),
  })),
  withMethods(({ preferenceService, messageService, ...store }) => ({
    findAll: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          preferenceService.findAll().pipe(
            tapResponse({
              next: (preferences) => {
                patchState(store, setAllEntities(preferences));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar preferencias de notificación',
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
          preferenceService.findByUserId(userId).pipe(
            tapResponse({
              next: (preferences) => {
                patchState(store, setAllEntities(preferences));
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al cargar preferencias del usuario',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    create: rxMethod<NotificationPreferenceData>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((preferenceData) =>
          preferenceService.create(preferenceData).pipe(
            tapResponse({
              next: (createdPreference: NotificationPreferenceInfo) => {
                patchState(store, addEntity(createdPreference));
                messageService.add({
                  severity: 'success',
                  summary: 'Preferencia creada',
                  detail:
                    'La preferencia de notificación ha sido creada correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al crear preferencia de notificación',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    update: rxMethod<{
      id: number;
      preferenceData: Partial<NotificationPreferenceData>;
    }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ id, preferenceData }) =>
          preferenceService.update(id, preferenceData).pipe(
            tapResponse({
              next: (updatedPreference: NotificationPreferenceInfo) => {
                patchState(
                  store,
                  updateEntity({ id, changes: updatedPreference }),
                );
                messageService.add({
                  severity: 'success',
                  summary: 'Preferencia actualizada',
                  detail:
                    'La preferencia de notificación ha sido actualizada correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar preferencia de notificación',
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
          preferenceService.delete(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, removeEntity(id));
                messageService.add({
                  severity: 'success',
                  summary: 'Preferencia eliminada',
                  detail:
                    'La preferencia de notificación ha sido eliminada correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al eliminar preferencia de notificación',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    updateUserPreferences: rxMethod<{
      userId: number;
      preferences: NotificationPreferenceData[];
    }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap(({ userId, preferences }) =>
          preferenceService.updateUserPreferences(userId, preferences).pipe(
            tapResponse({
              next: (updatedPreferences: NotificationPreferenceInfo[]) => {
                patchState(store, setAllEntities(updatedPreferences));
                messageService.add({
                  severity: 'success',
                  summary: 'Preferencias actualizadas',
                  detail:
                    'Las preferencias de notificación han sido actualizadas correctamente',
                });
              },
              error: ({ message: error }: Error) => {
                patchState(store, { error });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Error al actualizar preferencias de notificación',
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    openPreferenceDialog: (preference?: NotificationPreferenceInfo) => {
      patchState(store, {
        selectedPreference: preference,
        dialogVisible: true,
      });
    },
    closePreferenceDialog: () => {
      patchState(store, { dialogVisible: false });
    },
    clearSelectedPreference: () => {
      patchState(store, { selectedPreference: null });
    },
  })),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
