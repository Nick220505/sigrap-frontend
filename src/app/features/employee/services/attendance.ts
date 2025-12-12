import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AttendanceInfo,
  ClockInData,
  ClockOutData,
} from '../models/attendance';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<AttendanceInfo[]> {
    return this.http.get<AttendanceInfo[]>('/attendance');
  }

  findById(id: number): Observable<AttendanceInfo> {
    return this.http.get<AttendanceInfo>(`/attendance/${id}`);
  }

  findByEmployeeId(employeeId: number): Observable<AttendanceInfo[]> {
    return this.http.get<AttendanceInfo[]>(
      `/attendance/employee/${employeeId}`,
    );
  }

  clockIn(clockInData: ClockInData): Observable<AttendanceInfo> {
    return this.http.post<AttendanceInfo>('/attendance/clock-in', clockInData);
  }

  clockOut(clockOutData: ClockOutData): Observable<AttendanceInfo> {
    return this.http.put<AttendanceInfo>('/attendance/clock-out', clockOutData);
  }
}
