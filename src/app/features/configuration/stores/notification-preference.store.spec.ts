import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import { MessageService } from 'primeng/api';
import {
  NotificationChannel,
  NotificationPreferenceData,
  NotificationPreferenceInfo,
  NotificationType,
} from '../models/notification-preference.model';
import { NotificationPreferenceStore } from './notification-preference.store';

describe('NotificationPreferenceStore', () => {
  let store: InstanceType<typeof NotificationPreferenceStore>;
  let httpMock: HttpTestingController;
  let messageService: jasmine.SpyObj<MessageService>;
  const apiUrl = environment.apiUrl;

  const mockNotificationPreference: NotificationPreferenceInfo = {
    id: 1,
    userId: 1,
    notificationType: NotificationType.EMAIL,
    channel: NotificationChannel.IMMEDIATE,
    enabled: true,
  };

  const mockNotificationPreferenceData: NotificationPreferenceData = {
    userId: 1,
    notificationType: NotificationType.EMAIL,
    channel: NotificationChannel.IMMEDIATE,
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
    const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should update entities signal with all notification preferences', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.findAll();
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
      expect(req.request.method).toBe('GET');
      req.flush([mockNotificationPreference]);
      expect(store.entities()).toEqual([mockNotificationPreference]);
    });

    it('should handle error when finding notification preferences fails', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.findAll();
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
      req.error(new ProgressEvent('error'));
      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalled();
    });
  });

  describe('findByUserId', () => {
    it('should update entities signal with user notification preferences', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.findByUserId(1);
      const req = httpMock.expectOne(
        `${apiUrl}/notification-preferences/user/1`,
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockNotificationPreference]);
      expect(store.entities()).toEqual([mockNotificationPreference]);
    });

    it('should handle error when finding user notification preferences fails', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.findByUserId(1);
      const req = httpMock.expectOne(
        `${apiUrl}/notification-preferences/user/1`,
      );
      req.error(new ProgressEvent('error'));
      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should add new notification preference to entities', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.create(mockNotificationPreferenceData);
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
      expect(req.request.method).toBe('POST');
      req.flush(mockNotificationPreference);
      expect(store.entities()).toContain(mockNotificationPreference);
      expect(messageService.add).toHaveBeenCalled();
    });

    it('should handle error when creating notification preference fails', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.create(mockNotificationPreferenceData);
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
      req.error(new ProgressEvent('error'));
      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update notification preference in entities', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([mockNotificationPreference]);

      const updatedPreference = {
        ...mockNotificationPreference,
        enabled: false,
      };
      store.update({ id: 1, preferenceData: { enabled: false } });
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(updatedPreference);
      expect(store.entities()[0]?.enabled).toBe(false);
      expect(messageService.add).toHaveBeenCalled();
    });

    it('should handle error when updating notification preference fails', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([mockNotificationPreference]);

      store.update({ id: 1, preferenceData: { enabled: false } });
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences/1`);
      req.error(new ProgressEvent('error'));
      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should remove notification preference from entities', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([mockNotificationPreference]);

      store.delete(1);
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush({});
      expect(store.entities().find((e) => e.id === 1)).toBeUndefined();
      expect(messageService.add).toHaveBeenCalled();
    });

    it('should handle error when deleting notification preference fails', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([mockNotificationPreference]);

      store.delete(1);
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences/1`);
      req.error(new ProgressEvent('error'));
      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalled();
    });
  });

  describe('deleteAllById', () => {
    it('should remove multiple notification preferences from entities', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([
        mockNotificationPreference,
        { ...mockNotificationPreference, id: 2 },
      ]);

      const idsToRemove = [1, 2];
      store.deleteAllById(idsToRemove);
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(idsToRemove);
      req.flush({});
      expect(store.entities().length).toBe(0);
      expect(messageService.add).toHaveBeenCalled();
    });

    it('should handle error when deleting multiple preferences fails', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([
        mockNotificationPreference,
        { ...mockNotificationPreference, id: 2 },
      ]);

      const idsToRemove = [1, 2];
      store.deleteAllById(idsToRemove);
      const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
      req.error(new ProgressEvent('error'));
      expect(store.error()).toBeTruthy();
      expect(messageService.add).toHaveBeenCalled();
    });
  });

  describe('dialog operations', () => {
    it('should open preference dialog without preference', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.openPreferenceDialog();
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedPreference()).toBeNull();
    });

    it('should open preference dialog with preference', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.openPreferenceDialog(mockNotificationPreference);
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedPreference()).toEqual(mockNotificationPreference);
    });

    it('should close preference dialog', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.closePreferenceDialog();
      expect(store.dialogVisible()).toBe(false);
    });

    it('should clear selected preference', () => {
      const onInitReq = httpMock.expectOne(
        `${apiUrl}/notification-preferences`,
      );
      expect(onInitReq.request.method).toBe('GET');
      onInitReq.flush([]);

      store.openPreferenceDialog(mockNotificationPreference);
      store.clearSelectedPreference();
      expect(store.selectedPreference()).toBeNull();
    });
  });
});
