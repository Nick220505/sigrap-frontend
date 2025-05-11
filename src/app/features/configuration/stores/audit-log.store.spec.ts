import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AuditLogInfo } from '../models/audit-log.model';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLogStore } from './audit-log.store';

describe('AuditLogStore', () => {
  let store: InstanceType<typeof AuditLogStore>;
  let auditLogService: jasmine.SpyObj<AuditLogService>;
  let messageService: jasmine.SpyObj<MessageService>;
  let httpMock: HttpTestingController;

  const mockAuditLogs: AuditLogInfo[] = [
    {
      id: 1,
      userId: 1,
      username: 'test@example.com',
      action: 'CREATE',
      entityName: 'USER',
      entityId: '2',
      oldValue: undefined,
      newValue: '{"name": "John Doe", "email": "john@example.com"}',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    },
    {
      id: 2,
      userId: 1,
      username: 'test@example.com',
      action: 'UPDATE',
      entityName: 'PRODUCT',
      entityId: '3',
      oldValue: '{"stock": 10}',
      newValue: '{"stock": 5}',
      timestamp: new Date().toISOString(),
      ipAddress: '127.0.0.1',
    },
  ];

  beforeEach(() => {
    auditLogService = jasmine.createSpyObj('AuditLogService', [
      'findAll',
      'findById',
      'findByUserId',
      'findByEntityName',
      'findByAction',
      'findByDateRange',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    auditLogService.findAll.and.returnValue(of(mockAuditLogs));
    auditLogService.findById.and.returnValue(of(mockAuditLogs[0]));
    auditLogService.findByUserId.and.returnValue(of(mockAuditLogs));
    auditLogService.findByEntityName.and.returnValue(of(mockAuditLogs));
    auditLogService.findByAction.and.returnValue(of(mockAuditLogs));
    auditLogService.findByDateRange.and.returnValue(of(mockAuditLogs));

    TestBed.configureTestingModule({
      providers: [
        AuditLogStore,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuditLogService, useValue: auditLogService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(AuditLogStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should call the service method and set entities', () => {
      expect(auditLogService.findAll).toHaveBeenCalled();
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findAll fails', () => {
      auditLogService.findAll.calls.reset();
      const testError = new Error('Failed to fetch audit logs');
      auditLogService.findAll.and.returnValue(throwError(() => testError));
      store.findAll();
      expect(store.error()).toBe('Failed to fetch audit logs');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría',
      });
    });
  });

  describe('findByUserId', () => {
    it('should call the service method and set entities', () => {
      store.findByUserId(1);

      expect(auditLogService.findByUserId).toHaveBeenCalledWith(1);
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findByUserId fails', () => {
      auditLogService.findByUserId.calls.reset();
      const testError = new Error('Failed to fetch user audit logs');
      auditLogService.findByUserId.and.returnValue(throwError(() => testError));
      store.findByUserId(1);
      expect(store.error()).toBe('Failed to fetch user audit logs');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría del usuario',
      });
    });
  });

  describe('findByEntityName', () => {
    it('should call the service method and set entities', () => {
      store.findByEntityName('USER');

      expect(auditLogService.findByEntityName).toHaveBeenCalledWith('USER');
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findByEntityName fails', () => {
      auditLogService.findByEntityName.calls.reset();
      const testError = new Error('Failed to fetch entity audit logs');
      auditLogService.findByEntityName.and.returnValue(
        throwError(() => testError),
      );
      store.findByEntityName('USER');
      expect(store.error()).toBe('Failed to fetch entity audit logs');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría de la entidad',
      });
    });
  });

  describe('findByAction', () => {
    it('should call the service method and set entities', () => {
      store.findByAction('CREATE');

      expect(auditLogService.findByAction).toHaveBeenCalledWith('CREATE');
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findByAction fails', () => {
      auditLogService.findByAction.calls.reset();
      const testError = new Error('Failed to fetch action audit logs');
      auditLogService.findByAction.and.returnValue(throwError(() => testError));
      store.findByAction('CREATE');
      expect(store.error()).toBe('Failed to fetch action audit logs');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría por acción',
      });
    });
  });

  describe('findByDateRange', () => {
    it('should call the service method and set entities', () => {
      const startDate = new Date().toISOString();
      const endDate = new Date().toISOString();
      store.findByDateRange({ startDate, endDate });

      expect(auditLogService.findByDateRange).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
      expect(store.loading()).toBeFalse();
    });

    it('should update error state when findByDateRange fails', () => {
      auditLogService.findByDateRange.calls.reset();
      const testError = new Error('Failed to fetch date range audit logs');
      auditLogService.findByDateRange.and.returnValue(
        throwError(() => testError),
      );
      const startDate = new Date().toISOString();
      const endDate = new Date().toISOString();
      store.findByDateRange({ startDate, endDate });
      expect(store.error()).toBe('Failed to fetch date range audit logs');
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría por rango de fechas',
      });
    });
  });
});
