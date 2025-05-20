import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { AuditLogInfo } from '../models/audit-log.model';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/audit`;

  findAll(page = 0, size = 10): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(this.apiUrl, {
      params: {
        page: page.toString(),
        size: size.toString(),
      },
    });
  }

  findById(id: number): Observable<AuditLogInfo> {
    return this.http.get<AuditLogInfo>(`${this.apiUrl}/${id}`);
  }

  findByUsername(
    username: string,
    page = 0,
    size = 10,
  ): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(`${this.apiUrl}/by-user`, {
      params: {
        username,
        page: page.toString(),
        size: size.toString(),
      },
    });
  }

  findByEntityName(
    entityName: string,
    page = 0,
    size = 10,
  ): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(
      `${this.apiUrl}/by-entity`,
      {
        params: {
          entityName,
          page: page.toString(),
          size: size.toString(),
        },
      },
    );
  }

  findByAction(
    action: string,
    page = 0,
    size = 10,
  ): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(
      `${this.apiUrl}/by-action`,
      {
        params: {
          action,
          page: page.toString(),
          size: size.toString(),
        },
      },
    );
  }

  findByEntityId(
    entityId: string,
    page = 0,
    size = 10,
  ): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(
      `${this.apiUrl}/by-entity-id`,
      {
        params: {
          entityId,
          page: page.toString(),
          size: size.toString(),
        },
      },
    );
  }

  findByEntityNameAndId(
    entityName: string,
    entityId: string,
    page = 0,
    size = 10,
  ): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(
      `${this.apiUrl}/by-entity-and-id`,
      {
        params: {
          entityName,
          entityId,
          page: page.toString(),
          size: size.toString(),
        },
      },
    );
  }

  findByDateRange(
    startDate: string,
    endDate: string,
    page = 0,
    size = 10,
  ): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(
      `${this.apiUrl}/by-date-range`,
      {
        params: {
          startDate,
          endDate,
          page: page.toString(),
          size: size.toString(),
        },
      },
    );
  }

  findBySourceIp(
    sourceIp: string,
    page = 0,
    size = 10,
  ): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(`${this.apiUrl}/by-ip`, {
      params: {
        sourceIp,
        page: page.toString(),
        size: size.toString(),
      },
    });
  }

  findErrors(page = 0, size = 10): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(`${this.apiUrl}/errors`, {
      params: {
        page: page.toString(),
        size: size.toString(),
      },
    });
  }

  findByEntityAndDateRange(
    entityName: string,
    startDate: string,
    endDate: string,
    page = 0,
    size = 10,
  ): Observable<PageResponse<AuditLogInfo>> {
    return this.http.get<PageResponse<AuditLogInfo>>(
      `${this.apiUrl}/by-entity-and-date`,
      {
        params: {
          entityName,
          startDate,
          endDate,
          page: page.toString(),
          size: size.toString(),
        },
      },
    );
  }
}
