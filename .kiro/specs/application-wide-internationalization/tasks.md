# Implementation Plan: Application-Wide Internationalization

## Overview

This implementation plan systematically internationalizes all remaining components in the application by replacing hardcoded strings with translation keys. The work is organized by module, starting with common keys and shared components, then progressing through high-traffic modules (Employee, Sales, Inventory) before completing remaining modules (Supplier, Customer, Configuration). Each module includes property-based tests to verify translation usage.

## Tasks

- [x] 1. Add common translation keys to translation files
  - Add common keys (new, export, retry, searchPlaceholder, selectPlaceholder, clearAllFilters, filterBy, addProduct, selectLanguage) to both en.json and es.json
  - Organize keys in the common section following existing structure
  - Add Spanish translations for all new common keys
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 9.1_

- [ ]* 1.1 Write property test for common keys existence
  - **Property 8.1-8.4**: Common translation keys exist in translation files
  - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

- [ ] 2. Internationalize shared components
  - [x] 2.1 Internationalize language switcher component
    - Replace "Select Language" placeholder with translation key
    - Ensure TranslateModule is imported
    - _Requirements: 7.1, 10.1_
  
  - [x] 2.2 Internationalize shared dialog components
    - Replace any hardcoded text in shared dialogs with translation keys
    - Update common section with any new keys needed
    - _Requirements: 7.2, 9.1_
  
  - [x] 2.3 Internationalize shared button components
    - Replace button labels with translation keys from common section
    - _Requirements: 7.3, 8.5_

- [ ]* 2.4 Write property test for shared components
  - **Property 1**: UI elements use translation keys (shared components)
  - **Validates: Requirements 7.1, 7.2, 7.3**

- [ ]* 2.5 Write property test for shared component translation completeness
  - **Property 3**: Translation keys exist in both languages (shared components)
  - **Validates: Requirements 7.4, 9.1, 9.2**

- [x] 3. Checkpoint - Verify shared components
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Internationalize Employee module
  - [x] 4.1 Add employee translation keys to translation files
    - Add clockInDialog section (title, employeeLabel, employeePlaceholder, clockInButton)
    - Add schedule section (newButton, exportButton, retryButton, selectEmployee, selectDay, selectType)
    - Add days section (monday through sunday)
    - Add shiftTypes section (morning, afternoon, night, holiday)
    - Add corresponding Spanish translations to es.json
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1_
  
  - [x] 4.2 Internationalize clock-in dialog component
    - Replace dialog header "Clock In" with translation key
    - Replace "Employee" label with translation key
    - Replace "Select an employee" placeholder with translation key
    - Replace "Clock In" button with translation key
    - Ensure TranslateModule is imported
    - _Requirements: 1.1, 10.1_
  
  - [x] 4.3 Internationalize schedule components
    - Replace toolbar buttons (New, Export) with translation keys
    - Replace "Retry" button with translation key
    - Replace placeholders (Select an employee, Select a day, Select a type) with translation keys
    - Replace day options (Monday-Sunday) with translation keys
    - Replace shift type options (Morning, Afternoon, Night, Holiday) with translation keys
    - Ensure TranslateModule is imported
    - _Requirements: 1.2, 1.3, 1.4, 10.1_

- [ ]* 4.4 Write property test for Employee module UI elements
  - **Property 1**: UI elements use translation keys (Employee module)
  - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**

- [ ]* 4.5 Write property test for Employee module translation completeness
  - **Property 3**: Translation keys exist in both languages (Employee module)
  - **Validates: Requirements 1.5, 9.1, 9.2**

- [ ] 5. Internationalize Sales module
  - [x] 5.1 Add sales translation keys to translation files
    - Add sales section (newSale, exportSales, retryButton, searchPlaceholder, selectCustomer, selectEmployee, selectProduct, selectDate, addProduct)
    - Add returns section (newButton, exportButton, retryButton, searchPlaceholder, selectOriginalSale, returnReasonPlaceholder)
    - Add corresponding Spanish translations to es.json
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 9.1_
  
  - [x] 5.2 Internationalize sales components
    - Replace toolbar buttons (New Sale, Export Sales) with translation keys
    - Replace "Retry" button with translation key
    - Replace "Clear all filters" aria-label with translation key
    - Replace placeholders (Search..., Select Customer, Select Employee, Select Product, Select date) with translation keys
    - Replace "Add Product" button with translation key
    - Ensure TranslateModule is imported
    - _Requirements: 4.1, 4.3, 4.4, 10.1_
  
  - [x] 5.3 Internationalize return components
    - Replace toolbar buttons (New, Export) with translation keys
    - Replace "Retry" button with translation key
    - Replace "Clear all filters" aria-label with translation key
    - Replace placeholders (Search..., Select Original Sale, return reason) with translation keys
    - Ensure TranslateModule is imported
    - _Requirements: 4.2, 4.4, 10.1_

