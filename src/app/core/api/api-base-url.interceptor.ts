import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from './api-base-url.token';

const isAbsoluteUrl = (url: string): boolean =>
  url.startsWith('http://') || url.startsWith('https://');

const joinUrl = (base: string, path: string): string => {
  if (!base) {
    return path;
  }

  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
};

export const apiBaseUrlInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);

  if (isAbsoluteUrl(request.url)) {
    return next(request);
  }

  if (!request.url.startsWith('/')) {
    return next(request);
  }

  const apiReq = request.clone({
    url: joinUrl(apiBaseUrl, request.url),
  });

  return next(apiReq);
};
