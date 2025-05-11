import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  NotificationPreferenceData,
  NotificationPreferenceInfo,
  NotificationType,
} from '../models/notification-preference.model';
import { NotificationPreferenceService } from './notification-preference.service';

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;
  let httpMock: HttpTestingController;

  const mockNotificationPreference: NotificationPreferenceInfo = {
    id: 1,
    userId: 1,
    type: NotificationType.EMAIL,
    enabled: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NotificationPreferenceService],
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
      const mockPreferences = [mockNotificationPreference];

      service.findAll().subscribe((preferences) => {
        expect(preferences).toEqual(mockPreferences);
      });

      const req = httpMock.expectOne('/api/notification-preferences');
      expect(req.request.method).toBe('GET');
      req.flush(mockPreferences);
    });
  });

  describe('findByUserId', () => {
    it('should return notification preferences for a user', () => {
      const userId = 1;
      const mockPreferences = [mockNotificationPreference];

      service.findByUserId(userId).subscribe((preferences) => {
        expect(preferences).toEqual(mockPreferences);
      });

      const req = httpMock.expectOne(
        `/api/notification-preferences/user/${userId}`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPreferences);
    });
  });

  describe('create', () => {
    it('should create a notification preference', () => {
      const preferenceData: NotificationPreferenceData = {
        userId: 1,
        type: NotificationType.EMAIL,
        enabled: true,
      };

      service.create(preferenceData).subscribe((preference) => {
        expect(preference).toEqual(mockNotificationPreference);
      });

      const req = httpMock.expectOne('/api/notification-preferences');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(preferenceData);
      req.flush(mockNotificationPreference);
    });
  });

  describe('update', () => {
    it('should update a notification preference', () => {
      const id = 1;
      const preferenceData: Partial<NotificationPreferenceData> = {
        enabled: false,
      };

      service.update(id, preferenceData).subscribe((preference) => {
        expect(preference).toEqual(mockNotificationPreference);
      });

      const req = httpMock.expectOne(`/api/notification-preferences/${id}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(preferenceData);
      req.flush(mockNotificationPreference);
    });
  });

  describe('delete', () => {
    it('should delete a notification preference', () => {
      const id = 1;

      service.delete(id).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`/api/notification-preferences/${id}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple notification preferences', () => {
      const ids = [1, 2];

      service.deleteAllById(ids).subscribe((response) => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne('/api/notification-preferences/batch');
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual(ids);
      req.flush(null);
    });
  });
});
