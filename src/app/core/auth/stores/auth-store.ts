import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, tap } from 'rxjs';
import { AuthResponse } from '../models/auth-response';
import { LoginRequest } from '../models/login-request';
import { RegisterRequest } from '../models/register-request';
import { User } from '../models/user';
import { AuthService } from '../services/auth';

export interface AuthState {
  user: User | null;
  loggedIn: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    user: null,
    loggedIn: false,
    token: null,
    loading: false,
    error: null,
  }),
  withProps(() => ({
    authService: inject(AuthService),
    messageService: inject(MessageService),
    router: inject(Router),
  })),
  withMethods(({ authService, messageService, router, ...store }) => ({
    login: rxMethod<LoginRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((credentials) =>
          authService.login(credentials).pipe(
            tapResponse({
              next: ({ token, email, name, lastLogin, role }: AuthResponse) => {
                const user = { email, name, lastLogin, role };

                localStorage.setItem(AUTH_TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));

                patchState(store, { user, token, loggedIn: true });

                router.navigate(['/']);

                messageService.add({
                  severity: 'success',
                  summary: 'Login Successful',
                  detail: `Welcome, ${name}`,
                });
              },
              error: ({ status, error }: HttpErrorResponse) => {
                let errorMessage = 'An error occurred. Please try again later.';

                if (
                  status === HttpStatusCode.Unauthorized ||
                  status === HttpStatusCode.Forbidden
                ) {
                  errorMessage = 'Invalid credentials';
                } else if (error?.message) {
                  if (error.message === 'Invalid credentials') {
                    errorMessage = 'Invalid credentials';
                  } else {
                    errorMessage = error.message;
                  }
                }

                patchState(store, { error: errorMessage });

                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: errorMessage,
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    register: rxMethod<RegisterRequest>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        concatMap((userData) =>
          authService.register(userData).pipe(
            tapResponse({
              next: ({ token, email, name, lastLogin, role }: AuthResponse) => {
                const user = { email, name, lastLogin, role };

                localStorage.setItem(AUTH_TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));

                patchState(store, { user, token, loggedIn: true });

                router.navigate(['/']);

                messageService.add({
                  severity: 'success',
                  summary: 'Registration Successful',
                  detail: `Account created successfully. Welcome, ${name}!`,
                });
              },
              error: ({ status, error }: HttpErrorResponse) => {
                let errorMessage = 'An error occurred. Please try again later.';

                if (
                  status === HttpStatusCode.Conflict ||
                  error?.message === 'Email already exists'
                ) {
                  errorMessage = 'Email is already registered';
                } else if (error?.message) {
                  errorMessage = error.message;
                }

                patchState(store, { error: errorMessage });

                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: errorMessage,
                });
              },
              finalize: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
    logout: () => {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      patchState(store, {
        user: null,
        loggedIn: false,
        token: null,
      });

      router.navigate(['/login']);

      messageService.add({
        severity: 'success',
        summary: 'Session Closed',
        detail: 'You have successfully logged out',
      });
    },
    getToken: (): string | null => {
      return store.token() ?? localStorage.getItem(AUTH_TOKEN_KEY);
    },
    loadAuthStateFromStorage: () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const userJson = localStorage.getItem(USER_KEY);

      if (token && userJson) {
        try {
          const user = JSON.parse(userJson) as User;
          patchState(store, { user, token, loggedIn: true });
        } catch {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
    },
  })),
  withHooks({
    onInit({ loadAuthStateFromStorage }) {
      loadAuthStateFromStorage();
    },
  }),
);

