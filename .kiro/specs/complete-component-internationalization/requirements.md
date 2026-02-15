# Complete Component Internationalization

## Overview
Ensure all dashboard and report components use the translation system (ngx-translate) instead of hardcoded strings. This will enable full multi-language support (English/Spanish) throughout the application.

## Background
- Translation files (en.json, es.json) already contain comprehensive translations
- Some components have been partially updated
- Need to systematically update all remaining hardcoded strings

## User Stories

### 1. Dashboard Internationalization
**As a** user  
**I want** the dashboard to display in my selected language  
**So that** I can understand all metrics, charts, and data in my preferred language

**Acceptance Criteria:**
- 1.1: All dashboard text (titles, labels, buttons) uses translation keys
- 1.2: Chart headers and labels are translated
- 1.3: Table headers and empty states are translated
- 1.4: All button labels use translations
- 1.5: Dashboard displays correctly in both English and Spanish

### 2. Sales Report Internationalization
**As a** user  
**I want** the sales report to display in my selected language  
**So that** I can analyze sales data in my preferred language

**Acceptance Criteria:**
- 2.1: Report title and toolbar labels are translated
- 2.2: Date range labels (Start Date, End Date) use translations
- 2.3: Chart titles and labels are translated
- 2.4: Table headers and data labels are translated
- 2.5: Button labels (Export PDF, Apply, Clear) use translations
- 2.6: Empty states and messages are translated

### 3. Inventory Report Internationalization
**As a** user  
**I want** the inventory report to display in my selected language  
**So that** I can manage inventory in my preferred language

**Acceptance Criteria:**
- 3.1: Report title and metric cards are translated
- 3.2: Chart headers are translated
- 3.3: Filter buttons (All, Low Stock, Critical) use translations
- 3.4: Table headers and status labels are translated
- 3.5: Category dropdown placeholder is translated
- 3.6: Empty states are translated

### 4. Financial Report Internationalization
**As a** user  
**I want** the financial report to display in my selected language  
**So that** I can review financial data in my preferred language

**Acceptance Criteria:**
- 4.1: Report title and metric cards are translated
- 4.2: Chart titles are translated
- 4.3: Table headers (Period, Revenue, Expenses, etc.) are translated
- 4.4: Toolbar labels and buttons are translated
- 4.5: Empty states are translated
- 4.6: PDF export content uses translations

### 5. Employees Report Internationalization
**As a** user  
**I want** the employees report to display in my selected language  
**So that** I can review employee performance in my preferred language

**Acceptance Criteria:**
- 5.1: Report title and metric cards are translated
- 5.2: Chart titles are translated
- 5.3: Table headers are translated
- 5.4: Toolbar labels and buttons are translated
- 5.5: Empty states are translated
- 5.6: PDF export content uses translations

### 6. Customers Report Internationalization
**As a** user  
**I want** the customers report to display in my selected language  
**So that** I can analyze customer data in my preferred language

**Acceptance Criteria:**
- 6.1: Report title and toolbar labels are translated
- 6.2: Chart titles are translated
- 6.3: Table headers and ranking labels are translated
- 6.4: Filter dropdown labels are translated
- 6.5: Empty states are translated

## Technical Requirements

### Translation Keys Required
All necessary translation keys already exist in:
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`

### Components to Update
1. `src/app/features/dashboard/dashboard.ts` (partially complete)
2. `src/app/features/reports/components/sales-report/sales-report.ts`
3. `src/app/features/reports/components/inventory-report/inventory-report.ts`
4. `src/app/features/reports/components/financial-report/financial-report.ts`
5. `src/app/features/reports/components/employees-report/employees-report.ts`
6. `src/app/features/reports/components/customers-report/customers-report.ts`

### Implementation Pattern
Each component must:
1. Import `TranslateModule` from `@ngx-translate/core`
2. Add `TranslateModule` to component imports array
3. Replace hardcoded strings with translation pipe: `{{ 'key' | translate }}`
4. Use attribute binding for dynamic attributes: `[label]="'key' | translate"`
5. Maintain existing functionality and styling

## Out of Scope
- Creating new translation keys (all keys already exist)
- Modifying translation file structure
- Adding new languages beyond English and Spanish
- Changing component logic or functionality

## Success Criteria
- All hardcoded strings in dashboard and report components are replaced with translation keys
- Components display correctly in both English and Spanish
- All existing tests pass
- No linting errors
- Application builds successfully
- No visual regressions in component rendering

## Dependencies
- ngx-translate library (already installed and configured)
- Translation files (already complete)
- TranslateModule (already available)

## Notes
- Dashboard component is partially complete (title, refresh button, metric cards done)
- Chart labels in TypeScript code may need special handling
- Empty state messages need translation
- PDF export content should also use translations where applicable
