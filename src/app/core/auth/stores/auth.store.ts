import { HttpErrorResponse } from '@angular/common/http';
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
import { AuthResponse } from '../models/auth-response.model';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';

export interface AuthState {
  currentUser: User | null;
  isLoggedIn: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    currentUser: null,
    isLoggedIn: false,
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
              next: ({ token, email, name }: AuthResponse) => {
                const user = { email, name };

                localStorage.setItem(AUTH_TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));

                patchState(store, {
                  currentUser: user,
                  token,
                  isLoggedIn: true,
                });
                router.navigate(['/']);
              },
              error: (err: HttpErrorResponse) => {
                let errorMessage =
                  'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.';

                if (err.status === 401 || err.status === 403) {
                  errorMessage = 'Credenciales inválidas';
                } else if (err.error?.message) {
                  if (err.error.message === 'Invalid credentials') {
                    errorMessage = 'Credenciales inválidas';
                  } else {
                    errorMessage = err.error.message;
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
              next: ({ token, email, name }: AuthResponse) => {
                const user = { email, name };

                localStorage.setItem(AUTH_TOKEN_KEY, token);
                localStorage.setItem(USER_KEY, JSON.stringify(user));

                patchState(store, {
                  currentUser: user,
                  token,
                  isLoggedIn: true,
                });
                router.navigate(['/']);
              },
              error: (err: HttpErrorResponse) => {
                let errorMessage =
                  'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.';

                if (
                  err.status === 409 ||
                  err.error?.message === 'Email already exists'
                ) {
                  errorMessage = 'El correo electrónico ya está registrado';
                } else if (err.error?.message) {
                  errorMessage = err.error.message;
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
        currentUser: null,
        isLoggedIn: false,
        token: null,
      });
      router.navigate(['/iniciar-sesion']);
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
          patchState(store, {
            currentUser: user,
            token,
            isLoggedIn: true,
          });
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
