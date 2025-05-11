import {
  HttpErrorResponse,
  HttpStatusCode,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import {
  NotificationPreferenceData,
  NotificationPreferenceInfo,
  NotificationType,
} from '../models/notification-preference.model';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { NotificationPreferenceStore } from './notification-preference.store';

describe('NotificationPreferenceStore', () => {
  let store: InstanceType<typeof NotificationPreferenceStore>;
  let preferenceService: jasmine.SpyObj<NotificationPreferenceService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockPreferences: NotificationPreferenceInfo[] = [
    {
      id: 1,
      userId: 1,
      notificationType: NotificationType.SECURITY,
      enabled: true,
      emailEnabled: true,
      pushEnabled: false,
    },
    {
      id: 2,
      userId: 1,
      notificationType: NotificationType.PRODUCT_UPDATES,
      enabled: true,
      emailEnabled: false,
      pushEnabled: true,
    },
  ];

  beforeEach(() => {
    preferenceService = jasmine.createSpyObj('NotificationPreferenceService', [
      'findAll',
      'findByUserId',
      'create',
      'update',
      'delete',
      'updateUserPreferences',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    preferenceService.findAll.and.returnValue(of(mockPreferences));
    preferenceService.findByUserId.and.returnValue(of(mockPreferences));
    preferenceService.create.and.returnValue(
      of({
        id: 3,
        userId: 1,
        notificationType: NotificationType.INVENTORY_ALERTS,
        enabled: true,
        emailEnabled: true,
        pushEnabled: true,
      }),
    );
    preferenceService.update.and.returnValue(
      of({
        id: 1,
        userId: 1,
        notificationType: NotificationType.SECURITY,
        enabled: false,
        emailEnabled: false,
        pushEnabled: false,
      }),
    );
    preferenceService.delete.and.returnValue(of(undefined));
    preferenceService.updateUserPreferences.and.returnValue(
      of(mockPreferences),
    );

    TestBed.configureTestingModule({
      providers: [
        NotificationPreferenceStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NotificationPreferenceService, useValue: preferenceService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(NotificationPreferenceStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should call the service method and set entities', () => {
      expect(preferenceService.findAll).toHaveBeenCalled();
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findAll fails', () => {
      preferenceService.findAll.calls.reset();
      const testError = new Error('Failed to fetch preferences');
      preferenceService.findAll.and.returnValue(throwError(() => testError));
      store.findAll();
      expect(store.error()).toBe('Failed to fetch preferences');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar preferencias de notificación',
      });
    });
  });

  describe('findByUserId', () => {
    it('should call the service method and set entities', () => {
      store.findByUserId(1);

      expect(preferenceService.findByUserId).toHaveBeenCalledWith(1);
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findByUserId fails', () => {
      preferenceService.findByUserId.calls.reset();
      const testError = new Error('Failed to fetch user preferences');
      preferenceService.findByUserId.and.returnValue(
        throwError(() => testError),
      );
      store.findByUserId(1);
      expect(store.error()).toBe('Failed to fetch user preferences');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar preferencias del usuario',
      });
    });
  });

  describe('create', () => {
    it('should call the service method and show success message', () => {
      const preferenceData: NotificationPreferenceData = {
        userId: 1,
        notificationType: NotificationType.INVENTORY_ALERTS,
        enabled: true,
        emailEnabled: true,
        pushEnabled: true,
      };

      store.create(preferenceData);

      expect(preferenceService.create).toHaveBeenCalledWith(preferenceData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Preferencia creada',
        detail: 'La preferencia de notificación ha sido creada correctamente',
      });
    });

    it('should handle error when creating preference fails', () => {
      preferenceService.create.calls.reset();
      preferenceService.create.and.returnValue(
        throwError(() => new Error('Failed to create preference')),
      );

      const preferenceData: NotificationPreferenceData = {
        userId: 1,
        notificationType: NotificationType.INVENTORY_ALERTS,
        enabled: true,
        emailEnabled: true,
        pushEnabled: true,
      };

      store.create(preferenceData);

      expect(preferenceService.create).toHaveBeenCalledWith(preferenceData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear preferencia de notificación',
      });
    });
  });

  describe('update', () => {
    it('should call the service method and show success message', () => {
      const preferenceData: Partial<NotificationPreferenceData> = {
        enabled: false,
        emailEnabled: false,
        pushEnabled: false,
      };

      store.update({ id: 1, preferenceData });

      expect(preferenceService.update).toHaveBeenCalledWith(1, preferenceData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Preferencia actualizada',
        detail:
          'La preferencia de notificación ha sido actualizada correctamente',
      });
    });

    it('should handle error when updating preference fails', () => {
      preferenceService.update.calls.reset();
      preferenceService.update.and.returnValue(
        throwError(() => new Error('Failed to update preference')),
      );

      const preferenceData: Partial<NotificationPreferenceData> = {
        enabled: false,
        emailEnabled: false,
        pushEnabled: false,
      };

      store.update({ id: 1, preferenceData });

      expect(preferenceService.update).toHaveBeenCalledWith(1, preferenceData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar preferencia de notificación',
      });
    });
  });

  describe('delete', () => {
    it('should call the service method and show success message', () => {
      store.delete(1);

      expect(preferenceService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Preferencia eliminada',
        detail:
          'La preferencia de notificación ha sido eliminada correctamente',
      });
    });

    it('should handle error when deleting preference', () => {
      preferenceService.delete.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      preferenceService.delete.and.returnValue(throwError(() => errorResponse));

      store.delete(1);

      expect(preferenceService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar preferencia de notificación',
      });
    });
  });

  describe('updateUserPreferences', () => {
    it('should call the service method and show success message', () => {
      const preferences: NotificationPreferenceData[] = [
        {
          userId: 1,
          notificationType: NotificationType.SECURITY,
          enabled: true,
          emailEnabled: true,
          pushEnabled: false,
        },
        {
          userId: 1,
          notificationType: NotificationType.PRODUCT_UPDATES,
          enabled: true,
          emailEnabled: false,
          pushEnabled: true,
        },
      ];

      store.updateUserPreferences({ userId: 1, preferences });

      expect(preferenceService.updateUserPreferences).toHaveBeenCalledWith(
        1,
        preferences,
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Preferencias actualizadas',
        detail:
          'Las preferencias de notificación han sido actualizadas correctamente',
      });
    });

    it('should handle error when updating user preferences', () => {
      preferenceService.updateUserPreferences.calls.reset();
      const errorResponse = new HttpErrorResponse({
        error: { message: 'Server error' },
        status: HttpStatusCode.InternalServerError,
        statusText: 'Server Error',
      });

      preferenceService.updateUserPreferences.and.returnValue(
        throwError(() => errorResponse),
      );

      const preferences: NotificationPreferenceData[] = [
        {
          userId: 1,
          notificationType: NotificationType.SECURITY,
          enabled: true,
          emailEnabled: true,
          pushEnabled: false,
        },
      ];

      store.updateUserPreferences({ userId: 1, preferences });

      expect(preferenceService.updateUserPreferences).toHaveBeenCalledWith(
        1,
        preferences,
      );
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar preferencias de notificación',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open preference dialog without preference', () => {
      store.openPreferenceDialog();
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedPreference()).toBeFalsy();
    });

    it('should open preference dialog with preference', () => {
      const preference: NotificationPreferenceInfo = {
        id: 1,
        userId: 1,
        notificationType: NotificationType.SECURITY,
        enabled: true,
        emailEnabled: true,
        pushEnabled: false,
      };

      store.openPreferenceDialog(preference);
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedPreference()).toEqual(preference);
    });

    it('should close preference dialog', () => {
      store.openPreferenceDialog();
      expect(store.dialogVisible()).toBeTrue();

      store.closePreferenceDialog();
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should clear selected preference', () => {
      const preference: NotificationPreferenceInfo = {
        id: 1,
        userId: 1,
        notificationType: NotificationType.SECURITY,
        enabled: true,
        emailEnabled: true,
        pushEnabled: false,
      };
      store.openPreferenceDialog(preference);
      expect(store.selectedPreference()).toEqual(preference);

      store.clearSelectedPreference();
      expect(store.selectedPreference()).toBeNull();
    });
  });
});
