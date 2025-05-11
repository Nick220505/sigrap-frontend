import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { RoleData, RoleInfo } from '../models/role.model';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private readonly http = inject(HttpClient);
  private readonly rolesUrl = `${environment.apiUrl}/roles`;

  findAll(): Observable<RoleInfo[]> {
    return this.http.get<RoleInfo[]>(this.rolesUrl);
  }

  findById(id: number): Observable<RoleInfo> {
    return this.http.get<RoleInfo>(`${this.rolesUrl}/${id}`);
  }

  create(roleData: RoleData): Observable<RoleInfo> {
    return this.http.post<RoleInfo>(this.rolesUrl, roleData);
  }

  update(id: number, roleData: Partial<RoleData>): Observable<RoleInfo> {
    return this.http.put<RoleInfo>(`${this.rolesUrl}/${id}`, roleData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.rolesUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.request<void>('delete', `${this.rolesUrl}/delete-many`, {
      body: ids,
    });
  }

  assignToUser(roleId: number, userId: number): Observable<RoleInfo> {
    return this.http.post<RoleInfo>(
      `${this.rolesUrl}/${roleId}/users/${userId}`,
      {},
    );
  }

  removeFromUser(roleId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.rolesUrl}/${roleId}/users/${userId}`);
  }
}
