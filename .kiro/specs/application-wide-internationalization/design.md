# Design Document

## Overview

This design document outlines the approach for completing the internationalization of all remaining components in the application. The solution will systematically replace hardcoded strings with translation keys across approximately 40+ components in the Employee, Configuration, Supplier, Sales, Inventory, Customer modules, and shared components. The design follows the established patterns from the already-internationalized dashboard and reports modules, ensuring consistency across the application.

The internationalization will be implemented using the existing ngx-translate infrastructure, with translations provided in both English (en.json) and Spanish (es.json). The approach prioritizes reusable common translation keys to minimize duplication and maintain consistency.

## Architecture

### Translation System Architecture

The application uses ngx-translate for internationalization with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  │  Templates   │  │  Templates   │  │  Templates   │      │
│  │              │  │              │  │              │      │
│  │ |translate   │  │ |translate   │  │ |translate   │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  TranslateModule / Service                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Translation Resolution Logic                       │    │
│  │  - Key lookup                                       │    │
│  │  - Parameter interpolation                          │    │
│  │  - Fallback handling                                │    │
│  └────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Translation Files                         │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │    en.json       │         │    es.json       │         │
│  │                  │         │                  │         │
│  │  {               │         │  {               │         │
│  │    "common": {   │         │    "common": {   │         │
│  │      "new": ...  │         │      "new": ...  │         │
│  │    },            │         │    },            │         │
│  │    "employees":  │         │    "employees":  │         │
│  │    ...           │         │    ...           │         │
│  │  }               │         │  }               │         │
│  └──────────────────┘         └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### Module Organization

The translation keys are organized by module in the translation files:

- **common**: Shared keys used across multiple modules (buttons, actions, placeholders)
- **employees**: Employee-specific keys (schedules, attendance, clock-in)
- **suppliers**: Supplier-specific keys (catalog, orders)
- **sales**: Sales-specific keys (sales, returns)
- **inventory**: Inventory-specific keys (products, categories)
- **customers**: Customer-specific keys
- **auditLogs**: Configuration/audit-specific keys
- **users**: User management keys

## Components and Interfaces

### Translation Key Naming Convention

Translation keys follow a hierarchical dot-notation structure:

```
<module>.<submodule>.<element>
```

Examples:
- `common.new` - Common "New" button
- `employees.clockIn` - Employee clock-in button
- `suppliers.orders.newOrder` - Supplier orders "New Order" button
- `common.searchPlaceholder` - Common search placeholder

### Component Template Pattern

Components will use the translate pipe in templates:

```html
<!-- Button labels -->
<button>{{ 'common.new' | translate }}</button>

<!-- Placeholders -->
<input [placeholder]="'common.searchPlaceholder' | translate">

<!-- Dialog headers -->
<h2 mat-dialog-title>{{ 'employees.clockIn' | translate }}</h2>

<!-- Accessibility attributes -->
<button [attr.aria-label]="'common.clearAllFilters' | translate">
```

### Parameter Interpolation Pattern

For dynamic text with parameters:

```html
<!-- Template -->
<span>{{ 'common.filterBy' | translate: {field: columnName} }}</span>

<!-- Translation file -->
{
  "common": {
    "filterBy": "Filter by {{field}}"
  }
}
```

### Component Import Pattern

Components using translations must import TranslateModule:

```typescript
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,  // Add this
    // ... other imports
  ],
  templateUrl: './example.component.html'
})
export class ExampleComponent {
  // Component logic
}
```

## Data Models

### Translation File Structure

The translation files (en.json, es.json) follow this structure:

