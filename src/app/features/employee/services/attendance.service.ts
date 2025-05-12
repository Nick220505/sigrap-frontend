import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import {
  AttendanceInfo,
  ClockInData,
  ClockOutData,
} from '../models/attendance.model';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly attendanceUrl = `${environment.apiUrl}/attendance`;

  findAll(): Observable<AttendanceInfo[]> {
    return this.http.get<AttendanceInfo[]>(this.attendanceUrl);
  }

  findById(id: number): Observable<AttendanceInfo> {
    return this.http.get<AttendanceInfo>(`${this.attendanceUrl}/${id}`);
  }

  findByEmployeeId(employeeId: number): Observable<AttendanceInfo[]> {
    return this.http.get<AttendanceInfo[]>(
      `${this.attendanceUrl}/employee/${employeeId}`,
    );
  }

  clockIn(clockInData: ClockInData): Observable<AttendanceInfo> {
    return this.http.post<AttendanceInfo>(
      `${this.attendanceUrl}/clock-in`,
      clockInData,
    );
  }

  clockOut(clockOutData: ClockOutData): Observable<AttendanceInfo> {
    return this.http.put<AttendanceInfo>(
      `${this.attendanceUrl}/clock-out`,
      clockOutData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.attendanceUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.attendanceUrl}/delete-many`,
      {
        body: ids,
      },
    );
  }
}
