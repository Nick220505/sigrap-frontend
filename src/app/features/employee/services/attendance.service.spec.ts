import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import {
  AttendanceInfo,
  AttendanceStatus,
  ClockInData,
  ClockOutData,
} from '../models/attendance.model';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/attendance`;

  const mockAttendance: AttendanceInfo = {
    id: 1,
    userId: 1,
    userName: 'Test Employee',
    date: '2023-01-01',
    clockInTime: '09:00:00',
    clockOutTime: '17:00:00',
    totalHours: 8,
    status: 'PRESENT' as AttendanceStatus,
    createdAt: '2023-01-01T09:00:00Z',
    updatedAt: '2023-01-01T17:00:00Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AttendanceService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AttendanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should find all attendances', () => {
    const mockAttendances: AttendanceInfo[] = [mockAttendance];
    service.findAll().subscribe((attendances) => {
      expect(attendances).toEqual(mockAttendances);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockAttendances);
  });

  it('should find attendance by id', () => {
    service.findById(1).subscribe((attendance) => {
      expect(attendance).toEqual(mockAttendance);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAttendance);
  });

  it('should find attendances by employee id', () => {
    const employeeId = 1;
    const mockAttendances: AttendanceInfo[] = [mockAttendance];
    service.findByEmployeeId(employeeId).subscribe((attendances) => {
      expect(attendances).toEqual(mockAttendances);
    });
    const req = httpMock.expectOne(`${apiUrl}/employee/${employeeId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAttendances);
  });

  it('should clock in', () => {
    const clockInData: ClockInData = {
      userId: 1,
    };
    service.clockIn(clockInData).subscribe((attendance) => {
      expect(attendance).toEqual(mockAttendance);
    });
    const req = httpMock.expectOne(`${apiUrl}/clock-in`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(clockInData);
    req.flush(mockAttendance);
  });

  it('should clock out', () => {
    const clockOutData: ClockOutData = {
      attendanceId: 1,
    };
    service.clockOut(clockOutData).subscribe((attendance) => {
      expect(attendance).toEqual(mockAttendance);
    });
    const req = httpMock.expectOne(`${apiUrl}/clock-out`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(clockOutData);
    req.flush(mockAttendance);
  });
});