```typescript
interface TranslationFile {
  common: CommonTranslations;
  employees: EmployeeTranslations;
  suppliers: SupplierTranslations;
  sales: SalesTranslations;
  inventory: InventoryTranslations;
  customers: CustomerTranslations;
  auditLogs: AuditLogTranslations;
  users: UserTranslations;
  // ... other modules
}

interface CommonTranslations {
  // Buttons
  new: string;
  export: string;
  retry: string;
  addProduct: string;
  
  // Search and filters
  searchPlaceholder: string;
  selectPlaceholder: string;
  clearAllFilters: string;
  filterBy: string;  // Supports {{field}} parameter
  
  // Existing common keys
  save: string;
  cancel: string;
  delete: string;
  // ... etc
}

interface EmployeeTranslations {
  // Clock-in dialog
  clockInDialog: {
    title: string;
    employeeLabel: string;
    employeePlaceholder: string;
    clockInButton: string;
  };
  
  // Schedule
  schedule: {
    newButton: string;
    exportButton: string;
    retryButton: string;
    selectEmployee: string;
    selectDay: string;
    selectType: string;
  };
  
  // Days
  days: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  
  // Shift types
  shiftTypes: {
    morning: string;
    afternoon: string;
    night: string;
    holiday: string;
  };
  
  // Existing employee keys
  clockIn: string;
  clockOut: string;
  // ... etc
}

interface SupplierTranslations {
  // Orders
  orders: {
    newOrder: string;
    exportButton: string;
    retryButton: string;
    searchPlaceholder: string;
    selectSupplier: string;
    selectProduct: string;
    addProduct: string;
  };
  
  // Catalog
  catalog: {
    newButton: string;
    exportButton: string;
    supplierNamePlaceholder: string;
    addressPlaceholder: string;
    contactNamePlaceholder: string;
    emailPlaceholder: string;
    phonePlaceholder: string;
    alternativePhonePlaceholder: string;
    websitePlaceholder: string;
    productsProvidedPlaceholder: string;
    paymentTermsLabel: string;
    daysLabel: string;
  };
  
  // Existing supplier keys
  suppliers: string;
  createSupplier: string;
  // ... etc
}

interface SalesTranslations {
  // Sales
  sales: {
    newSale: string;
    exportSales: string;
    retryButton: string;
    searchPlaceholder: string;
    selectCustomer: string;
    selectEmployee: string;
    selectProduct: string;
    selectDate: string;
    addProduct: string;
  };
  
  // Returns
  returns: {
    newButton: string;
    exportButton: string;
    retryButton: string;
    searchPlaceholder: string;
    selectOriginalSale: string;
    returnReasonPlaceholder: string;
  };
  
  // Existing sales keys
  createSale: string;
  saleDetails: string;
  // ... etc
}

interface InventoryTranslations {
  // Products
  products: {
    newButton: string;
    exportButton: string;
    retryButton: string;
    searchPlaceholder: string;
    productNamePlaceholder: string;
    descriptionPlaceholder: string;
    selectCategory: string;
  };
  
  // Categories
  categories: {
    newButton: string;
    exportButton: string;
    retryButton: string;
    searchPlaceholder: string;
    categoryNamePlaceholder: string;
  };
  
  // Existing inventory keys
  createProduct: string;
  createCategory: string;
  // ... etc
}

interface CustomerTranslations {
  // Similar structure to other modules
  newButton: string;
  exportButton: string;
  retryButton: string;
  searchPlaceholder: string;
  // ... etc
}

interface AuditLogTranslations {
  // Audit dialog
  auditDialog: {
    title: string;
    entityLabel: string;
    entityIdLabel: string;
    actionLabel: string;
    userLabel: string;
    dateTimeLabel: string;
    previousDataLabel: string;
    newDataLabel: string;
    systemDefault: string;
  };
  
  // Existing audit keys
  auditLogs: string;
  viewLogs: string;
  // ... etc
}
```

### New Translation Keys to Add

Based on the audit report, the following new keys need to be added:

**Common Section:**
```json
{
  "common": {
    "new": "New",
    "retry": "Retry",
    "searchPlaceholder": "Search...",
    "selectPlaceholder": "Select...",
    "clearAllFilters": "Clear all filters",
    "filterBy": "Filter by {{field}}",
    "addProduct": "Add Product"
  }
}
```

**Employee Section:**
```json
{
  "employees": {
    "clockInDialog": {
      "title": "Clock In",
      "employeeLabel": "Employee",
      "employeePlaceholder": "Select an employee",
      "clockInButton": "Clock In"
    },
    "schedule": {
      "newButton": "New",
      "exportButton": "Export",
      "retryButton": "Retry",
      "selectEmployee": "Select an employee",
      "selectDay": "Select a day",
      "selectType": "Select a type"
    },
    "days": {
      "monday": "Monday",
      "tuesday": "Tuesday",
      "wednesday": "Wednesday",
      "thursday": "Thursday",
      "friday": "Friday",
      "saturday": "Saturday",
      "sunday": "Sunday"
    },
    "shiftTypes": {
      "morning": "Morning",
      "afternoon": "Afternoon",
      "night": "Night",
      "holiday": "Holiday"
    }
  }
}
```

