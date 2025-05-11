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

  const mockAuditLogs: AuditLogInfo[] = [
    {
      id: 1,
      entityName: 'User',
      entityId: 1,
      action: 'UPDATE',
      username: 'admin',
      timestamp: new Date().toISOString(),
      oldValue: {},
      newValue: { id: 1, name: 'Test User' },
    },
    {
      id: 2,
      entityName: 'Product',
      entityId: 2,
      action: 'UPDATE',
      username: 'admin',
      timestamp: new Date().toISOString(),
      oldValue: { stock: 10 },
      newValue: { stock: 5 },
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

    TestBed.configureTestingModule({
      providers: [
        AuditLogStore,
        { provide: AuditLogService, useValue: auditLogService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    store = TestBed.inject(AuditLogStore);
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should update state with audit logs', () => {
      auditLogService.findAll.and.returnValue(of(mockAuditLogs));

      store.findAll();

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs fails', () => {
      const errorMessage = 'Failed to fetch audit logs';
      auditLogService.findAll.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      store.findAll();

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe(errorMessage);
      expect(store.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría',
      });
    });
  });

  describe('findByUserId', () => {
    it('should update state with user audit logs', () => {
      auditLogService.findByUserId.and.returnValue(of(mockAuditLogs));

      store.findByUserId(1);

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by user fails', () => {
      const errorMessage = 'Failed to fetch user audit logs';
      auditLogService.findByUserId.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      store.findByUserId(1);

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe(errorMessage);
      expect(store.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría del usuario',
      });
    });
  });

  describe('findByEntityName', () => {
    it('should update state with entity audit logs', () => {
      auditLogService.findByEntityName.and.returnValue(of(mockAuditLogs));

      store.findByEntityName('User');

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by entity fails', () => {
      const errorMessage = 'Failed to fetch entity audit logs';
      auditLogService.findByEntityName.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      store.findByEntityName('User');

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe(errorMessage);
      expect(store.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría de la entidad',
      });
    });
  });

  describe('findByAction', () => {
    it('should update state with action audit logs', () => {
      auditLogService.findByAction.and.returnValue(of(mockAuditLogs));

      store.findByAction('UPDATE');

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by action fails', () => {
      const errorMessage = 'Failed to fetch action audit logs';
      auditLogService.findByAction.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      store.findByAction('UPDATE');

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe(errorMessage);
      expect(store.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría por acción',
      });
    });
  });

  describe('findByDateRange', () => {
    it('should update state with date range audit logs', () => {
      auditLogService.findByDateRange.and.returnValue(of(mockAuditLogs));

      const startDate = new Date().toISOString();
      const endDate = new Date().toISOString();
      store.findByDateRange({ startDate, endDate });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by date range fails', () => {
      const errorMessage = 'Failed to fetch date range audit logs';
      auditLogService.findByDateRange.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      const startDate = new Date().toISOString();
      const endDate = new Date().toISOString();
      store.findByDateRange({ startDate, endDate });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBe(errorMessage);
      expect(store.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría por rango de fechas',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open dialog with selected audit log', () => {
      store.openAuditLogDialog(mockAuditLogs[0]);
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedAuditLog()).toEqual(mockAuditLogs[0]);
    });

    it('should open dialog without audit log for creation', () => {
      store.openAuditLogDialog();
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedAuditLog()).toBeNull();
    });

    it('should close dialog', () => {
      store.openAuditLogDialog();
      store.closeAuditLogDialog();
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should clear selected audit log', () => {
      store.openAuditLogDialog(mockAuditLogs[0]);
      store.clearSelectedAuditLog();
      expect(store.selectedAuditLog()).toBeNull();
    });
  });
});
