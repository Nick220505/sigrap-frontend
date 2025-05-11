import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import { UserData, UserInfo } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/users`;

  findAll(): Observable<UserInfo[]> {
    return this.http.get<UserInfo[]>(this.usersUrl);
  }

  findById(id: number): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.usersUrl}/${id}`);
  }

  findByEmail(email: string): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.usersUrl}/email/${email}`);
  }

  create(userData: UserData): Observable<UserInfo> {
    return this.http.post<UserInfo>(this.usersUrl, userData);
  }

  update(id: number, userData: Partial<UserData>): Observable<UserInfo> {
    return this.http.put<UserInfo>(`${this.usersUrl}/${id}`, userData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }

  deleteAllById(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/delete-many`, {
      body: ids,
    });
  }

  updateProfile(id: number, userData: Partial<UserData>): Observable<UserInfo> {
    return this.http.put<UserInfo>(`${this.usersUrl}/${id}/profile`, userData);
  }

  changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Observable<UserInfo> {
    return this.http.put<UserInfo>(`${this.usersUrl}/${id}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  resetPassword(token: string, newPassword: string): Observable<UserInfo> {
    return this.http.post<UserInfo>(`${this.usersUrl}/reset-password`, {
      token,
      newPassword,
    });
  }

  lockAccount(id: number): Observable<UserInfo> {
    return this.http.put<UserInfo>(`${this.usersUrl}/${id}/lock`, {});
  }

  unlockAccount(id: number): Observable<UserInfo> {
    return this.http.put<UserInfo>(`${this.usersUrl}/${id}/unlock`, {});
  }
}
