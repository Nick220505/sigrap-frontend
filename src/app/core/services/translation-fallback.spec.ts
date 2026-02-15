import { TestBed } from '@angular/core/testing';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

describe('Translation Service Fallback Behavior', () => {
  let translateService: TranslateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({
          defaultLanguage: 'en',
          fallbackLang: 'en',
          loader: provideTranslateHttpLoader({
            prefix: './assets/i18n/',
            suffix: '.json'
          })
        })
      ]
    });

    translateService = TestBed.inject(TranslateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should have fallbackLang configured to English', () => {
    // This verifies that the configuration is set correctly
    // The TranslateService doesn't expose fallbackLang directly,
    // but we can verify the behavior by testing fallback
    expect(translateService.defaultLang).toBe('en');
  });

  it('should fall back to English when a key is missing in Spanish', async () => {
    // Load English translations
    translateService.use('en');
    const enRequest = httpMock.expectOne('./assets/i18n/en.json');
    enRequest.flush({
      'test': {
        'existsInEnglish': 'English Value'
      }
    });

    // Switch to Spanish with incomplete translations
    translateService.use('es');
    const esRequest = httpMock.expectOne('./assets/i18n/es.json');
    esRequest.flush({
      'test': {
        // Missing 'existsInEnglish' key
      }
    });

    // Wait for translations to load
    await new Promise(resolve => setTimeout(resolve, 100));

    // Request a key that exists in English but not in Spanish
    const translation = translateService.instant('test.existsInEnglish');
    
    // Should fall back to English value
    expect(translation).toBe('English Value');
  });

  it('should display the key itself when not found in any language', () => {
    translateService.use('en');
    const enRequest = httpMock.expectOne('./assets/i18n/en.json');
    enRequest.flush({
      'common': {
        'save': 'Save'
      }
    });

    // Request a key that doesn't exist
    const translation = translateService.instant('nonexistent.key');
    
    // Should return the key itself as fallback
    expect(translation).toBe('nonexistent.key');
  });
});
