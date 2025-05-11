import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { PermissionInfo } from '../models/permission.model';

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
}
