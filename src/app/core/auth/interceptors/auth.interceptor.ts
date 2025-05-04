import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
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
    return next(authReq);
  }

  return next(request);
};
