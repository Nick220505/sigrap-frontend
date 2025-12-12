import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ScheduleData, ScheduleInfo } from '../models/schedule';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<ScheduleInfo[]> {
    return this.http.get<ScheduleInfo[]>('/schedules');
  }

  findById(id: number): Observable<ScheduleInfo> {
    return this.http.get<ScheduleInfo>(`/schedules/${id}`);
  }

  findByEmployeeId(employeeId: number): Observable<ScheduleInfo[]> {
    return this.http.get<ScheduleInfo[]>(`/schedules/employee/${employeeId}`);
  }

  create(scheduleData: ScheduleData): Observable<ScheduleInfo> {
    return this.http.post<ScheduleInfo>('/schedules', scheduleData);
  }

  update(id: number, scheduleData: ScheduleData): Observable<ScheduleInfo> {
    return this.http.put<ScheduleInfo>(`/schedules/${id}`, scheduleData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/schedules/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>('delete', '/schedules/delete-many', {
      body: ids,
    });
  }
}
