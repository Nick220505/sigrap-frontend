import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { AuditLogInfo } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly auditLogsUrl = `${environment.apiUrl}/audit-logs`;

  findAll(): Observable<AuditLogInfo[]> {
    return this.http.get<AuditLogInfo[]>(this.auditLogsUrl);
  }

  findById(id: number): Observable<AuditLogInfo> {
    return this.http.get<AuditLogInfo>(`${this.auditLogsUrl}/${id}`);
  }

  findByUserId(userId: number): Observable<AuditLogInfo[]> {
    return this.http.get<AuditLogInfo[]>(`${this.auditLogsUrl}/user/${userId}`);
  }

  findByEntityName(entityName: string): Observable<AuditLogInfo[]> {
    return this.http.get<AuditLogInfo[]>(
      `${this.auditLogsUrl}/entity/${entityName}`,
    );
  }

  findByAction(action: string): Observable<AuditLogInfo[]> {
    return this.http.get<AuditLogInfo[]>(
      `${this.auditLogsUrl}/action/${action}`,
    );
  }

  findByDateRange(
    startDate: string,
    endDate: string,
  ): Observable<AuditLogInfo[]> {
    return this.http.get<AuditLogInfo[]>(`${this.auditLogsUrl}/date-range`, {
      params: {
        startDate,
        endDate,
      },
    });
  }
}
