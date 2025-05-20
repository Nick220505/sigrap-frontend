import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AuditLogInfo } from '../models/audit-log.model';
import { AuditLogService, PageResponse } from '../services/audit-log.service';
import { AuditLogStore } from './audit-log.store';

describe('AuditLogStore', () => {
  let auditLogService: jasmine.SpyObj<AuditLogService>;
  let messageService: jasmine.SpyObj<MessageService>;

  const mockAuditLogs: AuditLogInfo[] = [
    {
      id: 1,
      entityName: 'User',
      entityId: '1',
      action: 'UPDATE',
      username: 'admin',
      timestamp: new Date().toISOString(),
      sourceIp: null,
      userAgent: null,
      details: null,
      status: 'SUCCESS',
      durationMs: null,
      oldValue: {},
      newValue: { id: 1, name: 'Test User' },
    },
    {
      id: 2,
      entityName: 'Product',
      entityId: '2',
      action: 'UPDATE',
      username: 'admin',
      timestamp: new Date().toISOString(),
      sourceIp: null,
      userAgent: null,
      details: null,
      status: 'SUCCESS',
      durationMs: null,
      oldValue: { stock: 10 },
      newValue: { stock: 5 },
    },
  ];

  const mockPageResponse: PageResponse<AuditLogInfo> = {
    content: mockAuditLogs,
    totalElements: mockAuditLogs.length,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  };

  const emptyPageResponse: PageResponse<AuditLogInfo> = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: true,
  };

  function createStore(findAllReturnValue = of(mockPageResponse)) {
    TestBed.resetTestingModule();

    auditLogService = jasmine.createSpyObj('AuditLogService', [
      'findAll',
      'findById',
      'findByUsername',
      'findByEntityName',
      'findByAction',
      'findByEntityId',
      'findByEntityNameAndId',
      'findByDateRange',
      'findBySourceIp',
      'findErrors',
      'findByEntityAndDateRange',
    ]);
    messageService = jasmine.createSpyObj('MessageService', ['add']);

    auditLogService.findAll.and.returnValue(findAllReturnValue);
    auditLogService.findByUsername.and.returnValue(of(mockPageResponse));
    auditLogService.findByEntityName.and.returnValue(of(mockPageResponse));
    auditLogService.findByAction.and.returnValue(of(mockPageResponse));
    auditLogService.findByDateRange.and.returnValue(of(mockPageResponse));
    auditLogService.findByEntityId.and.returnValue(of(mockPageResponse));
    auditLogService.findByEntityNameAndId.and.returnValue(of(mockPageResponse));
    auditLogService.findBySourceIp.and.returnValue(of(mockPageResponse));
    auditLogService.findErrors.and.returnValue(of(mockPageResponse));
    auditLogService.findByEntityAndDateRange.and.returnValue(
      of(mockPageResponse),
    );

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
      store.findAll({});

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs fails', () => {
      const errorMessage = 'Failed to fetch audit logs';
      const errorStore = createStore(throwError(() => new Error(errorMessage)));

      errorStore.findAll({});

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

  describe('findByUsername', () => {
    it('should update state with user audit logs', () => {
      const store = createStore();
      auditLogService.findByUsername.and.returnValue(of(mockPageResponse));

      store.findByUsername({ username: 'admin' });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by user fails', () => {
      const errorMessage = 'Failed to fetch user audit logs';

      // Create a store with empty initial state
      const errorStore = createStore(of(emptyPageResponse));

      // Set up the error for findByUsername
      auditLogService.findByUsername.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      // Call the method that should handle the error
      errorStore.findByUsername({ username: 'admin' });

      // Verify error handling
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
      auditLogService.findByEntityName.and.returnValue(of(mockPageResponse));

      store.findByEntityName({ entityName: 'User' });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by entity fails', () => {
      const errorMessage = 'Failed to fetch entity audit logs';

      // Create a store with empty initial state
      const errorStore = createStore(of(emptyPageResponse));

      // Set up the error for findByEntityName
      auditLogService.findByEntityName.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      // Call the method that should handle the error
      errorStore.findByEntityName({ entityName: 'User' });

      // Verify error handling
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
      auditLogService.findByAction.and.returnValue(of(mockPageResponse));

      store.findByAction({ action: 'UPDATE' });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by action fails', () => {
      const errorMessage = 'Failed to fetch action audit logs';

      // Create a store with empty initial state
      const errorStore = createStore(of(emptyPageResponse));

      // Set up the error for findByAction
      auditLogService.findByAction.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      // Call the method that should handle the error
      errorStore.findByAction({ action: 'UPDATE' });

      // Verify error handling
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
      auditLogService.findByDateRange.and.returnValue(of(mockPageResponse));

      store.findByDateRange({
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      });

      expect(store.loading()).toBeFalse();
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by date range fails', () => {
      const errorMessage = 'Failed to fetch date range audit logs';

      // Create a store with empty initial state
      const errorStore = createStore(of(emptyPageResponse));

      // Set up the error for findByDateRange
      auditLogService.findByDateRange.and.returnValue(
        throwError(() => new Error(errorMessage)),
      );

      // Call the method that should handle the error
      errorStore.findByDateRange({
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      });

      // Verify error handling
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
