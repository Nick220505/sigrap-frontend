import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AuditLogInfo } from '../models/audit-log.model';
import { AuditLogService } from '../services/audit-log.service';
import { AuditLogStore } from './audit-log.store';

describe('AuditLogStore', () => {
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

  function createStore(findAllReturnValue = of(mockAuditLogs)) {
    TestBed.resetTestingModule();

    auditLogService = jasmine.createSpyObj('AuditLogService', [
      'findAll',
      'findById',
      'findByUserId',
      'findByEntityName',
      'findByAction',
      'findByDateRange',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    auditLogService.findAll.and.returnValue(findAllReturnValue);

    auditLogService.findByUserId.and.returnValue(of(mockAuditLogs));
    auditLogService.findByEntityName.and.returnValue(of(mockAuditLogs));
    auditLogService.findByAction.and.returnValue(of(mockAuditLogs));
    auditLogService.findByDateRange.and.returnValue(of(mockAuditLogs));

    TestBed.configureTestingModule({
      providers: [
        AuditLogStore,
        { provide: AuditLogService, useValue: auditLogService },
        { provide: MessageService, useValue: messageService },
      ],
    });

    return TestBed.inject(AuditLogStore);
  }

  it('should be created', () => {
    const store = createStore();
    expect(store).toBeTruthy();
  });

  describe('findAll', () => {
    it('should update state with audit logs', () => {
      const store = createStore();
      store.findAll();

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs fails', () => {
      const errorMessage = 'Failed to fetch audit logs';
      const errorStore = createStore(throwError(() => new Error(errorMessage)));

      errorStore.findAll();

      expect(errorStore.loading()).toBeFalse();
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría',
      });
    });
  });

  describe('findByUserId', () => {
    it('should update state with user audit logs', () => {
      const store = createStore();
      auditLogService.findByUserId.and.returnValue(of(mockAuditLogs));

      store.findByUserId(1);

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by user fails', () => {
      const errorMessage = 'Failed to fetch user audit logs';

      const errorStore = createStore(of([]));
      auditLogService.findByUserId.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      errorStore.findByUserId(1);

      expect(errorStore.loading()).toBeFalse();
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría del usuario',
      });
    });
  });

  describe('findByEntityName', () => {
    it('should update state with entity audit logs', () => {
      const store = createStore();
      auditLogService.findByEntityName.and.returnValue(of(mockAuditLogs));

      store.findByEntityName('User');

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by entity fails', () => {
      const errorMessage = 'Failed to fetch entity audit logs';

      const errorStore = createStore(of([]));
      auditLogService.findByEntityName.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      errorStore.findByEntityName('User');

      expect(errorStore.loading()).toBeFalse();
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría de la entidad',
      });
    });
  });

  describe('findByAction', () => {
    it('should update state with action audit logs', () => {
      const store = createStore();
      auditLogService.findByAction.and.returnValue(of(mockAuditLogs));

      store.findByAction('UPDATE');

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by action fails', () => {
      const errorMessage = 'Failed to fetch action audit logs';

      const errorStore = createStore(of([]));
      auditLogService.findByAction.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      errorStore.findByAction('UPDATE');

      expect(errorStore.loading()).toBeFalse();
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría por acción',
      });
    });
  });

  describe('findByDateRange', () => {
    it('should update state with date range audit logs', () => {
      const store = createStore();
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

      const errorStore = createStore(of([]));
      auditLogService.findByDateRange.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      const startDate = new Date().toISOString();
      const endDate = new Date().toISOString();
      errorStore.findByDateRange({ startDate, endDate });

      expect(errorStore.loading()).toBeFalse();
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al cargar registros de auditoría por rango de fechas',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open dialog with selected audit log', () => {
      const store = createStore();
      store.openAuditLogDialog(mockAuditLogs[0]);
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedAuditLog()).toEqual(mockAuditLogs[0]);
    });

    it('should open dialog without audit log for creation', () => {
      const store = createStore();
      store.openAuditLogDialog();
      expect(store.dialogVisible()).toBeTrue();
      expect(store.selectedAuditLog()).toBeNull();
    });

    it('should close dialog', () => {
      const store = createStore();
      store.openAuditLogDialog();
      store.closeAuditLogDialog();
      expect(store.dialogVisible()).toBeFalse();
    });

    it('should clear selected audit log', () => {
      const store = createStore();
      store.openAuditLogDialog(mockAuditLogs[0]);
      store.clearSelectedAuditLog();
      expect(store.selectedAuditLog()).toBeNull();
    });
  });
});
