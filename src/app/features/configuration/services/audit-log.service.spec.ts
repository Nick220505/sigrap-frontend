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
  const apiUrl = `${environment.apiUrl}/audit-logs`;

  const mockAuditLog: AuditLogInfo = {
    id: 1,
    userId: 1,
    username: 'testuser',
    action: 'CREATE',
    entityName: 'User',
    entityId: '1',
    oldValue: undefined,
    newValue: '{"id": 1, "name": "Test User"}',
    timestamp: '2024-01-01T00:00:00Z',
    ipAddress: '127.0.0.1',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuditLogService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
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

  it('should find all audit logs', () => {
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];
    service.findAll().subscribe((auditLogs) => {
      expect(auditLogs).toEqual(mockAuditLogs);
    });
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLogs);
  });

  it('should find audit log by id', () => {
    service.findById(1).subscribe((auditLog) => {
      expect(auditLog).toEqual(mockAuditLog);
    });
    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLog);
  });

  it('should find audit logs by user id', () => {
    const userId = 1;
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];
    service.findByUserId(userId).subscribe((auditLogs) => {
      expect(auditLogs).toEqual(mockAuditLogs);
    });
    const req = httpMock.expectOne(`${apiUrl}/user/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLogs);
  });

  it('should find audit logs by entity name', () => {
    const entityName = 'User';
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];
    service.findByEntityName(entityName).subscribe((auditLogs) => {
      expect(auditLogs).toEqual(mockAuditLogs);
    });
    const req = httpMock.expectOne(`${apiUrl}/entity/${entityName}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLogs);
  });

  it('should find audit logs by action', () => {
    const action = 'CREATE';
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];
    service.findByAction(action).subscribe((auditLogs) => {
      expect(auditLogs).toEqual(mockAuditLogs);
    });
    const req = httpMock.expectOne(`${apiUrl}/action/${action}`);
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
      `${apiUrl}/date-range?startDate=${startDate}&endDate=${endDate}`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockAuditLogs);
  });
});
