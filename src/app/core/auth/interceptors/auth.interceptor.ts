import { HttpInterceptorFn, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { EMPTY, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthStore } from '../stores/auth.store';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.getToken();

  if (token) {
    const authReq = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(authReq).pipe(
      catchError((error) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          authStore.logout();
          return EMPTY;
        }
        return throwError(() => error);
      }),
    );
  }

  return next(request);
};
