import { describe, expect, it, type Mock, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { AuditLogInfo } from '../models/audit-log';
import { AuditLogService, PageResponse } from '../services/audit-log';
import { AuditLogStore } from './audit-log-store';

describe('AuditLogStore', () => {
  let auditLogService: {
    findAll: Mock;
    findById: Mock;
    findByUsername: Mock;
    findByEntityName: Mock;
    findByAction: Mock;
    findByEntityId: Mock;
    findByEntityNameAndId: Mock;
    findByDateRange: Mock;
    findBySourceIp: Mock;
    findErrors: Mock;
    findByEntityAndDateRange: Mock;
  };
  let messageService: { add: Mock };

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

    auditLogService = {
      findAll: vi.fn().mockName('AuditLogService.findAll'),
      findById: vi.fn().mockName('AuditLogService.findById'),
      findByUsername: vi.fn().mockName('AuditLogService.findByUsername'),
      findByEntityName: vi.fn().mockName('AuditLogService.findByEntityName'),
      findByAction: vi.fn().mockName('AuditLogService.findByAction'),
      findByEntityId: vi.fn().mockName('AuditLogService.findByEntityId'),
      findByEntityNameAndId: vi
        .fn()
        .mockName('AuditLogService.findByEntityNameAndId'),
      findByDateRange: vi.fn().mockName('AuditLogService.findByDateRange'),
      findBySourceIp: vi.fn().mockName('AuditLogService.findBySourceIp'),
      findErrors: vi.fn().mockName('AuditLogService.findErrors'),
      findByEntityAndDateRange: vi
        .fn()
        .mockName('AuditLogService.findByEntityAndDateRange'),
    };
    messageService = {
      add: vi.fn().mockName('MessageService.add'),
    };

    auditLogService.findAll.mockReturnValue(findAllReturnValue);
    auditLogService.findByUsername.mockReturnValue(of(mockPageResponse));
    auditLogService.findByEntityName.mockReturnValue(of(mockPageResponse));
    auditLogService.findByAction.mockReturnValue(of(mockPageResponse));
    auditLogService.findByDateRange.mockReturnValue(of(mockPageResponse));
    auditLogService.findByEntityId.mockReturnValue(of(mockPageResponse));
    auditLogService.findByEntityNameAndId.mockReturnValue(of(mockPageResponse));
    auditLogService.findBySourceIp.mockReturnValue(of(mockPageResponse));
    auditLogService.findErrors.mockReturnValue(of(mockPageResponse));
    auditLogService.findByEntityAndDateRange.mockReturnValue(
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

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs fails', () => {
      const errorMessage = 'Failed to fetch audit logs';
      const errorStore = createStore(throwError(() => new Error(errorMessage)));

      errorStore.findAll({});

      expect(errorStore.loading()).toBe(false);
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error loading audit logs',
      });
    });
  });

  describe('findByUsername', () => {
    it('should update state with user audit logs', () => {
      const store = createStore();
      auditLogService.findByUsername.mockReturnValue(of(mockPageResponse));

      store.findByUsername({ username: 'admin' });

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by user fails', () => {
      const errorMessage = 'Failed to fetch user audit logs';
      const errorStore = createStore(of(emptyPageResponse));
      auditLogService.findByUsername.mockReturnValue(
        throwError(() => new Error(errorMessage)),
      );
      errorStore.findByUsername({ username: 'admin' });
      expect(errorStore.loading()).toBe(false);
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error loading user audit logs',
      });
    });
  });

  describe('findByEntityName', () => {
    it('should update state with entity audit logs', () => {
      const store = createStore();
      auditLogService.findByEntityName.mockReturnValue(of(mockPageResponse));

      store.findByEntityName({ entityName: 'User' });

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by entity fails', () => {
      const errorMessage = 'Failed to fetch entity audit logs';
      const errorStore = createStore(of(emptyPageResponse));
      auditLogService.findByEntityName.mockReturnValue(
        throwError(() => new Error(errorMessage)),
      );
      errorStore.findByEntityName({ entityName: 'User' });
      expect(errorStore.loading()).toBe(false);
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error loading entity audit logs',
      });
    });
  });

  describe('findByAction', () => {
    it('should update state with action audit logs', () => {
      const store = createStore();
      auditLogService.findByAction.mockReturnValue(of(mockPageResponse));

      store.findByAction({ action: 'UPDATE' });

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by action fails', () => {
      const errorMessage = 'Failed to fetch action audit logs';
      const errorStore = createStore(of(emptyPageResponse));
      auditLogService.findByAction.mockReturnValue(
        throwError(() => new Error(errorMessage)),
      );
      errorStore.findByAction({ action: 'UPDATE' });
      expect(errorStore.loading()).toBe(false);
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error loading audit logs by action',
      });
    });
  });

  describe('findByDateRange', () => {
    it('should update state with date range audit logs', () => {
      const store = createStore();
      auditLogService.findByDateRange.mockReturnValue(of(mockPageResponse));

      store.findByDateRange({
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      });

      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
      expect(store.entities()).toEqual(mockAuditLogs);
    });

    it('should handle error when finding audit logs by date range fails', () => {
      const errorMessage = 'Failed to fetch date range audit logs';
      const errorStore = createStore(of(emptyPageResponse));
      auditLogService.findByDateRange.mockReturnValue(
        throwError(() => new Error(errorMessage)),
      );
      errorStore.findByDateRange({
        startDate: '2023-01-01',
        endDate: '2023-01-31',
      });
      expect(errorStore.loading()).toBe(false);
      expect(errorStore.error()).toBe(errorMessage);
      expect(errorStore.entities()).toEqual([]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Error loading audit logs by date range',
      });
    });
  });

  describe('dialog operations', () => {
    it('should open dialog with selected audit log', () => {
      const store = createStore();
      store.openAuditLogDialog(mockAuditLogs[0]);
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedAuditLog()).toEqual(mockAuditLogs[0]);
    });

    it('should open dialog without audit log for creation', () => {
      const store = createStore();
      store.openAuditLogDialog();
      expect(store.dialogVisible()).toBe(true);
      expect(store.selectedAuditLog()).toBeNull();
    });

    it('should close dialog', () => {
      const store = createStore();
      store.openAuditLogDialog();
      store.closeAuditLogDialog();
      expect(store.dialogVisible()).toBe(false);
    });

    it('should clear selected audit log', () => {
      const store = createStore();
      store.openAuditLogDialog(mockAuditLogs[0]);
      store.clearSelectedAuditLog();
      expect(store.selectedAuditLog()).toBeNull();
    });
  });
});

