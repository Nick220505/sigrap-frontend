import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { PerformanceData, PerformanceInfo } from '../models/performance.model';

@Injectable({
  providedIn: 'root',
})
export class PerformanceService {
  private readonly http = inject(HttpClient);
  private readonly performanceUrl = `${environment.apiUrl}/employee-performance`;

  findAll(): Observable<PerformanceInfo[]> {
    return this.http.get<PerformanceInfo[]>(this.performanceUrl);
  }

  findById(id: number): Observable<PerformanceInfo> {
    return this.http.get<PerformanceInfo>(`${this.performanceUrl}/${id}`);
  }

  findByEmployeeId(employeeId: number): Observable<PerformanceInfo[]> {
    return this.http.get<PerformanceInfo[]>(
      `${this.performanceUrl}/employee/${employeeId}`,
    );
  }

  create(performanceData: PerformanceData): Observable<PerformanceInfo> {
    return this.http.post<PerformanceInfo>(
      this.performanceUrl,
      performanceData,
    );
  }

  update(
    id: number,
    performanceData: PerformanceData,
  ): Observable<PerformanceInfo> {
    return this.http.put<PerformanceInfo>(
      `${this.performanceUrl}/${id}`,
      performanceData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.performanceUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.performanceUrl}/delete-many`,
      { body: ids },
    );
  }
}
