import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { ActivityData, ActivityInfo } from '../models/activity-log.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  private readonly http = inject(HttpClient);
  private readonly activityLogUrl = `${environment.apiUrl}/activity-logs`;

  findAll(): Observable<ActivityInfo[]> {
    return this.http.get<ActivityInfo[]>(this.activityLogUrl);
  }

  findById(id: number): Observable<ActivityInfo> {
    return this.http.get<ActivityInfo>(`${this.activityLogUrl}/${id}`);
  }

  findByEmployeeId(employeeId: number): Observable<ActivityInfo[]> {
    return this.http.get<ActivityInfo[]>(
      `${this.activityLogUrl}/employee/${employeeId}`,
    );
  }

  create(activityData: ActivityData): Observable<ActivityInfo> {
    return this.http.post<ActivityInfo>(this.activityLogUrl, activityData);
  }

  update(id: number, activityData: ActivityData): Observable<ActivityInfo> {
    return this.http.put<ActivityInfo>(
      `${this.activityLogUrl}/${id}`,
      activityData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.activityLogUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.activityLogUrl}/delete-many`,
      {
        body: ids,
      },
    );
  }
}
