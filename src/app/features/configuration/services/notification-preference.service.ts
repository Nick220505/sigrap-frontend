import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';
import {
  NotificationPreferenceData,
  NotificationPreferenceInfo,
} from '../models/notification-preference.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationPreferenceService {
  private readonly http = inject(HttpClient);
  private readonly preferencesUrl = `${environment.apiUrl}/notification-preferences`;

  findAll(): Observable<NotificationPreferenceInfo[]> {
    return this.http.get<NotificationPreferenceInfo[]>(this.preferencesUrl);
  }

  findById(id: number): Observable<NotificationPreferenceInfo> {
    return this.http.get<NotificationPreferenceInfo>(
      `${this.preferencesUrl}/${id}`,
    );
  }

  findByUserId(userId: number): Observable<NotificationPreferenceInfo[]> {
    return this.http.get<NotificationPreferenceInfo[]>(
      `${this.preferencesUrl}/user/${userId}`,
    );
  }

  create(
    preferenceData: NotificationPreferenceData,
  ): Observable<NotificationPreferenceInfo> {
    return this.http.post<NotificationPreferenceInfo>(
      this.preferencesUrl,
      preferenceData,
    );
  }

  update(
    id: number,
    preferenceData: Partial<NotificationPreferenceData>,
  ): Observable<NotificationPreferenceInfo> {
    return this.http.put<NotificationPreferenceInfo>(
      `${this.preferencesUrl}/${id}`,
      preferenceData,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.preferencesUrl}/${id}`);
  }

  updateUserPreferences(
    userId: number,
    preferences: NotificationPreferenceData[],
  ): Observable<NotificationPreferenceInfo[]> {
    return this.http.put<NotificationPreferenceInfo[]>(
      `${this.preferencesUrl}/user/${userId}`,
      preferences,
    );
  }
}
