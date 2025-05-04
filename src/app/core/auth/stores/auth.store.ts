import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withProps,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { MessageService } from 'primeng/api';
import { concatMap, pipe, tap } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),
  withComputed(({ user, isAuthenticated }) => ({
    currentUser: computed(() => user()),
    isLoggedIn: computed(() => isAuthenticated()),
  })),
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
              next: (success) => {
                if (success) {
                  patchState(store, {
                    user: authService.currentUser(),
                    isAuthenticated: true,
                  });
                  router.navigate(['/']);
                } else {
                  patchState(store, {
                    error: 'Credenciales inválidas',
                  });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Credenciales inválidas',
                  });
                }
              },
              error: () => {
                patchState(store, {
                  error:
                    'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.',
                });
                messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail:
                    'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.',
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
              next: (success) => {
                if (success) {
                  patchState(store, {
                    user: authService.currentUser(),
                    isAuthenticated: true,
                  });
                  router.navigate(['/']);
                } else {
                  patchState(store, {
                    error:
                      'No se pudo completar el registro. Intente nuevamente.',
                  });
                  messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail:
                      'No se pudo completar el registro. Intente nuevamente.',
                  });
                }
              },
              error: (err: HttpErrorResponse) => {
                let errorMessage =
                  'Ha ocurrido un error. Por favor, inténtelo de nuevo más tarde.';
                if (err?.error?.message === 'Email already exists') {
                  errorMessage = 'El correo electrónico ya está registrado.';
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
      authService.logout();
      patchState(store, {
        user: null,
        isAuthenticated: false,
      });
      router.navigate(['/iniciar-sesion']);
    },
    checkAuthState: () => {
      const user = authService.currentUser();
      const isAuthenticated = authService.isAuthenticated();
      patchState(store, { user, isAuthenticated });
    },
  })),
  withHooks({
    onInit({ checkAuthState }) {
      checkAuthState();
    },
  }),
);
