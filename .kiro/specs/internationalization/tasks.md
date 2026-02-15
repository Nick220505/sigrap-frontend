# Implementation Plan: Internationalization (i18n)

## Overview

This implementation plan breaks down the internationalization feature into discrete coding tasks. The approach follows an incremental pattern: set up infrastructure, implement core functionality, add UI components, apply translations throughout the app, and validate with comprehensive tests.

## Tasks

- [x] 1. Install dependencies and configure translation service
  - Install @ngx-translate/core and @ngx-translate/http-loader packages
  - Create HttpLoaderFactory function in app.config.ts
  - Add provideTranslateService to app.config.ts providers array with default language 'en' and HTTP loader configuration
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 2. Create translation files structure
  - Create src/assets/i18n directory
  - Create en.json with complete English translations organized by feature (common, nav, auth, validation, messages)
  - Create es.json with complete Spanish translations matching en.json structure
  - Ensure both files have identical key structures using nested JSON objects
  - _Requirements: 1.1, 1.2, 1.4, 8.1, 8.3, 8.5_

- [ ]* 3. Write property test for translation file structure consistency
  - **Property 14: Translation File Structure Consistency**
  - **Validates: Requirements 8.5**

- [ ] 4. Implement Language Store with @ngrx/signals
  - [x] 4.1 Create language.store.ts with LanguageState interface and Language interface
    - Define LanguageState with currentLanguage, availableLanguages, isLoading, error
    - Define Language interface with code, name, nativeName
    - Initialize state with English and Spanish in availableLanguages
    - _Requirements: 5.1, 5.2, 1.1, 1.2_
  
  - [x] 4.2 Add computed signals to Language Store
    - Create currentLanguageObject computed signal that finds current language in availableLanguages
    - _Requirements: 5.1_
  
  - [x] 4.3 Implement initializeLanguage method with rxMethod
    - Check localStorage for 'language-preference'
    - Detect browser language using TranslateService.getBrowserLang()
    - Determine initial language with priority: stored preference > browser language > default English
    - Call TranslateService.use() with selected language
    - Update store state with currentLanguage and isLoading
    - Handle errors with catchError and update error state
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_
  
  - [x] 4.4 Implement switchLanguage method with rxMethod
    - Validate language code against availableLanguages
    - Reject unsupported languages with error state
    - Set isLoading to true before switch
    - Call TranslateService.use() with new language
    - Store language preference in localStorage
    - Update store state with new currentLanguage
    - Handle errors with catchError
    - _Requirements: 2.2, 3.1, 5.3, 10.5_
  
  - [x] 4.5 Add onInit hook to Language Store
    - Call initializeLanguage() in onInit hook
    - _Requirements: 3.2, 4.1_

- [ ]* 5. Write property tests for Language Store
  - [ ]* 5.1 Write property test for language preference persistence
    - **Property 6: Language Preference Persistence**
    - **Validates: Requirements 3.1**
  
  - [ ]* 5.2 Write property test for stored preference retrieval
    - **Property 7: Stored Preference Retrieval**
    - **Validates: Requirements 3.2, 3.3**
  
  - [ ]* 5.3 Write property test for browser language detection fallback
    - **Property 8: Browser Language Detection Fallback**
    - **Validates: Requirements 3.4, 3.5**
  
  - [ ]* 5.4 Write property test for language switch updates store state
    - **Property 4: Language Switch Updates Store State**
    - **Validates: Requirements 2.2**
  
  - [ ]* 5.5 Write property test for invalid language rejection
    - **Property 19: Invalid Language Rejection**
    - **Validates: Requirements 10.5**
  
  - [ ]* 5.6 Write property test for signal reactivity
    - **Property 9: Signal Reactivity**
    - **Validates: Requirements 5.5**

- [ ]* 6. Write unit tests for Language Store
  - Test default initialization to English
  - Test error handling during language switch
  - Test localStorage error handling
  - Test store interface methods exist (switchLanguage, initializeLanguage)
  - _Requirements: 1.1, 2.5, 5.3, 5.4_

- [ ] 7. Create Language Switcher component
  - [x] 7.1 Create language-switcher.component.ts as standalone component
    - Import DropdownModule from PrimeNG and CommonModule
    - Inject LanguageStore
    - Create availableLanguages signal from store
    - Create selectedLanguage signal from store.currentLanguage
    - Implement onLanguageChange handler that calls store.switchLanguage
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 7.2 Create language-switcher.component.html template
    - Add p-dropdown with options bound to availableLanguages
    - Bind ngModel to selectedLanguage
    - Set optionLabel to "nativeName" and optionValue to "code"
    - Add onChange event handler
    - _Requirements: 6.1, 6.2, 6.5_

- [ ]* 8. Write property tests for Language Switcher
  - [ ]* 8.1 Write property test for displaying all languages
    - **Property 10: Language Switcher Displays All Languages**
    - **Validates: Requirements 6.1**
  
  - [ ]* 8.2 Write property test for reflecting current language
    - **Property 11: Language Switcher Reflects Current Language**
    - **Validates: Requirements 6.2**
  
  - [ ]* 8.3 Write property test for triggering language change
    - **Property 12: Language Switcher Triggers Change**
    - **Validates: Requirements 6.3**
  
  - [ ]* 8.4 Write property test for native language names display
    - **Property 13: Native Language Names Display**
    - **Validates: Requirements 6.5**

