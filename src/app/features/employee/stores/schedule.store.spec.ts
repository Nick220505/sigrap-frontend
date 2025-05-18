import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { ScheduleData, ScheduleInfo } from '../models/schedule.model';
import { ScheduleService } from '../services/schedule.service';
import { ScheduleStore } from './schedule.store';

describe('ScheduleStore', () => {
  let store: InstanceType<typeof ScheduleStore>;
  let scheduleService: jasmine.SpyObj<ScheduleService>;
  let messageService: jasmine.SpyObj<MessageService>;
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
    scheduleService = jasmine.createSpyObj('ScheduleService', [
      'findAll',
      'findById',
      'findByEmployeeId',
      'create',
      'update',
      'delete',
      'deleteAllById',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    scheduleService.findAll.and.returnValue(of([mockSchedule]));
    scheduleService.findById.and.returnValue(of(mockSchedule));
    scheduleService.findByEmployeeId.and.returnValue(of([mockSchedule]));
    scheduleService.create.and.returnValue(of(mockSchedule));
    scheduleService.update.and.returnValue(of(mockSchedule));
    scheduleService.delete.and.returnValue(of(void 0));
    scheduleService.deleteAllById.and.returnValue(of(void 0));

    TestBed.configureTestingModule({
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
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findAll fails', () => {
      scheduleService.findAll.and.returnValue(
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
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findByEmployeeId fails', () => {
      scheduleService.findByEmployeeId.and.returnValue(
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
      expect(store.loading()).toBeFalse();
    });

    it('should handle error when findById fails', () => {
      scheduleService.findById.and.returnValue(
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
        summary: 'Horario creado',
        detail: 'El horario ha sido creado correctamente',
      });
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should handle error when creating schedule fails', () => {
      scheduleService.create.and.returnValue(
        throwError(() => new Error('Error creating schedule')),
      );

      store.create(mockScheduleData);

      expect(store.error()).toBe('Error creating schedule');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al crear horario',
      });
    });
  });

  describe('update', () => {
    it('should update a schedule', () => {
      store.update({ id: 1, scheduleData: mockScheduleData });

      expect(scheduleService.update).toHaveBeenCalledWith(1, mockScheduleData);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Horario actualizado',
        detail: 'El horario ha sido actualizado correctamente',
      });
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should handle error when updating schedule fails', () => {
      scheduleService.update.and.returnValue(
        throwError(() => new Error('Error updating schedule')),
      );

      store.update({ id: 1, scheduleData: mockScheduleData });

      expect(store.error()).toBe('Error updating schedule');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al actualizar horario',
      });
    });
  });

  describe('delete', () => {
    it('should delete a schedule', () => {
      store.delete(1);

      expect(scheduleService.delete).toHaveBeenCalledWith(1);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Horario eliminado',
        detail: 'El horario ha sido eliminado correctamente',
      });
    });

    it('should handle error when deleting schedule fails', () => {
      scheduleService.delete.and.returnValue(
        throwError(() => new Error('Error deleting schedule')),
      );

      store.delete(1);

      expect(store.error()).toBe('Error deleting schedule');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar horario',
      });
    });
  });

  describe('deleteAllById', () => {
    it('should delete multiple schedules', () => {
      store.deleteAllById([1, 2]);

      expect(scheduleService.deleteAllById).toHaveBeenCalledWith([1, 2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Horarios eliminados',
        detail: 'Los horarios seleccionados han sido eliminados correctamente',
      });
    });

    it('should handle error when deleting multiple schedules fails', () => {
      scheduleService.deleteAllById.and.returnValue(
        throwError(() => new Error('Error deleting schedules')),
      );

      store.deleteAllById([1, 2]);

      expect(store.error()).toBe('Error deleting schedules');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al eliminar horarios',
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
      expect(store.dialogVisible()).toBeTrue();
    });

    it('should open empty schedule dialog for creation', () => {
      store.openScheduleDialog();

      expect(store.selectedSchedule()).toBeNull();
      expect(store.dialogVisible()).toBeTrue();
    });

    it('should close schedule dialog', () => {
      store.openScheduleDialog(mockSchedule);
      store.closeScheduleDialog();

      expect(store.dialogVisible()).toBeFalse();
      expect(store.selectedSchedule()).toBeNull();
    });
  });
});
