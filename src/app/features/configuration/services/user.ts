import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { UserData, UserInfo } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>('/users');
  }

  findById(id: number): Observable<UserInfo> {
    return this.http.get<UserInfo>(`/users/${id}`);
  }

  findByEmail(email: string): Observable<UserInfo> {
    return this.http.get<UserInfo>(`/users/email/${email}`);
  }

  create(userData: UserData): Observable<UserInfo> {
    return this.http.post<UserInfo>('/users', userData);
  }

  update(id: number, userData: Partial<UserData>): Observable<UserInfo> {
    return this.http.put<UserInfo>(`/users/${id}`, userData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/users/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.delete<void>('/users/delete-many', {
      body: ids,
    });
  }

  updateProfile(id: number, userData: Partial<UserData>): Observable<UserInfo> {
    return this.http.put<UserInfo>(`/users/${id}/profile`, userData);
  }

  changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Observable<UserInfo> {
    return this.http.put<UserInfo>(`/users/${id}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  resetPassword(token: string, newPassword: string): Observable<UserInfo> {
    return this.http.post<UserInfo>('/users/reset-password', {
      token,
      newPassword,
    });
  }

  lockAccount(id: number): Observable<UserInfo> {
    return this.http.put<UserInfo>(`/users/${id}/lock`, {});
  }

  unlockAccount(id: number): Observable<UserInfo> {
    return this.http.put<UserInfo>(`/users/${id}/unlock`, {});
  }
}
