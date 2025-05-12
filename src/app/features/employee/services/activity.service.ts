import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { ActivityData, ActivityInfo } from '../models/activity.model';
import { AttendanceData, AttendanceInfo } from '../models/attendance.model';

@Injectable({
  providedIn: 'root',
})
export class ActivityService {
  private readonly http = inject(HttpClient);
  private readonly activitiesUrl = `${environment.apiUrl}/employee-activities`;
  private readonly attendanceUrl = `${environment.apiUrl}/employee-attendance`;

  findAll(): Observable<ActivityInfo[]> {
    return this.http.get<ActivityInfo[]>(this.activitiesUrl);
  }

  findByEmployeeId(employeeId: number): Observable<ActivityInfo[]> {
    return this.http.get<ActivityInfo[]>(
      `${this.activitiesUrl}/employee/${employeeId}`,
    );
  }

  create(activityData: ActivityData): Observable<ActivityInfo> {
    return this.http.post<ActivityInfo>(this.activitiesUrl, activityData);
  }

  findAllAttendance(): Observable<AttendanceInfo[]> {
    return this.http.get<AttendanceInfo[]>(this.attendanceUrl);
  }

  findAttendanceByEmployeeId(employeeId: number): Observable<AttendanceInfo[]> {
    return this.http.get<AttendanceInfo[]>(
      `${this.attendanceUrl}/employee/${employeeId}`,
    );
  }

  findAttendanceById(id: number): Observable<AttendanceInfo> {
    return this.http.get<AttendanceInfo>(`${this.attendanceUrl}/${id}`);
  }

  clockIn(attendanceData: AttendanceData): Observable<AttendanceInfo> {
    return this.http.post<AttendanceInfo>(
      `${this.attendanceUrl}/clock-in`,
      attendanceData,
    );
  }

  clockOut(
    id: number,
    attendanceData: AttendanceData,
  ): Observable<AttendanceInfo> {
    return this.http.put<AttendanceInfo>(
      `${this.attendanceUrl}/${id}/clock-out`,
      attendanceData,
    );
  }
}
