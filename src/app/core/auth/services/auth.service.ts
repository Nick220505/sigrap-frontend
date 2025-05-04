import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = signal<boolean>(!!this.getToken());

  login(credentials: LoginRequest): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        map(() => true),
        catchError(() => of(false)),
      );
  }

  register(userData: RegisterRequest): Observable<boolean> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, userData)
      .pipe(
        tap((response) => this.handleAuthResponse(response)),
        map(() => true),
        catchError(() => of(false)),
      );
  }

  logout(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/iniciar-sesion']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  private handleAuthResponse(response: AuthResponse): void {
    const { token, email, name } = response;

    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({ email, name }));

    this.currentUser.set({ email, name });
    this.isAuthenticated.set(true);
  }

  private getUserFromStorage(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
}
