import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import {
  NotificationPreferenceData,
  NotificationPreferenceInfo,
  NotificationType,
} from '../models/notification-preference.model';
import { NotificationPreferenceService } from './notification-preference.service';

describe('NotificationPreferenceService', () => {
  let service: NotificationPreferenceService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/notification-preferences`;

  const mockPreference: NotificationPreferenceInfo = {
    id: 1,
    userId: 1,
    notificationType: NotificationType.SECURITY,
    enabled: true,
    emailEnabled: true,
    pushEnabled: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
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

  it('should find all notification preferences', () => {
    const mockPreferences: NotificationPreferenceInfo[] = [mockPreference];
    service.findAll().subscribe((preferences) => {
      expect(preferences).toEqual(mockPreferences);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockPreferences);
  });

  it('should find notification preference by id', () => {
    service.findById(1).subscribe((preference) => {
      expect(preference).toEqual(mockPreference);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPreference);
  });

  it('should find notification preferences by user id', () => {
    const userId = 1;
    const mockPreferences: NotificationPreferenceInfo[] = [mockPreference];
    service.findByUserId(userId).subscribe((preferences) => {
      expect(preferences).toEqual(mockPreferences);
    });
    const req = httpMock.expectOne(`${apiUrl}/user/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPreferences);
  });

  it('should create a notification preference', () => {
    const createDto: NotificationPreferenceData = {
      userId: 1,
      notificationType: NotificationType.SECURITY,
      enabled: true,
      emailEnabled: true,
      pushEnabled: false,
    };
    service.create(createDto).subscribe((preference) => {
      expect(preference).toEqual(mockPreference);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createDto);
    req.flush(mockPreference);
  });

  it('should update a notification preference', () => {
    const updateDto: Partial<NotificationPreferenceData> = {
      enabled: false,
      emailEnabled: false,
    };
    service.update(1, updateDto).subscribe((preference) => {
      expect(preference).toEqual(mockPreference);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush(mockPreference);
  });

  it('should delete a notification preference', () => {
    service.delete(1).subscribe((result) => {
      expect(result).toBeNull();
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should update user preferences', () => {
    const userId = 1;
    const preferences: NotificationPreferenceData[] = [
      {
        userId: 1,
        notificationType: NotificationType.SECURITY,
        enabled: true,
        emailEnabled: true,
        pushEnabled: false,
      },
    ];
    const mockPreferences: NotificationPreferenceInfo[] = [mockPreference];
    service.updateUserPreferences(userId, preferences).subscribe((result) => {
      expect(result).toEqual(mockPreferences);
    });
    const req = httpMock.expectOne(`${apiUrl}/user/${userId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(preferences);
    req.flush(mockPreferences);
  });
});
