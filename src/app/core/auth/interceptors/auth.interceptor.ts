import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStore } from '../stores/auth.store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const messageService = inject(MessageService);
  const token = authStore.getToken();

  if (token) {
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(authReq).pipe(
      catchError((error) => {
        if (
          error.status === HttpStatusCode.Unauthorized &&
          (error.error?.code === 'TOKEN_EXPIRED' ||
            error.error?.message === 'Token has expired')
        ) {
          messageService.add({
            severity: 'info',
            summary: 'Sesión expirada',
            detail:
              'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',
            life: 5000,
          });
          authStore.logout();
          router.navigate(['/iniciar-sesion']);
        } else if (error.status === HttpStatusCode.Unauthorized) {
          authStore.logout();
          router.navigate(['/iniciar-sesion']);
        }
        return throwError(() => error);
      }),
    );
  }

  return next(request);
};