**Audit Logs Section:**
```json
{
  "auditLogs": {
    "auditDialog": {
      "title": "Record Details",
      "entityLabel": "Entity",
      "entityIdLabel": "Entity ID",
      "actionLabel": "Action",
      "userLabel": "User",
      "dateTimeLabel": "Date and Time",
      "previousDataLabel": "Previous Data",
      "newDataLabel": "New Data",
      "systemDefault": "System"
    }
  }
}
```

**Supplier Section:**
```json
{
  "suppliers": {
    "orders": {
      "newOrder": "New Order",
      "exportButton": "Export",
      "retryButton": "Retry",
      "searchPlaceholder": "Search...",
      "selectSupplier": "Select a supplier",
      "selectProduct": "Select Product",
      "addProduct": "Add Product"
    },
    "catalog": {
      "newButton": "New",
      "exportButton": "Export",
      "retryButton": "Retry",
      "searchPlaceholder": "Search...",
      "supplierNamePlaceholder": "Supplier name",
      "addressPlaceholder": "Full address",
      "contactNamePlaceholder": "Contact name",
      "emailPlaceholder": "email@example.com",
      "phonePlaceholder": "Phone number",
      "alternativePhonePlaceholder": "Alternative phone",
      "websitePlaceholder": "www.example.com",
      "productsProvidedPlaceholder": "Describe the products or services offered",
      "paymentTermsLabel": "Payment terms",
      "daysLabel": "Days"
    }
  }
}
```

**Sales Section:**
```json
{
  "sales": {
    "sales": {
      "newSale": "New Sale",
      "exportSales": "Export Sales",
      "retryButton": "Retry",
      "searchPlaceholder": "Search...",
      "selectCustomer": "Select Customer",
      "selectEmployee": "Select Employee",
      "selectProduct": "Select Product",
      "selectDate": "Select date",
      "addProduct": "Add Product"
    },
    "returns": {
      "newButton": "New",
      "exportButton": "Export",
      "retryButton": "Retry",
      "searchPlaceholder": "Search...",
      "selectOriginalSale": "Select Original Sale",
      "returnReasonPlaceholder": "Enter the detailed reason for the return..."
    }
  }
}
```

**Inventory Section:**
```json
{
  "inventory": {
    "products": {
      "newButton": "New",
      "exportButton": "Export",
      "retryButton": "Retry",
      "searchPlaceholder": "Search...",
      "productNamePlaceholder": "Enter product name",
      "descriptionPlaceholder": "Enter a description (optional)",
      "selectCategory": "Select a category"
    },
    "categories": {
      "newButton": "New",
      "exportButton": "Export",
      "retryButton": "Retry",
      "searchPlaceholder": "Search...",
      "categoryNamePlaceholder": "Enter category name"
    }
  }
}
```

