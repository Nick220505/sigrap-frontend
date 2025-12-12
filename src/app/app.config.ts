import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import Aura from '@primeng/themes/aura';
import { environment } from '@env';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { apiBaseUrlInterceptor } from './core/api/api-base-url.interceptor';
import { API_BASE_URL } from './core/api/api-base-url.token';
import { authInterceptor } from './core/auth/interceptors/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withViewTransitions(),
    ),
    {
      provide: API_BASE_URL,
      useValue: environment.apiUrl,
    },
    provideHttpClient(
      withInterceptors([apiBaseUrlInterceptor, authInterceptor]),
    ),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
          cssLayer: {
            name: 'primeng',
            order: 'theme, base, primeng',
          },
        },
      },
    }),
    MessageService,
    ConfirmationService,
  ],
};
