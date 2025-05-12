import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { PermissionData, PermissionInfo } from '../models/permission.model';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  private readonly http = inject(HttpClient);
  private readonly permissionsUrl = `${environment.apiUrl}/permissions`;

  findAll(): Observable<PermissionInfo[]> {
    return this.http.get<PermissionInfo[]>(this.permissionsUrl);
  }

  findById(id: number): Observable<PermissionInfo> {
    return this.http.get<PermissionInfo>(`${this.permissionsUrl}/${id}`);
  }

  findByResource(resource: string): Observable<PermissionInfo[]> {
    return this.http.get<PermissionInfo[]>(
      `${this.permissionsUrl}/resource/${resource}`,
    );
  }

  findByAction(action: string): Observable<PermissionInfo[]> {
    return this.http.get<PermissionInfo[]>(
      `${this.permissionsUrl}/action/${action}`,
    );
  }

  create(permissionData: PermissionData): Observable<PermissionInfo> {
    return this.http.post<PermissionInfo>(this.permissionsUrl, permissionData);
  }

  update(
    id: number,
    permissionData: Partial<PermissionData>,
  ): Observable<PermissionInfo> {
    return this.http.patch<PermissionInfo>(
      `${this.permissionsUrl}/${id}`,
      permissionData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.permissionsUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${this.permissionsUrl}`, { body: ids });
  }
}
