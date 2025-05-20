import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env';
import { AuditLogInfo } from '../models/audit-log.model';
import { AuditLogService, PageResponse } from './audit-log.service';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/audit`;

  const mockAuditLog: AuditLogInfo = {
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
          entityId: '3',
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
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        empty: false,
      };

      service.findAll().subscribe((response) => {
        expect(response).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
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

  it('should find audit logs by entity name', () => {
    const entityName = 'User';
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];

    const mockPageResponse: PageResponse<AuditLogInfo> = {
      content: mockAuditLogs,
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };

    service.findByEntityName(entityName).subscribe((response) => {
      expect(response).toEqual(mockPageResponse);
    });

    const req = httpMock.expectOne(
      `${baseUrl}/by-entity?entityName=${entityName}&page=0&size=10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPageResponse);
  });

  it('should find audit logs by action', () => {
    const action = 'UPDATE';
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];

    const mockPageResponse: PageResponse<AuditLogInfo> = {
      content: mockAuditLogs,
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };

    service.findByAction(action).subscribe((response) => {
      expect(response).toEqual(mockPageResponse);
    });

    const req = httpMock.expectOne(
      `${baseUrl}/by-action?action=${action}&page=0&size=10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPageResponse);
  });

  it('should find audit logs by date range', () => {
    const startDate = '2024-01-01';
    const endDate = '2024-01-02';
    const mockAuditLogs: AuditLogInfo[] = [mockAuditLog];

    const mockPageResponse: PageResponse<AuditLogInfo> = {
      content: mockAuditLogs,
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    };

    service.findByDateRange(startDate, endDate).subscribe((response) => {
      expect(response).toEqual(mockPageResponse);
    });

    const req = httpMock.expectOne(
      `${baseUrl}/by-date-range?startDate=${startDate}&endDate=${endDate}&page=0&size=10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPageResponse);
  });
});
