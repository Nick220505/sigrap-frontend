import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { EmployeeData, EmployeeInfo } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly employeesUrl = `${environment.apiUrl}/employees`;

  findAll(): Observable<EmployeeInfo[]> {
    return this.http.get<EmployeeInfo[]>(this.employeesUrl);
  }

  findById(id: number): Observable<EmployeeInfo> {
    return this.http.get<EmployeeInfo>(`${this.employeesUrl}/${id}`);
  }

  create(employeeData: EmployeeData): Observable<EmployeeInfo> {
    return this.http.post<EmployeeInfo>(this.employeesUrl, employeeData);
  }

  update(id: number, employeeData: EmployeeData): Observable<EmployeeInfo> {
    return this.http.put<EmployeeInfo>(
      `${this.employeesUrl}/${id}`,
      employeeData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.employeesUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>(
      'delete',
      `${this.employeesUrl}/delete-many`,
      { body: ids },
    );
  }
}