**Shared Components:**
```json
{
  "common": {
    "selectLanguage": "Select Language"
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: UI Elements Use Translation Keys

*For any* component in the application (Employee, Configuration, Supplier, Sales, Inventory, Customer, or Shared modules), when the component is rendered, all user-visible text elements (buttons, labels, placeholders, dialog headers, table headers, dropdown options) should use translation keys via the translate pipe and should not contain hardcoded strings.

**Validates: Requirements 1.1, 1.2, 1.3, 1.4, 2.1, 2.3, 3.1, 3.2, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 6.1, 6.2, 7.1, 7.2, 7.3**

### Property 2: Accessibility Attributes Use Translation Keys

*For any* component containing accessibility attributes (aria-label, aria-describedby, tooltips), when the component is rendered, all accessibility attribute values should use translation keys and should not contain hardcoded strings.

**Validates: Requirements 3.4, 4.4, 5.4, 6.3, 11.1, 11.2, 11.3**

### Property 3: Translation Key Existence in Both Languages

*For any* translation key used in a component template, that key should exist in both en.json and es.json translation files with the same hierarchical path.

**Validates: Requirements 1.5, 2.4, 3.5, 4.5, 5.5, 6.4, 7.4, 9.1, 9.2, 11.4**

### Property 4: Parameter Interpolation Support

*For any* translation key that includes parameter placeholders (e.g., {{field}}), when the translation is rendered with parameter values, the output should contain both the translated text and the interpolated parameter values.

**Validates: Requirements 3.3, 12.5**

### Property 5: Common Keys for Repeated Text

*For any* text element that appears in multiple components (such as "New", "Export", "Retry", "Search...", "Add Product"), all occurrences should use the same translation key from the common section rather than module-specific keys.

**Validates: Requirements 8.5**

### Property 6: Components Import TranslateModule

*For any* component that uses the translate pipe or TranslateService, that component should have TranslateModule in its imports array.

**Validates: Requirements 10.1**

### Property 7: Components Inject TranslateService When Needed

*For any* component that programmatically accesses translations (not just using the translate pipe in templates), that component should inject TranslateService in its constructor.

**Validates: Requirements 10.2**

### Property 8: No Hardcoded Strings in Components with TranslateModule

*For any* component that imports TranslateModule, that component's template should not contain hardcoded user-visible strings in English or Spanish.

**Validates: Requirements 10.3**

### Property 9: No Unnecessary Translation Imports

*For any* component that does not use translation functionality (no translate pipe, no TranslateService usage), that component should not import TranslateModule.

**Validates: Requirements 10.4**

### Property 10: System Default Text Translation

*For any* audit log entry where the user field is null or represents a system action, the displayed user name should be the translated value of the "System" key, not a hardcoded string.

**Validates: Requirements 2.2**

## Error Handling

### Missing Translation Keys

When a translation key is missing from a translation file, ngx-translate will display the key name as fallback text. This behavior is built into the framework and requires no additional implementation.

**Error Scenario**: Component uses `'employees.newKey' | translate` but the key doesn't exist in en.json.

**Expected Behavior**: The UI will display "employees.newKey" as text.

**Prevention Strategy**: 
- Use automated testing to verify all used keys exist in translation files (Property 3)
- Implement pre-commit hooks to validate translation file completeness
- Use TypeScript interfaces to type-check translation keys where possible

### Parameter Interpolation Errors

When a translation key expects parameters but they are not provided, or wrong parameters are provided, the translation may display incorrectly.

**Error Scenario**: Translation key is `"Filter by {{field}}"` but component uses `{{ 'common.filterBy' | translate }}` without parameters.

**Expected Behavior**: The UI will display "Filter by {{field}}" literally.

**Prevention Strategy**:
- Document which translation keys require parameters
- Use automated testing to verify parameter interpolation (Property 4)
- Add TypeScript types for translation parameters where possible

### Module Import Errors

When a component uses translation functionality but doesn't import TranslateModule, the application will fail at runtime.

**Error Scenario**: Component template uses `{{ 'common.save' | translate }}` but TranslateModule is not in the component's imports array.

**Expected Behavior**: Angular will throw an error: "The pipe 'translate' could not be found"

**Prevention Strategy**:
- Use automated testing to verify module imports (Property 6)
- Use Angular's build-time checks to catch missing imports
- Follow consistent patterns across all components

### Language File Synchronization Errors

When translation keys exist in one language file but not the other, users switching languages will see inconsistent behavior.

**Error Scenario**: Key `employees.newFeature` exists in en.json but not in es.json.

**Expected Behavior**: English users see translated text, Spanish users see the key name.

**Prevention Strategy**:
- Use automated testing to verify key synchronization (Property 3)
- Implement tooling to compare translation file structures
- Use translation management tools that enforce key parity

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** will verify:
- Specific examples of translation key usage in critical components
- Edge cases like empty strings, special characters in translations
- Error conditions like missing keys or malformed parameters
- Integration between components and the translation system

**Property-Based Tests** will verify:
- Universal properties across all components (Properties 1-10)
- Translation key existence across all modules
- Consistent usage of common keys
- Module import correctness across the codebase

### Property-Based Testing Implementation

The property-based tests will be implemented using a combination of:

1. **Static Analysis**: Parse component templates and TypeScript files to extract translation usage
2. **JSON Validation**: Compare translation file structures programmatically
3. **DOM Testing**: Render components and verify translated content in the DOM

**Testing Library**: Custom Node.js scripts for static analysis, combined with Angular testing utilities for component rendering.

**Test Configuration**: Each property test should run with sufficient iterations to cover all modules and components (minimum 100 iterations where applicable, though many tests will be deterministic static analysis).

**Test Tagging**: Each property-based test will include a comment referencing its design property:

```typescript
// Feature: application-wide-internationalization, Property 1: UI Elements Use Translation Keys
it('should use translation keys for all UI elements', () => {
  // Test implementation
});
```

### Unit Testing Approach

Unit tests will focus on:

1. **Critical Component Examples**:
   - Test clock-in dialog renders with translated text
   - Test supplier order form uses translated placeholders
   - Test audit dialog displays translated labels

2. **Parameter Interpolation Examples**:
   - Test "Filter by {{field}}" with various field names
   - Test dynamic content with translation parameters

3. **Edge Cases**:
   - Test components with no user-visible text don't import TranslateModule
   - Test aria-labels are properly translated
   - Test dropdown options use translated values

4. **Integration Tests**:
   - Test language switching updates all visible text
   - Test components maintain functionality after internationalization
   - Test form validation messages are translated

### Testing Coverage Goals

- **Component Coverage**: All 40+ components should be verified for translation usage
- **Translation Key Coverage**: All keys in translation files should be verified as used
- **Module Coverage**: All 7 modules (Employee, Configuration, Supplier, Sales, Inventory, Customer, Shared) should have comprehensive tests
- **Language Coverage**: Both English and Spanish translations should be verified

### Continuous Integration

Tests should be integrated into the CI/CD pipeline to:
- Run on every pull request
- Block merges if translation keys are missing
- Verify translation file synchronization
- Ensure no hardcoded strings are introduced

## Implementation Notes

### Implementation Order

The internationalization should be implemented in phases to minimize risk:

**Phase 1: Common Keys and Shared Components**
- Add common translation keys to translation files
- Internationalize shared components (language switcher, common dialogs)
- Establish patterns for other modules to follow

**Phase 2: High-Traffic Modules**
- Employee module (schedules, attendance, clock-in)
- Sales module (sales, returns)
- Inventory module (products, categories)

**Phase 3: Remaining Modules**
- Supplier module (orders, catalog)
- Customer module
- Configuration module (audit logs, user management)

**Phase 4: Verification and Cleanup**
- Run all property-based tests
- Verify no hardcoded strings remain
- Test language switching across all modules
- Performance testing

### Code Review Checklist

When reviewing internationalization changes, verify:

- [ ] All hardcoded strings are replaced with translation keys
- [ ] Translation keys follow the established naming convention
- [ ] Both en.json and es.json are updated with new keys
- [ ] TranslateModule is imported in components using translations
- [ ] Aria-labels and accessibility attributes are translated
- [ ] Parameter interpolation is used correctly for dynamic text
- [ ] Common keys are used for repeated text across modules
- [ ] No unnecessary TranslateModule imports in components without translations
- [ ] Component functionality is preserved after changes
- [ ] Tests are updated to verify translation usage

### Performance Considerations

Internationalization should not significantly impact performance:

- Translation files are loaded once at application startup
- Translation lookups are cached by ngx-translate
- The translate pipe is optimized for change detection
- No additional HTTP requests are made after initial load

**Monitoring**: Track application load time and rendering performance before and after internationalization to ensure no degradation.

### Accessibility Considerations

Internationalization improves accessibility by:

- Translating aria-labels for screen readers
- Translating aria-describedby content
- Translating tooltip text
- Ensuring all user-visible text is available in multiple languages

**Testing**: Use screen readers in both English and Spanish to verify accessibility attributes are properly translated.

### Maintenance Considerations

To maintain internationalization quality over time:

- Document the translation key naming convention
- Provide examples of common patterns (buttons, placeholders, dialogs)
- Create templates for new components that include translation usage
- Set up automated checks in CI/CD to prevent hardcoded strings
- Establish a process for adding new languages in the future
- Consider using translation management tools for larger scale

### Future Extensibility

The design supports adding additional languages:

1. Create new translation file (e.g., fr.json for French)
2. Copy the structure from en.json
3. Translate all values to the new language
4. Update the language switcher to include the new option
5. No component changes required

The modular structure of translation keys makes it easy to:
- Add new modules with their own translation sections
- Share common keys across modules
- Maintain consistency in translation patterns
- Scale to larger applications
