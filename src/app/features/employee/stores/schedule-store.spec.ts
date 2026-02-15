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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { ScheduleData, ScheduleInfo } from '../models/schedule.model';
import { ScheduleService } from '../services/schedule';
import { ScheduleStore } from './schedule-store';

describe('ScheduleStore', () => {
  let store: InstanceType<typeof ScheduleStore>;
  let scheduleService: {
    findAll: Mock;
    findById: Mock;
    findByEmployeeId: Mock;
    create: Mock;
    update: Mock;
    delete: Mock;
    deleteAllById: Mock;
  };
  let messageService: { add: Mock };
  let httpMock: HttpTestingController;

  const mockSchedule: ScheduleInfo = {
    id: 1,
    userId: 1,
    userName: 'Test Employee',
    day: 'MONDAY',
    startTime: '09:00:00',
    endTime: '17:00:00',
    type: 'REGULAR',
    isActive: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  const mockScheduleData: ScheduleData = {
    userId: 1,
    day: 'MONDAY',
    startTime: '09:00:00',
    endTime: '17:00:00',
    type: 'REGULAR',
    isActive: true,
  };

  beforeEach(() => {
    scheduleService = {
      findAll: vi.fn().mockName('ScheduleService.findAll'),
      findById: vi.fn().mockName('ScheduleService.findById'),
      findByEmployeeId: vi.fn().mockName('ScheduleService.findByEmployeeId'),
      create: vi.fn().mockName('ScheduleService.create'),
      update: vi.fn().mockName('ScheduleService.update'),
      delete: vi.fn().mockName('ScheduleService.delete'),
      deleteAllById: vi.fn().mockName('ScheduleService.deleteAllById'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    scheduleService.findAll.mockReturnValue(of([mockSchedule]));
    scheduleService.findById.mockReturnValue(of(mockSchedule));
    scheduleService.findByEmployeeId.mockReturnValue(of([mockSchedule]));
    scheduleService.create.mockReturnValue(of(mockSchedule));
    scheduleService.update.mockReturnValue(of(mockSchedule));
    scheduleService.delete.mockReturnValue(of(void 0));
    scheduleService.deleteAllById.mockReturnValue(of(void 0));

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        ScheduleStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ScheduleService, useValue: scheduleService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(ScheduleStore);
    httpMock = TestBed.inject(HttpTestingController);
    
    const translateService = TestBed.inject(TranslateService);
    translateService.setDefaultLang('en');
    translateService.use('en');
    
    translateService.setTranslation('en', {
      messages: {
        success: {
          scheduleCreated: 'Schedule created',
          scheduleCreatedDetail: 'Schedule created successfully',
          scheduleUpdated: 'Schedule updated',
          scheduleUpdatedDetail: 'Schedule updated successfully',
          scheduleDeleted: 'Schedule deleted',
          scheduleDeletedDetail: 'Schedule deleted successfully',
          schedulesDeleted: 'Schedules deleted',
          schedulesDeletedDetail: 'Schedules deleted successfully',
        },
        errors: {
          error: 'Error',
          scheduleCreateError: 'Error creating schedule',
          scheduleUpdateError: 'Error updating schedule',
          scheduleDeleteError: 'Error deleting schedule',
          schedulesDeleteError: 'Error deleting schedules',
        },
      },
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should load schedules', () => {
      store.findAll();

      expect(scheduleService.findAll).toHaveBeenCalled();
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].id).toBe(mockSchedule.id);
      expect(store.loading()).toBe(false);
    });

    it('should handle error when findAll fails', () => {
      scheduleService.findAll.mockReturnValue(
        throwError(() => new Error('Error loading schedules')),
      );

      store.findAll();

      expect(store.error()).toBe('Error loading schedules');
    });
  });

  describe('findByEmployeeId', () => {
    it('should load schedules for an employee', () => {
      store.findByEmployeeId(1);

      expect(scheduleService.findByEmployeeId).toHaveBeenCalledWith(1);
      expect(store.entities().length).toBe(1);
      expect(store.entities()[0].userId).toBe(1);
      expect(store.loading()).toBe(false);
    });

    it('should handle error when findByEmployeeId fails', () => {
      scheduleService.findByEmployeeId.mockReturnValue(
        throwError(() => new Error('Error loading employee schedules')),
      );

      store.findByEmployeeId(1);

      expect(store.error()).toBe('Error loading employee schedules');
    });
  });

  describe('findById', () => {
    it('should load a schedule by id', () => {
      store.findById(1);

      expect(scheduleService.findById).toHaveBeenCalledWith(1);
      expect(store.selectedSchedule()).toEqual(mockSchedule);
      expect(store.loading()).toBe(false);
    });

    it('should handle error when findById fails', () => {
      scheduleService.findById.mockReturnValue(
        throwError(() => new Error('Error loading schedule')),
      );

      store.findById(1);

      expect(store.error()).toBe('Error loading schedule');
    });
  });

  describe('create', () => {
    it('should create a schedule', () => {
      store.create(mockScheduleData);

      expect(scheduleService.create).toHaveBeenCalledWith(mockScheduleData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Schedule created',
        detail: 'Schedule created successfully',
      });
      expect(store.dialogVisible()).toBe(false);
    });

    it('should handle error when creating schedule fails', () => {
      scheduleService.create.mockReturnValue(
        throwError(() => new Error('Error creating schedule')),
      );

      store.create(mockScheduleData);

      expect(store.error()).toBe('Error creating schedule');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error creating schedule',
      });
    });
  });

  describe('update', () => {
    it('should update a schedule', () => {
      store.update({ id: 1, scheduleData: mockScheduleData });

      expect(scheduleService.update).toHaveBeenCalledWith(1, mockScheduleData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Schedule updated',
        detail: 'Schedule updated successfully',
      });
      expect(store.dialogVisible()).toBe(false);
    });

    it('should handle error when updating schedule fails', () => {
      scheduleService.update.mockReturnValue(
        throwError(() => new Error('Error updating schedule')),
      );

      store.update({ id: 1, scheduleData: mockScheduleData });

      expect(store.error()).toBe('Error updating schedule');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error updating schedule',
      });
    });
  });

  describe('delete', () => {
    it('should delete a schedule', () => {
      store.delete(1);

      expect(scheduleService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Schedule deleted',
        detail: 'Schedule deleted successfully',
      });
    });

    it('should handle error when deleting schedule fails', () => {
      scheduleService.delete.mockReturnValue(
        throwError(() => new Error('Error deleting schedule')),
      );

      store.delete(1);

      expect(store.error()).toBe('Error deleting schedule');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error deleting schedule',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple schedules', () => {
      store.deleteAllById([1, 2]);

      expect(scheduleService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Schedules deleted',
        detail: 'Schedules deleted successfully',
      });
    });

    it('should handle error when deleting multiple schedules fails', () => {
      scheduleService.deleteAllById.mockReturnValue(
        throwError(() => new Error('Error deleting schedules')),
      );

      store.deleteAllById([1, 2]);

      expect(store.error()).toBe('Error deleting schedules');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error deleting schedules',
      });
    });
  });

  describe('computed properties', () => {
    it('should compute schedulesCount', () => {
      store.findAll();
      expect(store.schedulesCount()).toBe(1);
    });

    it('should compute schedulesGroupedByDay', () => {
      store.findAll();
      const grouped = store.schedulesGroupedByDay();
      expect(grouped['MONDAY'].length).toBe(1);
      expect(grouped['MONDAY'][0]).toBe(mockSchedule);
    });
  });

  describe('dialog operations', () => {
    it('should open schedule dialog', () => {
      store.openScheduleDialog(mockSchedule);

      expect(store.selectedSchedule()).toBe(mockSchedule);
      expect(store.dialogVisible()).toBe(true);
    });

    it('should open empty schedule dialog for creation', () => {
      store.openScheduleDialog();

      expect(store.selectedSchedule()).toBeNull();
      expect(store.dialogVisible()).toBe(true);
    });

    it('should close schedule dialog', () => {
      store.openScheduleDialog(mockSchedule);
      store.closeScheduleDialog();

      expect(store.dialogVisible()).toBe(false);
      expect(store.selectedSchedule()).toBeNull();
    });
  });
});
