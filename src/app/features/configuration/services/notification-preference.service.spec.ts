import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import {
  NotificationChannel,
  NotificationPreferenceData,
  NotificationPreferenceInfo,
  NotificationType,
} from '../models/notification-preference.model';
import { NotificationPreferenceService } from './notification-preference.service';

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl;

  const mockNotificationPreference: NotificationPreferenceInfo = {
    id: 1,
    userId: 1,
    notificationType: NotificationType.EMAIL,
    channel: NotificationChannel.IMMEDIATE,
    enabled: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        NotificationPreferenceService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(NotificationPreferenceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should return all notification preferences', () => {
      service.findAll().subscribe((preferences) => {
        expect(preferences.length).toBe(1);
        expect(preferences[0]).toEqual(mockNotificationPreference);
      });

      const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
      expect(req.request.method).toBe('GET');
      req.flush([mockNotificationPreference]);
    });
  });

  describe('findByUserId', () => {
    it('should return notification preferences for a user', () => {
      const userId = 1;
      service.findByUserId(userId).subscribe((preferences) => {
        expect(preferences.length).toBe(1);
        expect(preferences[0]).toEqual(mockNotificationPreference);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/notification-preferences/user/${userId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockNotificationPreference]);
    });
  });

  describe('create', () => {
    it('should create a notification preference', () => {
      const preferenceData: NotificationPreferenceData = {
        userId: 1,
        notificationType: NotificationType.EMAIL,
        channel: NotificationChannel.IMMEDIATE,
        enabled: true,
      };
      service.create(preferenceData).subscribe((preference) => {
        expect(preference).toEqual(mockNotificationPreference);
      });

      const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
      expect(req.request.method).toBe('POST');
      req.flush(mockNotificationPreference);
    });
  });

  describe('update', () => {
    it('should update a notification preference', () => {
      const preferenceId = 1;
      const preferenceData: Partial<NotificationPreferenceData> = {
        enabled: false,
      };
      service.update(preferenceId, preferenceData).subscribe((preference) => {
        expect(preference.enabled).toBe(false);
      });

      const req = httpMock.expectOne(
        `${apiUrl}/notification-preferences/${preferenceId}`,
      );
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockNotificationPreference, enabled: false });
    });
  });

  describe('delete', () => {
    it('should delete a notification preference', () => {
      const preferenceId = 1;
      service.delete(preferenceId).subscribe();

      const req = httpMock.expectOne(
        `${apiUrl}/notification-preferences/${preferenceId}`,
      );
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple notification preferences', () => {
      const ids = [1, 2];
      service.deleteAllById(ids).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/notification-preferences`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(ids);
      req.flush({});
    });
  });

  describe('updateUserPreferences', () => {
    it('should update all preferences for a user', () => {
      const userId = 1;
      const preferencesToUpdate: NotificationPreferenceData[] = [
        {
          userId: 1,
          notificationType: NotificationType.EMAIL,
          channel: NotificationChannel.IMMEDIATE,
          enabled: true,
        },
        {
          userId: 1,
          notificationType: NotificationType.SMS,
          channel: NotificationChannel.DAILY,
          enabled: false,
        },
      ];
      const expectedResponse: NotificationPreferenceInfo[] = [
        { ...preferencesToUpdate[0], id: 1 },
        { ...preferencesToUpdate[1], id: 2 },
      ];

      service
        .updateUserPreferences(userId, preferencesToUpdate)
        .subscribe((response) => {
          expect(response).toEqual(expectedResponse);
        });

      const req = httpMock.expectOne(
        `${apiUrl}/notification-preferences/user/${userId}`,
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(preferencesToUpdate);
      req.flush(expectedResponse);
    });
  });
});
