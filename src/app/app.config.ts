import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import Aura from '@primeuix/themes/aura';
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptors/auth-interceptor';

// HttpLoaderFactory: Configures the translation file loader
// In ngx-translate v17+, we use provideTranslateHttpLoader instead of the traditional factory pattern
export function HttpLoaderFactory() {
  return provideTranslateHttpLoader({
    prefix: './assets/i18n/',
    suffix: '.json'
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled',
      }),
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
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
    provideTranslateService({
      defaultLanguage: 'en',
      fallbackLang: 'en',
      loader: HttpLoaderFactory()
    }),
    MessageService,
    ConfirmationService,
  ],
};
