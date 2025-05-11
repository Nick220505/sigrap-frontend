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
    notificationPreferenceService: inject(NotificationPreferenceService),
    messageService: inject(MessageService),
  })),
  withMethods(
    ({ notificationPreferenceService, messageService, ...store }) => ({
      findAll: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            notificationPreferenceService.findAll().pipe(
              tapResponse({
                next: (preferences) => {
                  patchState(store, setAllEntities(preferences));
                },
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al cargar preferencias',
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
            notificationPreferenceService.findByUserId(userId).pipe(
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
            notificationPreferenceService.create(preferenceData).pipe(
              tapResponse({
                next: (createdPreference: NotificationPreferenceInfo) => {
                  patchState(store, addEntity(createdPreference));
                  messageService.add({
                    severity: 'success',
                    summary: 'Preferencia creada',
                    detail: `La preferencia de notificación ha sido creada correctamente`,
                  });
                },
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al crear preferencia',
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
            notificationPreferenceService.update(id, preferenceData).pipe(
              tapResponse({
                next: (updatedPreference: NotificationPreferenceInfo) => {
                  patchState(
                    store,
                    updateEntity({ id, changes: updatedPreference }),
                  );
                  messageService.add({
                    severity: 'success',
                    summary: 'Preferencia actualizada',
                    detail: `La preferencia de notificación ha sido actualizada correctamente`,
                  });
                },
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al actualizar preferencia',
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
            notificationPreferenceService.delete(id).pipe(
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
                    detail: 'Error al eliminar preferencia',
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
            notificationPreferenceService.deleteAllById(ids).pipe(
              tapResponse({
                next: () => {
                  patchState(store, removeEntities(ids));
                  messageService.add({
                    severity: 'success',
                    summary: 'Preferencias eliminadas',
                    detail:
                      'Las preferencias seleccionadas han sido eliminadas correctamente',
                  });
                },
                error: ({ message: error }: Error) => {
                  patchState(store, { error });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Error al eliminar preferencias',
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
          selectedPreference: preference || null,
          dialogVisible: true,
        });
      },
      closePreferenceDialog: () => {
        patchState(store, { dialogVisible: false });
      },
      clearSelectedPreference: () => {
        patchState(store, { selectedPreference: null });
      },
    }),
  ),
  withHooks({
    onInit({ findAll }) {
      findAll();
    },
  }),
);
