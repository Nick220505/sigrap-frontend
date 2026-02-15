# Implementation Plan: Complete Component Internationalization

## Overview

This plan systematically completes the internationalization of dashboard and report components by replacing all hardcoded strings with translation keys from the existing ngx-translate system. Each task builds incrementally, starting with the partially complete dashboard and then moving through each report component.

## Tasks

- [ ] 1. Complete Dashboard Component Internationalization
  - [x] 1.1 Replace remaining chart headers with translation keys
    - Update "Inventory Levels by Category" to use `dashboard.inventoryLevelsByCategory`
    - Update "Sales by Customer" chart header
    - Ensure chart cards use `[header]` attribute binding
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Replace table headers with translation keys
    - Update "Products with Critical Stock" table headers (Product, Category, Current Stock, Stock Level)
    - Update "Recent Sales" table headers (Date, Customer, Items, Total)
    - Use translation pipe in `<th>` elements
    - _Requirements: 1.1, 1.3_

  - [x] 1.3 Replace empty state messages with translation keys
    - Update "No products with critical stock." message
    - Update "No recent sales." message
    - Add translation keys to en.json/es.json if needed
    - _Requirements: 1.3_

  - [x] 1.4 Replace button labels with translation keys
    - Update "View Inventory Report" and "View Sales Report" buttons
    - Update bottom navigation buttons (Sales Report, Inventory Report, Financial Report, Employees Report, Customers Report)
    - Use `[label]` attribute binding for all buttons
    - _Requirements: 1.4_

  - [ ]* 1.5 Test dashboard in both languages
    - Verify all text displays correctly in English
    - Switch to Spanish and verify all text updates
    - Check for visual regressions
    - Verify no console errors
    - _Requirements: 1.5_

- [x] 2. Checkpoint - Verify dashboard completion
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 3. Internationalize Sales Report Component
  - [x] 3.1 Add TranslateModule import to component
    - Import TranslateModule from '@ngx-translate/core'
    - Add to component imports array
    - _Requirements: 2.1_

  - [x] 3.2 Replace report title and toolbar labels
    - Update "Sales Trend" title to use `reports.salesTrend`
    - Update "Start Date:" and "End Date:" labels
    - Update button labels (Apply, Clear, Export PDF)
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 3.3 Replace chart titles and labels
    - Update chart headers with translation keys
    - Ensure proper attribute binding for chart cards
    - _Requirements: 2.3_

  - [x] 3.4 Replace table headers and data labels
    - Update all table column headers
    - Use translation pipe in `<th>` elements
    - _Requirements: 2.4_

  - [x] 3.5 Replace empty states and messages
    - Update empty state messages with translation keys
    - Add keys to translation files if needed
    - _Requirements: 2.6_

  - [ ]* 3.6 Test sales report in both languages
    - Verify English display
    - Verify Spanish display
    - Check date formatting
    - Verify PDF export works
    - _Requirements: 2.6_

- [ ] 4. Internationalize Inventory Report Component
  - [x] 4.1 Add TranslateModule import to component
    - Import TranslateModule from '@ngx-translate/core'
    - Add to component imports array
    - _Requirements: 3.1_

  - [x] 4.2 Replace report title and metric cards
    - Update report title to use `reports.inventoryReport`
    - Update metric card labels (Inventory Value, Low Stock Items, etc.)
    - _Requirements: 3.1_

  - [x] 4.3 Replace chart headers and filter buttons
    - Update chart headers with translation keys
    - Update filter buttons (All, Low Stock, Critical)
    - _Requirements: 3.2, 3.3_

  - [x] 4.4 Replace table headers and status labels
    - Update table column headers
    - Update status labels if applicable
    - _Requirements: 3.4_

  - [x] 4.5 Replace category dropdown and empty states
    - Update category dropdown placeholder
    - Update empty state messages
    - _Requirements: 3.5, 3.6_

  - [ ]* 4.6 Test inventory report in both languages
    - Verify English display
    - Verify Spanish display
    - Test filter functionality
    - Check category dropdown
    - _Requirements: 3.6_

