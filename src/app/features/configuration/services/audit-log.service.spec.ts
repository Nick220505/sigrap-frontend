import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import { AuditLogInfo } from '../models/audit-log.model';
import { AuditLogService } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/audit-logs`;

  const mockAuditLog: AuditLogInfo = {
    id: 1,
    entityName: 'User',
    entityId: 1,
    action: 'UPDATE',
    username: 'admin',
    timestamp: new Date().toISOString(),
    oldValue: {},
    newValue: { id: 1, name: 'Test User' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuditLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('findAll', () => {
    it('should send a GET request to the audit logs endpoint', () => {
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
          entityId: 3,
          action: 'UPDATE',
          username: 'admin',
          timestamp: new Date().toISOString(),
          oldValue: { stock: 10 },
          newValue: { stock: 5 },
        },
      ];

      service.findAll().subscribe((response) => {
        expect(response).toEqual(mockAuditLogs);
      });

      const req = httpMock.expectOne(baseUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockAuditLogs);
    });
  });

  it('should find audit log by id', () => {
    service.findById(1).subscribe((auditLog) => {
      expect(auditLog).toEqual(mockAuditLog);
    });
    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLog);
  });

  it('should find audit logs by user id', () => {
    const userId = 1;
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];
    service.findByUserId(userId).subscribe((auditLogs) => {
      expect(auditLogs).toEqual(mockAuditLogs);
    });
    const req = httpMock.expectOne(`${baseUrl}/user/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLogs);
  });

  it('should find audit logs by entity name', () => {
    const entityName = 'User';
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];
    service.findByEntityName(entityName).subscribe((auditLogs) => {
      expect(auditLogs).toEqual(mockAuditLogs);
    });
    const req = httpMock.expectOne(`${baseUrl}/entity/${entityName}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLogs);
  });

  it('should find audit logs by action', () => {
    const action = 'UPDATE';
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];
    service.findByAction(action).subscribe((auditLogs) => {
      expect(auditLogs).toEqual(mockAuditLogs);
    });
    const req = httpMock.expectOne(`${baseUrl}/action/${action}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLogs);
  });

  it('should find audit logs by date range', () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-02';
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];
    service.findByDateRange(startDate, endDate).subscribe((auditLogs) => {
      expect(auditLogs).toEqual(mockAuditLogs);
    });
    const req = httpMock.expectOne(
      `${baseUrl}/date-range?startDate=${startDate}&endDate=${endDate}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLogs);
  });
});
