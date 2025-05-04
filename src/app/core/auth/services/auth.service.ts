import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials);
  }

  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, userData);
  }
}