- [ ]* 9. Write unit tests for Language Switcher component
  - Test component renders with dropdown
  - Test dropdown contains correct number of options
  - Test onChange calls store method with correct parameter
  - _Requirements: 6.1, 6.3_

- [x] 10. Integrate Language Switcher into application layout
  - Add Language Switcher component to main header/navigation component
  - Import LanguageSwitcherComponent in the layout component
  - Position switcher in appropriate location (top-right or navigation bar)
  - _Requirements: 6.6_

- [x] 11. Checkpoint - Ensure core i18n infrastructure works
  - Verify Language Store initializes correctly
  - Verify Language Switcher displays and functions
  - Verify translation files load without errors
  - Ask the user if questions arise

- [ ] 12. Apply translations to authentication pages
  - [x] 12.1 Update login component with translations
    - Import TranslateModule
    - Replace hardcoded text with translate pipe for title, labels, buttons, errors
    - Use translation keys: auth.login.title, auth.login.email, auth.login.password, auth.login.submit, auth.login.forgotPassword
    - _Requirements: 7.1, 7.4, 7.5_
  
  - [x] 12.2 Update register component with translations
    - Import TranslateModule
    - Replace hardcoded text with translate pipe
    - Use translation keys: auth.register.title, auth.register.confirmPassword, auth.register.submit
    - _Requirements: 7.1, 7.4_

- [x] 13. Apply translations to navigation components
  - Import TranslateModule in navigation/menu components
  - Replace hardcoded menu items with translate pipe
  - Use translation keys: nav.home, nav.dashboard, nav.profile, nav.settings, nav.logout
  - _Requirements: 7.1, 7.6_

- [ ] 14. Apply translations to common UI elements
  - [x] 14.1 Update buttons and actions with common translations
    - Replace Save/Cancel/Delete/Edit/Close/Confirm buttons with translate pipe
    - Use translation keys: common.save, common.cancel, common.delete, common.edit, common.close, common.confirm
    - _Requirements: 7.1, 7.4_
  
  - [x] 14.2 Update form validation messages
    - Replace validation error messages with translate pipe using parameter interpolation
    - Use translation keys: validation.required, validation.email, validation.minLength, validation.maxLength
    - Pass field names and values as parameters
    - _Requirements: 7.1, 7.5, 8.4_
  
  - [x] 14.3 Update toast notifications and alerts
    - Update MessageService calls to use TranslateService.get() or instant()
    - Use translation keys: messages.success.saved, messages.success.deleted, messages.errors.generic, messages.errors.network
    - _Requirements: 7.2, 7.8_

- [ ]* 15. Write property tests for translation functionality
  - [ ]* 15.1 Write property test for translation file loading
    - **Property 1: Translation File Loading for All Locales**
    - **Validates: Requirements 1.3, 1.4**
  
  - [ ]* 15.2 Write property test for missing key fallback
    - **Property 2: Missing Key Fallback**
    - **Validates: Requirements 1.5**
  
  - [ ]* 15.3 Write property test for language switch updates UI
    - **Property 3: Language Switch Updates UI Without Reload**
    - **Validates: Requirements 2.1**
  
  - [ ]* 15.4 Write property test for nested key access
    - **Property 15: Nested Key Access**
    - **Validates: Requirements 8.3**
  
  - [ ]* 15.5 Write property test for parameter interpolation
    - **Property 16: Parameter Interpolation**
    - **Validates: Requirements 8.4**
  
  - [ ]* 15.6 Write property test for missing key display
    - **Property 17: Missing Key Display**
    - **Validates: Requirements 10.1**
  
  - [ ]* 15.7 Write property test for translation load failure handling
    - **Property 18: Translation Load Failure Handling**
    - **Validates: Requirements 10.2, 10.4**

- [ ]* 16. Write unit tests for translation service integration
  - Test TranslateService can be injected globally
  - Test both get() and instant() methods work
  - Test translation with parameters
  - Test missing key returns key itself
  - _Requirements: 9.4, 9.5, 10.1_

- [x] 17. Apply translations to remaining application pages
  - Audit all components for hardcoded user-facing text
  - Replace hardcoded text with translate pipe or TranslateService calls
  - Add new translation keys to en.json and es.json as needed
  - Maintain consistent key structure and naming conventions
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8_

- [ ] 18. Add error handling for edge cases
  - [x] 18.1 Add try-catch for localStorage operations
    - Wrap localStorage.setItem in try-catch in Language Store
    - Log warning if localStorage fails
    - Continue operation without persistence
    - _Requirements: 10.2, 10.4_
  
  - [x] 18.2 Configure translation service fallback behavior
    - Ensure useDefaultLang is set to true in provideTranslateService config
    - Verify missing keys fall back to English
    - _Requirements: 1.5, 10.1_

- [ ]* 19. Write unit tests for error handling
  - Test localStorage unavailable scenario
  - Test network error during translation load
  - Test missing translation key fallback
  - Test interpolation with missing parameters
  - _Requirements: 2.5, 10.2, 10.3_

- [x] 20. Final checkpoint - Comprehensive testing and validation
  - Run all unit tests and property tests
  - Verify all 19 correctness properties pass
  - Test language switching in running application
  - Test browser language detection with different browser settings
  - Test language persistence across page refreshes
  - Verify all pages and components display translations correctly
  - Test error scenarios (network failures, invalid languages)
  - Ensure all tests pass, ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples, edge cases, and error conditions
- Translation keys should follow dot notation convention: feature.component.element
- All user-facing text must be extracted to translation files
- Maintain identical key structures between en.json and es.json
