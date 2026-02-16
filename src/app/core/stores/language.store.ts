import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, withHooks, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { pipe, switchMap, tap, catchError, of, from } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface LanguageState {
  currentLanguage: string;
  availableLanguages: Language[];
  isLoading: boolean;
  error: string | null;
}

export const LanguageStore = signalStore(
  { providedIn: 'root' },
  withState<LanguageState>({
    currentLanguage: 'en',
    availableLanguages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'es', name: 'Spanish', nativeName: 'Español' }
    ],
    isLoading: false,
    error: null
  }),
  withComputed((state) => ({
    currentLanguageObject: computed(() => 
      state.availableLanguages().find(lang => lang.code === state.currentLanguage())
    )
  })),
  withMethods((store, translateService = inject(TranslateService)) => ({
    initializeLanguage: rxMethod<void>(
      pipe(
        switchMap(() => {
          const storedLang = localStorage.getItem('language-preference');
          const browserLang = translateService.getBrowserLang();
          const supportedLangs = store.availableLanguages().map(l => l.code);
          
          let initialLang = 'en';
          if (storedLang && supportedLangs.includes(storedLang)) {
            initialLang = storedLang;
          } else if (browserLang && supportedLangs.includes(browserLang)) {
            initialLang = browserLang;
          }
          
          return from(translateService.use(initialLang)).pipe(
            tap(() => {
              patchState(store, { currentLanguage: initialLang, isLoading: false });
            }),
            catchError((error) => {
              patchState(store, { error: error.message, isLoading: false });
              return of(null);
            })
          );
        })
      )
    ),
    
    switchLanguage: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((locale) => {
          const supportedLangs = store.availableLanguages().map(l => l.code);
          if (!supportedLangs.includes(locale)) {
            patchState(store, { 
              error: translateService.instant('messages.errors.unsupportedLanguage', { locale }), 
              isLoading: false 
            });
            return of(null);
          }
          
          return from(translateService.use(locale)).pipe(
            tap(() => {
              try {
                localStorage.setItem('language-preference', locale);
              } catch (error) {
                console.warn('Failed to persist language preference:', error);
                // Continue operation without persistence
              }
              patchState(store, { 
                currentLanguage: locale, 
                isLoading: false 
              });
            }),
            catchError((error) => {
              patchState(store, { 
                error: error.message, 
                isLoading: false 
              });
              return of(null);
            })
          );
        })
      )
    )
  })),
  withHooks({
    onInit(store) {
      store.initializeLanguage();
    }
  })
);