- [ ]* 5.4 Write property test for Sales module UI elements
  - **Property 1**: UI elements use translation keys (Sales module)
  - **Property 2**: Accessibility attributes use translation keys (Sales module)
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

- [ ]* 5.5 Write property test for Sales module translation completeness
  - **Property 3**: Translation keys exist in both languages (Sales module)
  - **Validates: Requirements 4.5, 9.1, 9.2**

- [x] 6. Checkpoint - Verify high-traffic modules
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Internationalize Inventory module
  - [x] 7.1 Add inventory translation keys to translation files
    - Add products section (newButton, exportButton, retryButton, searchPlaceholder, productNamePlaceholder, descriptionPlaceholder, selectCategory)
    - Add categories section (newButton, exportButton, retryButton, searchPlaceholder, categoryNamePlaceholder)
    - Add corresponding Spanish translations to es.json
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 9.1_
  
  - [x] 7.2 Internationalize product components
    - Replace toolbar buttons (New, Export) with translation keys
    - Replace "Retry" button with translation key
    - Replace "Clear all filters" aria-label with translation key
    - Replace placeholders (Search..., Enter product name, Enter a description, Select a category) with translation keys
    - Ensure TranslateModule is imported
    - _Requirements: 5.1, 5.3, 5.4, 10.1_
  
  - [x] 7.3 Internationalize category components
    - Replace toolbar buttons (New, Export) with translation keys
    - Replace "Retry" button with translation key
    - Replace "Clear all filters" aria-label with translation key
    - Replace placeholders (Search..., Enter category name) with translation keys
    - Ensure TranslateModule is imported
    - _Requirements: 5.2, 5.3, 5.4, 10.1_

- [ ]* 7.4 Write property test for Inventory module UI elements
  - **Property 1**: UI elements use translation keys (Inventory module)
  - **Property 2**: Accessibility attributes use translation keys (Inventory module)
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [ ]* 7.5 Write property test for Inventory module translation completeness
  - **Property 3**: Translation keys exist in both languages (Inventory module)
  - **Validates: Requirements 5.5, 9.1, 9.2**

- [ ] 8. Internationalize Supplier module
  - [x] 8.1 Add supplier translation keys to translation files
    - Add orders section (newOrder, exportButton, retryButton, searchPlaceholder, selectSupplier, selectProduct, addProduct)
    - Add catalog section (newButton, exportButton, retryButton, searchPlaceholder, supplierNamePlaceholder, addressPlaceholder, contactNamePlaceholder, emailPlaceholder, phonePlaceholder, alternativePhonePlaceholder, websitePlaceholder, productsProvidedPlaceholder, paymentTermsLabel, daysLabel)
    - Add corresponding Spanish translations to es.json
    - _Requirements: 3.1, 3.2, 3.5, 9.1_
  
  - [x] 8.2 Internationalize supplier order components
    - Replace toolbar buttons (New Order, Export) with translation keys
    - Replace "Retry" button with translation key
    - Replace "Clear all filters" aria-label with translation key
    - Replace placeholders (Search..., Select a supplier, Select Product) with translation keys
    - Replace "Add Product" button with translation key
    - Implement "Filter by {column}" with parameter interpolation
    - Ensure TranslateModule is imported
    - _Requirements: 3.1, 3.3, 3.4, 10.1_
  
  - [x] 8.3 Internationalize supplier catalog components
    - Replace toolbar buttons (New, Export) with translation keys
    - Replace "Retry" button with translation key
    - Replace "Clear all filters" aria-label with translation key
    - Replace all form placeholders with translation keys (supplier name, address, contact, email, phone, website, products provided, payment terms, days)
    - Ensure TranslateModule is imported
    - _Requirements: 3.2, 3.4, 10.1_

- [ ]* 8.4 Write property test for Supplier module UI elements
  - **Property 1**: UI elements use translation keys (Supplier module)
  - **Property 2**: Accessibility attributes use translation keys (Supplier module)
  - **Validates: Requirements 3.1, 3.2, 3.4**

- [ ]* 8.5 Write property test for parameter interpolation
  - **Property 4**: Parameter interpolation support (Filter by {column})
  - **Validates: Requirements 3.3, 12.5**

- [ ]* 8.6 Write property test for Supplier module translation completeness
  - **Property 3**: Translation keys exist in both languages (Supplier module)
  - **Validates: Requirements 3.5, 9.1, 9.2**

- [ ] 9. Internationalize Customer module
  - [x] 9.1 Add customer translation keys to translation files
    - Add necessary keys for customer components (following patterns from other modules)
    - Add corresponding Spanish translations to es.json
    - _Requirements: 6.1, 6.2, 6.4, 9.1_
  
  - [x] 9.2 Internationalize customer components
    - Replace toolbar buttons with translation keys
    - Replace table elements with translation keys
    - Replace form field labels and placeholders with translation keys
    - Replace "Clear all filters" aria-label with translation key
    - Ensure TranslateModule is imported
    - _Requirements: 6.1, 6.3, 10.1_
  
  - [x] 9.3 Internationalize customer dialogs
    - Replace dialog headers with translation keys
    - Replace labels and placeholders with translation keys
    - Ensure TranslateModule is imported
    - _Requirements: 6.2, 10.1_

