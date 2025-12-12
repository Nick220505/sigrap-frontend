import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import {
  AttendanceInfo,
  AttendanceStatus,
  ClockInData,
  ClockOutData,
} from '../models/attendance';
import { AttendanceService } from '../services/attendance';
import { AttendanceStore } from './attendance-store';

describe('AttendanceStore', () => {
  let store: InstanceType<typeof AttendanceStore>;
  let attendanceService: {
    findAll: Mock;
    findByEmployeeId: Mock;
    clockIn: Mock;
    clockOut: Mock;
  };
  let messageService: { add: Mock };
  let httpMock: HttpTestingController;

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

  const mockClockInData: ClockInData = {
    userId: 1,
  };

  const mockClockOutData: ClockOutData = {
    attendanceId: 1,
  };

  beforeEach(() => {
    attendanceService = {
      findAll: vi.fn().mockName('AttendanceService.findAll'),
      findByEmployeeId: vi.fn().mockName('AttendanceService.findByEmployeeId'),
      clockIn: vi.fn().mockName('AttendanceService.clockIn'),
      clockOut: vi.fn().mockName('AttendanceService.clockOut'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    attendanceService.findAll.mockReturnValue(of([mockAttendance]));
    attendanceService.findByEmployeeId.mockReturnValue(of([mockAttendance]));
    attendanceService.clockIn.mockReturnValue(of(mockAttendance));
    attendanceService.clockOut.mockReturnValue(of(mockAttendance));

    TestBed.configureTestingModule({
      providers: [
        AttendanceStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AttendanceService, useValue: attendanceService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(AttendanceStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should load attendances', () => {
      store.findAll();

      expect(attendanceService.findAll).toHaveBeenCalled();
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].id).toBe(mockAttendance.id);
      expect(store.loading()).toBe(false);
    });

    it('should handle error when findAll fails', () => {
      attendanceService.findAll.mockReturnValue(
        throwError(() => new Error('Error loading attendances')),
      );

      store.findAll();

      expect(store.error()).toBe('Error loading attendances');
    });
  });

  describe('findByEmployeeId', () => {
    it('should load attendances for an employee', () => {
      store.findByEmployeeId(1);

      expect(attendanceService.findByEmployeeId).toHaveBeenCalledWith(1);
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].userId).toBe(1);
      expect(store.loading()).toBe(false);
    });

    it('should handle error when findByEmployeeId fails', () => {
      attendanceService.findByEmployeeId.mockReturnValue(
        throwError(() => new Error('Error loading employee attendances')),
      );

      store.findByEmployeeId(1);

      expect(store.error()).toBe('Error loading employee attendances');
    });
  });

  describe('clockIn', () => {
    it('should clock in an employee', () => {
      store.clockIn(mockClockInData);

      expect(attendanceService.clockIn).toHaveBeenCalledWith(mockClockInData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Clock-in recorded',
        detail: 'The clock-in has been recorded successfully',
      });
      expect(store.clockInDialogVisible()).toBe(false);
    });

    it('should handle error when clocking in fails', () => {
      attendanceService.clockIn.mockReturnValue(
        throwError(() => new Error('Error clocking in')),
      );

      store.clockIn(mockClockInData);

      expect(store.error()).toBe('Error clocking in');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error recording clock-in',
      });
    });
  });

  describe('clockOut', () => {
    it('should clock out an employee', () => {
      store.clockOut(mockClockOutData);

      expect(attendanceService.clockOut).toHaveBeenCalledWith(mockClockOutData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Clock-out recorded',
        detail: 'The clock-out has been recorded successfully',
      });
    });

    it('should handle error when clocking out fails', () => {
      attendanceService.clockOut.mockReturnValue(
        throwError(() => new Error('Error clocking out')),
      );

      store.clockOut(mockClockOutData);

      expect(store.error()).toBe('Error clocking out');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error recording clock-out',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open clock in dialog', () => {
      store.openClockInDialog();
      expect(store.clockInDialogVisible()).toBe(true);
    });

    it('should close clock in dialog', () => {
      store.openClockInDialog();
      store.closeClockInDialog();
      expect(store.clockInDialogVisible()).toBe(false);
    });
  });
});

