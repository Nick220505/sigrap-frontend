import { beforeEach, afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { LanguageStore } from './language.store';
import { of, throwError, from } from 'rxjs';

describe('LanguageStore - switchLanguage', () => {
  let store: InstanceType<typeof LanguageStore>;
  let translateService: { use: Mock; getBrowserLang: Mock; instant: Mock };

  beforeEach(() => {
    translateService = {
      use: vi.fn().mockReturnValue(of({})),
      getBrowserLang: vi.fn().mockReturnValue('en'),
      instant: vi.fn((key: string) => key)
    };

    TestBed.configureTestingModule({
      providers: [
        LanguageStore,
        { provide: TranslateService, useValue: translateService }
      ]
    });

    store = TestBed.inject(LanguageStore);
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should validate language code against availableLanguages', async () => {
    const unsupportedLang = 'fr';
    
    store.switchLanguage(unsupportedLang);
    
    await vi.waitFor(() => {
      expect(store.error()).toBe('messages.errors.unsupportedLanguage');
      expect(store.currentLanguage()).toBe('en'); // Should remain unchanged
    });
  });

  it('should reject unsupported languages with error state', async () => {
    store.switchLanguage('de');
    
    await vi.waitFor(() => {
      expect(store.error()).toBe('messages.errors.unsupportedLanguage');
      expect(store.isLoading()).toBe(false);
    });
  });

  it('should set isLoading to true during switch', async () => {
    // Use a delayed observable to capture the loading state
    let resolvePromise: () => void;
    const delayedObservable = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    
    translateService.use.mockReturnValue(from(delayedObservable.then(() => ({}))));
    
    store.switchLanguage('es');
    
    // Wait a bit for the rxMethod to process
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Now loading should be true
    expect(store.isLoading()).toBe(true);
    
    // Resolve the promise to complete the switch
    resolvePromise!();
    
    await vi.waitFor(() => {
      expect(store.isLoading()).toBe(false);
    });
  });

  it('should call TranslateService.use() with new language', async () => {
    translateService.use.mockReturnValue(of({}));
    
    store.switchLanguage('es');
    
    await vi.waitFor(() => {
      expect(translateService.use).toHaveBeenCalledWith('es');
    });
  });

  it('should store language preference in localStorage', async () => {
    translateService.use.mockReturnValue(of({}));
    
    store.switchLanguage('es');
    
    await vi.waitFor(() => {
      const stored = localStorage.getItem('language-preference');
      expect(stored).toBe('es');
    });
  });

  it('should update store state with new currentLanguage', async () => {
    translateService.use.mockReturnValue(of({}));
    
    store.switchLanguage('es');
    
    await vi.waitFor(() => {
      expect(store.currentLanguage()).toBe('es');
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });

  it('should handle errors with catchError', async () => {
    const errorMessage = 'Translation load failed';
    translateService.use.mockReturnValue(
      throwError(() => new Error(errorMessage))
    );
    
    store.switchLanguage('es');
    
    await vi.waitFor(() => {
      expect(store.error()).toBe(errorMessage);
      expect(store.isLoading()).toBe(false);
      expect(store.currentLanguage()).toBe('en'); // Should remain unchanged
    });
  });

  it('should switch from English to Spanish successfully', async () => {
    translateService.use.mockReturnValue(of({}));
    
    expect(store.currentLanguage()).toBe('en');
    
    store.switchLanguage('es');
    
    await vi.waitFor(() => {
      expect(store.currentLanguage()).toBe('es');
      expect(localStorage.getItem('language-preference')).toBe('es');
    });
  });

  it('should switch from Spanish to English successfully', async () => {
    translateService.use.mockReturnValue(of({}));
    
    // First switch to Spanish
    store.switchLanguage('es');
    
    await vi.waitFor(() => {
      expect(store.currentLanguage()).toBe('es');
    });
    
    // Then switch back to English
    store.switchLanguage('en');
    
    await vi.waitFor(() => {
      expect(store.currentLanguage()).toBe('en');
      expect(localStorage.getItem('language-preference')).toBe('en');
    });
  });
});

describe('LanguageStore - localStorage error handling', () => {
  let store: InstanceType<typeof LanguageStore>;
  let translateService: { use: Mock; getBrowserLang: Mock; instant: Mock };
  let consoleWarnSpy: Mock;

  beforeEach(() => {
    translateService = {
      use: vi.fn().mockReturnValue(of({})),
      getBrowserLang: vi.fn().mockReturnValue('en'),
      instant: vi.fn((key: string) => key)
    };

    TestBed.configureTestingModule({
      providers: [
        LanguageStore,
        { provide: TranslateService, useValue: translateService }
      ]
    });

    store = TestBed.inject(LanguageStore);
    
    // Spy on console.warn
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      // Mock implementation
    });
    
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    consoleWarnSpy.mockRestore();
  });

  it('should handle localStorage.setItem errors gracefully', async () => {
    // Mock localStorage.setItem to throw an error
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    translateService.use.mockReturnValue(of({}));
    
    store.switchLanguage('es');
    
    await vi.waitFor(() => {
      // Language should still switch successfully
      expect(store.currentLanguage()).toBe('es');
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      
      // Warning should be logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Failed to persist language preference:',
        expect.any(Error)
      );
    });

    setItemSpy.mockRestore();
  });

  it('should continue operation without persistence when localStorage fails', async () => {
    // Mock localStorage.setItem to throw an error
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    translateService.use.mockReturnValue(of({}));
    
    store.switchLanguage('es');
    
    await vi.waitFor(() => {
      // Operation should complete successfully despite localStorage failure
      expect(store.currentLanguage()).toBe('es');
      expect(store.isLoading()).toBe(false);
      expect(store.error()).toBeNull();
      
      // Verify localStorage was attempted
      expect(setItemSpy).toHaveBeenCalledWith('language-preference', 'es');
    });

    setItemSpy.mockRestore();
  });
});
