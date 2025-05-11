import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PermissionData, PermissionInfo } from '../models/permission.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly baseUrl = '/api/permissions';

  constructor(private readonly http: HttpClient) {}

  findAll(): Observable<PermissionInfo[]> {
    return this.http.get<PermissionInfo[]>(this.baseUrl);
  }

  findById(id: number): Observable<PermissionInfo> {
    return this.http.get<PermissionInfo>(`${this.baseUrl}/${id}`);
  }

  findByResource(resource: string): Observable<PermissionInfo[]> {
    return this.http.get<PermissionInfo[]>(
      `${this.baseUrl}/resource/${resource}`,
    );
  }

  findByAction(action: string): Observable<PermissionInfo[]> {
    return this.http.get<PermissionInfo[]>(`${this.baseUrl}/action/${action}`);
  }

  create(permissionData: PermissionData): Observable<PermissionInfo> {
    return this.http.post<PermissionInfo>(this.baseUrl, permissionData);
  }

  update(
    id: number,
    permissionData: Partial<PermissionData>,
  ): Observable<PermissionInfo> {
    return this.http.patch<PermissionInfo>(
      `${this.baseUrl}/${id}`,
      permissionData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}`, { body: ids });
  }
}