- [x] 5. Checkpoint - Verify reports progress
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Internationalize Financial Report Component
  - [x] 6.1 Add TranslateModule import to component
    - Import TranslateModule from '@ngx-translate/core'
    - Add to component imports array
    - _Requirements: 4.1_

  - [x] 6.2 Replace report title and metric cards
    - Update report title to use `reports.financialReports`
    - Update metric cards (Revenue, Expenses, Net Profit, Profit Margin)
    - _Requirements: 4.1_

  - [x] 6.3 Replace chart titles
    - Update all chart headers with translation keys
    - Ensure proper attribute binding
    - _Requirements: 4.2_

  - [x] 6.4 Replace table headers
    - Update table headers (Period, Revenue, Expenses, Profit, Margin)
    - Use translation pipe in `<th>` elements
    - _Requirements: 4.3_

  - [x] 6.5 Replace toolbar labels and empty states
    - Update toolbar button labels
    - Update empty state messages
    - _Requirements: 4.4, 4.5_

  - [x] 6.6 Update PDF export content
    - Ensure PDF export uses translated strings
    - May require TranslateService for programmatic translation
    - _Requirements: 4.6_

  - [ ]* 6.7 Test financial report in both languages
    - Verify English display
    - Verify Spanish display
    - Test PDF export in both languages
    - Check calculations display correctly
    - _Requirements: 4.5, 4.6_

- [ ] 7. Internationalize Employees Report Component
  - [x] 7.1 Add TranslateModule import to component
    - Import TranslateModule from '@ngx-translate/core'
    - Add to component imports array
    - _Requirements: 5.1_

  - [x] 7.2 Replace report title and metric cards
    - Update report title to use `reports.employeePerformance`
    - Update metric card labels
    - _Requirements: 5.1_

  - [x] 7.3 Replace chart titles
    - Update chart headers with translation keys
    - Ensure proper attribute binding
    - _Requirements: 5.2_

  - [x] 7.4 Replace table headers
    - Update all table column headers
    - Use translation pipe in `<th>` elements
    - _Requirements: 5.3_

  - [x] 7.5 Replace toolbar labels and empty states
    - Update toolbar button labels
    - Update empty state messages
    - _Requirements: 5.4, 5.5_

  - [x] 7.6 Update PDF export content
    - Ensure PDF export uses translated strings
    - May require TranslateService for programmatic translation
    - _Requirements: 5.6_

  - [ ]* 7.7 Test employees report in both languages
    - Verify English display
    - Verify Spanish display
    - Test PDF export in both languages
    - Verify employee data displays correctly
    - _Requirements: 5.5, 5.6_

- [ ] 8. Internationalize Customers Report Component
  - [x] 8.1 Add TranslateModule import to component
    - Import TranslateModule from '@ngx-translate/core'
    - Add to component imports array
    - _Requirements: 6.1_

  - [x] 8.2 Replace report title and toolbar labels
    - Update report title to use `reports.frequentCustomerRanking`
    - Update toolbar labels
    - _Requirements: 6.1_

  - [x] 8.3 Replace chart titles
    - Update chart headers with translation keys
    - Ensure proper attribute binding
    - _Requirements: 6.2_

  - [x] 8.4 Replace table headers and ranking labels
    - Update table column headers
    - Update ranking labels if applicable
    - _Requirements: 6.3_

  - [x] 8.5 Replace filter dropdown and empty states
    - Update filter dropdown labels
    - Update empty state messages
    - _Requirements: 6.4, 6.5_

  - [ ]* 8.6 Test customers report in both languages
    - Verify English display
    - Verify Spanish display
    - Test filter functionality
    - Verify customer rankings display correctly
    - _Requirements: 6.5_

- [ ] 9. Final Integration and Verification
  - [x] 9.1 Run build verification
    - Execute `ng build` to ensure no compilation errors
    - Verify no TypeScript errors
    - Check for any missing imports
    - _Requirements: All_

  - [x] 9.2 Run linter
    - Execute linter to ensure code quality
    - Fix any linting issues
    - Ensure consistent code style
    - _Requirements: All_

  - [ ]* 9.3 Comprehensive manual testing
    - Test all 6 components in English
    - Test all 6 components in Spanish
    - Verify language switching works without refresh
    - Check for visual regressions
    - Verify all charts, tables, and buttons work correctly
    - Test PDF exports where applicable
    - _Requirements: All_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- The dashboard is partially complete, so task 1 focuses only on remaining items
- All translation keys already exist in en.json and es.json files
- Follow the established pattern: `{{ 'key' | translate }}` for text, `[attribute]="'key' | translate"` for attributes
- TranslateModule must be imported in each component that uses translations
- Chart dataset labels can remain in English as they serve as internal identifiers
- PDF export may require TranslateService for programmatic string translation
