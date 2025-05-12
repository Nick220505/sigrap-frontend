import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { ScheduleData, ScheduleInfo } from '../models/schedule.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly schedulesUrl = `${environment.apiUrl}/schedules`;

  findAll(): Observable<ScheduleInfo[]> {
    return this.http.get<ScheduleInfo[]>(this.schedulesUrl);
  }

  findById(id: number): Observable<ScheduleInfo> {
    return this.http.get<ScheduleInfo>(`${this.schedulesUrl}/${id}`);
  }

  findByEmployeeId(employeeId: number): Observable<ScheduleInfo[]> {
    return this.http.get<ScheduleInfo[]>(
      `${this.schedulesUrl}/employee/${employeeId}`,
    );
  }

  create(scheduleData: ScheduleData): Observable<ScheduleInfo> {
    return this.http.post<ScheduleInfo>(this.schedulesUrl, scheduleData);
  }

  update(id: number, scheduleData: ScheduleData): Observable<ScheduleInfo> {
    return this.http.put<ScheduleInfo>(
      `${this.schedulesUrl}/${id}`,
      scheduleData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.schedulesUrl}/${id}`);
  }
}
