import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiBaseUrlInterceptor } from '@core/api/api-base-url.interceptor';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import { environment } from '@env';
import { ScheduleData, ScheduleInfo } from '../models/schedule';
import { ScheduleService } from './schedule';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/schedules`;

  const mockSchedule: ScheduleInfo = {
    id: 1,
    userId: 1,
    userName: 'Test Employee',
    day: 'MONDAY',
    startTime: '09:00',
    endTime: '17:00',
    type: 'REGULAR',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ScheduleService,
        {
          provide: API_BASE_URL,
          useValue: environment.apiUrl,
        },
        provideHttpClient(withInterceptors([apiBaseUrlInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ScheduleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all schedules', () => {
    const mockSchedules: ScheduleInfo[] = [mockSchedule];
    service.findAll().subscribe((schedules) => {
      expect(schedules).toEqual(mockSchedules);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockSchedules);
  });

  it('should find schedule by id', () => {
    service.findById(1).subscribe((schedule) => {
      expect(schedule).toEqual(mockSchedule);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSchedule);
  });

  it('should find schedules by employee id', () => {
    const employeeId = 1;
    const mockSchedules: ScheduleInfo[] = [mockSchedule];
    service.findByEmployeeId(employeeId).subscribe((schedules) => {
      expect(schedules).toEqual(mockSchedules);
    });
    const req = httpMock.expectOne(`${apiUrl}/employee/${employeeId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSchedules);
  });

  it('should create a schedule', () => {
    const scheduleData: ScheduleData = {
      userId: 1,
      day: 'MONDAY',
      startTime: '09:00',
      endTime: '17:00',
      type: 'REGULAR',
      isActive: true,
    };
    service.create(scheduleData).subscribe((schedule) => {
      expect(schedule).toEqual(mockSchedule);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(scheduleData);
    req.flush(mockSchedule);
  });

  it('should update a schedule', () => {
    const scheduleData: ScheduleData = {
      userId: 1,
      day: 'TUESDAY',
      startTime: '10:00',
      endTime: '18:00',
      type: 'REGULAR',
      isActive: true,
    };
    service.update(1, scheduleData).subscribe((schedule) => {
      expect(schedule).toEqual(mockSchedule);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(scheduleData);
    req.flush(mockSchedule);
  });

  it('should delete a schedule', () => {
    service.delete(1).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should delete multiple schedules by ids', () => {
    const ids = [1, 2, 3];
    service.deleteAllById(ids).subscribe();
    const req = httpMock.expectOne(`${apiUrl}/delete-many`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual(ids);
    req.flush(null);
  });
});
