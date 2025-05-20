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
} from '../models/attendance.model';
import { AttendanceService } from '../services/attendance.service';
import { AttendanceStore } from './attendance.store';

describe('AttendanceStore', () => {
  let store: InstanceType<typeof AttendanceStore>;
  let attendanceService: jasmine.SpyObj<AttendanceService>;
  let messageService: jasmine.SpyObj<MessageService>;
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
    attendanceService = jasmine.createSpyObj('AttendanceService', [
      'findAll',
      'findByEmployeeId',
      'clockIn',
      'clockOut',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    attendanceService.findAll.and.returnValue(of([mockAttendance]));
    attendanceService.findByEmployeeId.and.returnValue(of([mockAttendance]));
    attendanceService.clockIn.and.returnValue(of(mockAttendance));
    attendanceService.clockOut.and.returnValue(of(mockAttendance));

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
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findAll fails', () => {
      attendanceService.findAll.and.returnValue(
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
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findByEmployeeId fails', () => {
      attendanceService.findByEmployeeId.and.returnValue(
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
        summary: 'Entrada registrada',
        detail: 'La entrada ha sido registrada correctamente',
      });
      expect(store.clockInDialogVisible()).toBeFalse();
    });

    it('should handle error when clocking in fails', () => {
      attendanceService.clockIn.and.returnValue(
        throwError(() => new Error('Error clocking in')),
      );

      store.clockIn(mockClockInData);

      expect(store.error()).toBe('Error clocking in');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al registrar entrada',
      });
    });
  });

  describe('clockOut', () => {
    it('should clock out an employee', () => {
      store.clockOut(mockClockOutData);

      expect(attendanceService.clockOut).toHaveBeenCalledWith(mockClockOutData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Salida registrada',
        detail: 'La salida ha sido registrada correctamente',
      });
    });

    it('should handle error when clocking out fails', () => {
      attendanceService.clockOut.and.returnValue(
        throwError(() => new Error('Error clocking out')),
      );

      store.clockOut(mockClockOutData);

      expect(store.error()).toBe('Error clocking out');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al registrar salida',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open clock in dialog', () => {
      store.openClockInDialog();
      expect(store.clockInDialogVisible()).toBeTrue();
    });

    it('should close clock in dialog', () => {
      store.openClockInDialog();
      store.closeClockInDialog();
      expect(store.clockInDialogVisible()).toBeFalse();
    });
  });
});
