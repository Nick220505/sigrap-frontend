import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import {
  NotificationPreferenceData,
  NotificationPreferenceInfo,
  NotificationType,
} from '../models/notification-preference.model';
import { NotificationPreferenceStore } from './notification-preference.store';

describe('NotificationPreferenceStore', () => {
  let store: InstanceType<typeof NotificationPreferenceStore>;
  let httpMock: HttpTestingController;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockNotificationPreference: NotificationPreferenceInfo = {
    id: 1,
    userId: 1,
    type: NotificationType.EMAIL,
    enabled: true,
  };

  const mockNotificationPreferenceData: NotificationPreferenceData = {
    userId: 1,
    type: NotificationType.EMAIL,
    enabled: true,
  };

  beforeEach(() => {
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      providers: [
        NotificationPreferenceStore,
        provideHttpClient(),
        provideHttpClientTesting(),
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
    const req = httpMock.expectOne('/api/notification-preferences');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  describe('findAll', () => {
    it('should update entities signal with notification preferences', () => {
      store.findAll();

      const req = httpMock.expectOne('/api/notification-preferences');
      expect(req.request.method).toBe('GET');
      req.flush([mockNotificationPreference]);

      expect(store.entities()).toEqual([mockNotificationPreference]);
    });

    it('should handle error when finding notification preferences fails', () => {
      store.findAll();

      const req = httpMock.expectOne('/api/notification-preferences');
      expect(req.request.method).toBe('GET');
      req.error(new ProgressEvent('error'));

      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar preferencias',
      });
    });
  });

  describe('findByUserId', () => {
    it('should update entities signal with user notification preferences', () => {
      store.findByUserId(1);

      const req = httpMock.expectOne('/api/notification-preferences/user/1');
      expect(req.request.method).toBe('GET');
      req.flush([mockNotificationPreference]);

      expect(store.entities()).toEqual([mockNotificationPreference]);
    });

    it('should handle error when finding user notification preferences fails', () => {
      store.findByUserId(1);

      const req = httpMock.expectOne('/api/notification-preferences/user/1');
      expect(req.request.method).toBe('GET');
      req.error(new ProgressEvent('error'));

      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar preferencias del usuario',
      });
    });
  });

  describe('create', () => {
    it('should add new notification preference to entities', () => {
      store.create(mockNotificationPreferenceData);

      const req = httpMock.expectOne('/api/notification-preferences');
      expect(req.request.method).toBe('POST');
      req.flush(mockNotificationPreference);

      expect(store.entities()).toEqual([mockNotificationPreference]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Preferencia creada',
        detail: 'La preferencia de notificación ha sido creada correctamente',
      });
    });

    it('should handle error when creating notification preference fails', () => {
      store.create(mockNotificationPreferenceData);

      const req = httpMock.expectOne('/api/notification-preferences');
      expect(req.request.method).toBe('POST');
      req.error(new ProgressEvent('error'));

      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear preferencia',
      });
    });
  });

  describe('update', () => {
    it('should update notification preference in entities', () => {
      store.update({ id: 1, preferenceData: mockNotificationPreferenceData });

      const req = httpMock.expectOne('/api/notification-preferences/1');
      expect(req.request.method).toBe('PUT');
      req.flush(mockNotificationPreference);

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Preferencia actualizada',
        detail:
          'La preferencia de notificación ha sido actualizada correctamente',
      });
    });

    it('should handle error when updating notification preference fails', () => {
      store.update({ id: 1, preferenceData: mockNotificationPreferenceData });

      const req = httpMock.expectOne('/api/notification-preferences/1');
      expect(req.request.method).toBe('PUT');
      req.error(new ProgressEvent('error'));

      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar preferencia',
      });
    });
  });

  describe('delete', () => {
    it('should remove notification preference from entities', () => {
      store.delete(1);

      const req = httpMock.expectOne('/api/notification-preferences/1');
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Preferencia eliminada',
        detail:
          'La preferencia de notificación ha sido eliminada correctamente',
      });
    });

    it('should handle error when deleting notification preference fails', () => {
      store.delete(1);

      const req = httpMock.expectOne('/api/notification-preferences/1');
      expect(req.request.method).toBe('DELETE');
      req.error(new ProgressEvent('error'));

      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar preferencia',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple notification preferences', () => {
      store.deleteAllById([1, 2]);

      const req = httpMock.expectOne('/api/notification-preferences/batch');
      expect(req.request.method).toBe('DELETE');
      req.flush({});

      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Preferencias eliminadas',
        detail:
          'Las preferencias seleccionadas han sido eliminadas correctamente',
      });
    });

    it('should handle error when deleting multiple notification preferences fails', () => {
      store.deleteAllById([1, 2]);

      const req = httpMock.expectOne('/api/notification-preferences/batch');
      expect(req.request.method).toBe('DELETE');
      req.error(new ProgressEvent('error'));

      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar preferencias',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open preference dialog without preference', () => {
      store.openPreferenceDialog();
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedPreference()).toBeNull();
    });

    it('should open preference dialog with preference', () => {
      store.openPreferenceDialog(mockNotificationPreference);
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedPreference()).toBe(mockNotificationPreference);
    });

    it('should close preference dialog', () => {
      store.openPreferenceDialog();
      store.closePreferenceDialog();
      expect(store.dialogVisible()).toBe(false);
    });

    it('should clear selected preference', () => {
      store.openPreferenceDialog(mockNotificationPreference);
      store.clearSelectedPreference();
      expect(store.selectedPreference()).toBeNull();
    });
  });
});