- [ ]* 9.4 Write property test for Customer module UI elements
  - **Property 1**: UI elements use translation keys (Customer module)
  - **Property 2**: Accessibility attributes use translation keys (Customer module)
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [ ]* 9.5 Write property test for Customer module translation completeness
  - **Property 3**: Translation keys exist in both languages (Customer module)
  - **Validates: Requirements 6.4, 9.1, 9.2**

- [ ] 10. Internationalize Configuration module
  - [x] 10.1 Add configuration translation keys to translation files
    - Add auditDialog section (title, entityLabel, entityIdLabel, actionLabel, userLabel, dateTimeLabel, previousDataLabel, newDataLabel, systemDefault)
    - Add any user management keys needed
    - Add corresponding Spanish translations to es.json
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.1_
  
  - [x] 10.2 Internationalize audit dialog component
    - Replace dialog header "Record Details" with translation key
    - Replace all field labels (Entity, Entity ID, Action, User, Date and Time, Previous Data, New Data) with translation keys
    - Replace default "System" text with translation key
    - Ensure TranslateModule is imported
    - _Requirements: 2.1, 2.2, 10.1_
  
  - [x] 10.3 Internationalize user management components
    - Replace all labels, buttons, and placeholders with translation keys
    - Ensure TranslateModule is imported
    - _Requirements: 2.3, 10.1_

- [ ]* 10.4 Write property test for Configuration module UI elements
  - **Property 1**: UI elements use translation keys (Configuration module)
  - **Property 10**: System default text translation
  - **Validates: Requirements 2.1, 2.2, 2.3**

- [ ]* 10.5 Write property test for Configuration module translation completeness
  - **Property 3**: Translation keys exist in both languages (Configuration module)
  - **Validates: Requirements 2.4, 9.1, 9.2**

- [x] 11. Checkpoint - Verify all modules
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Write comprehensive property-based tests
  - [ ]* 12.1 Write property test for common key usage
    - **Property 5**: Common keys for repeated text
    - **Validates: Requirements 8.5**
  
  - [ ]* 12.2 Write property test for TranslateModule imports
    - **Property 6**: Components import TranslateModule
    - **Property 8**: No hardcoded strings in components with TranslateModule
    - **Validates: Requirements 10.1, 10.3**
  
  - [ ]* 12.3 Write property test for TranslateService injection
    - **Property 7**: Components inject TranslateService when needed
    - **Validates: Requirements 10.2**
  
  - [ ]* 12.4 Write property test for unnecessary imports
    - **Property 9**: No unnecessary translation imports
    - **Validates: Requirements 10.4**
  
  - [ ]* 12.5 Write property test for accessibility attributes
    - **Property 2**: Accessibility attributes use translation keys (all modules)
    - **Validates: Requirements 11.1, 11.2, 11.3**

- [ ] 13. Write unit tests for critical examples
  - [ ]* 13.1 Write unit test for clock-in dialog translation
    - Test that clock-in dialog renders with translated text
    - Test in both English and Spanish
    - _Requirements: 1.1_
  
  - [ ]* 13.2 Write unit test for supplier order form translation
    - Test that supplier order form uses translated placeholders
    - Test parameter interpolation for "Filter by {column}"
    - _Requirements: 3.1, 3.3_
  
  - [ ]* 13.3 Write unit test for audit dialog translation
    - Test that audit dialog displays translated labels
    - Test that system actions show translated "System" text
    - _Requirements: 2.1, 2.2_
  
  - [ ]* 13.4 Write unit test for language switching
    - Test that switching languages updates all visible text
    - Test across multiple components
    - _Requirements: 12.1, 12.2, 12.3_

- [ ] 14. Final verification and cleanup
  - [x] 14.1 Run all property-based tests
    - Execute all property tests across all modules
    - Verify no hardcoded strings remain
    - Verify translation file synchronization
    - _Requirements: 9.1, 9.2, 10.3_
  
  - [x] 14.2 Manual testing across all modules
    - Test language switching in each module
    - Verify visual layout is preserved
    - Test accessibility with screen readers in both languages
    - _Requirements: 11.1, 11.2, 11.3, 12.1, 12.2, 12.3_
  
  - [x] 14.3 Performance verification
    - Measure application load time before and after changes
    - Verify no performance degradation
    - _Requirements: 12.1, 12.2, 12.3_
  
  - [x] 14.4 Update documentation
    - Document translation key naming conventions
    - Provide examples of common patterns
    - Create templates for new components
    - _Requirements: 9.4, 9.5_

- [x] 15. Final checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation
- Implementation follows a phased approach: shared components → high-traffic modules → remaining modules → verification
