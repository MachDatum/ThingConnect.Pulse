# Testing Conventions for ThingConnect Pulse React Frontend

## Overview
This document defines the conventions and best practices for making the ThingConnect Pulse React application testable with Playwright while maintaining the highest standards for accessibility and semantic HTML.

## Core Principles

### 1. Accessibility First
- Every testable element should also improve accessibility
- Use semantic HTML and ARIA attributes appropriately
- Test identifiers should complement, not replace, accessibility features

### 2. Consistency
- Follow naming conventions consistently across the application
- Use predictable patterns for similar UI elements
- Maintain a single source of truth for test selectors

### 3. Maintainability
- Test selectors should be resilient to UI changes
- Avoid coupling tests to implementation details
- Prefer semantic selectors over arbitrary IDs

## Testing Attributes

### data-testid Convention

#### Naming Pattern
```
[component]-[element]-[modifier]
```

#### Examples
```tsx
data-testid="login-form"
data-testid="login-username-input"
data-testid="dashboard-filter-status"
data-testid="endpoint-card-${endpointId}"
data-testid="nav-link-dashboard"
```

#### Categories

##### Page Level
- `data-testid="page-[name]"` - Main page container
- `data-testid="page-header-[name]"` - Page header section
- `data-testid="page-content-[name]"` - Main content area

##### Navigation
- `data-testid="nav-main"` - Main navigation container
- `data-testid="nav-link-[destination]"` - Navigation links
- `data-testid="nav-menu-[name]"` - Dropdown menus
- `data-testid="breadcrumb-[level]"` - Breadcrumb items

##### Forms
- `data-testid="form-[name]"` - Form containers
- `data-testid="input-[fieldname]"` - Input fields
- `data-testid="select-[fieldname]"` - Select dropdowns
- `data-testid="checkbox-[fieldname]"` - Checkboxes
- `data-testid="radio-[fieldname]-[value]"` - Radio buttons
- `data-testid="button-[action]"` - Buttons
- `data-testid="error-[fieldname]"` - Error messages
- `data-testid="validation-[fieldname]"` - Validation messages

##### Data Display
- `data-testid="table-[name]"` - Tables
- `data-testid="row-[identifier]"` - Table rows
- `data-testid="cell-[column]-[row]"` - Table cells
- `data-testid="card-[identifier]"` - Card components
- `data-testid="list-[name]"` - Lists
- `data-testid="list-item-[identifier]"` - List items

##### Interactive Elements
- `data-testid="modal-[name]"` - Modals
- `data-testid="dialog-[name]"` - Dialogs
- `data-testid="drawer-[name]"` - Drawers
- `data-testid="accordion-[name]"` - Accordions
- `data-testid="tab-[name]"` - Tabs
- `data-testid="tooltip-[name]"` - Tooltips

##### Status Indicators
- `data-testid="status-[type]-[identifier]"` - Status badges
- `data-testid="alert-[type]"` - Alert messages
- `data-testid="notification-[type]"` - Notifications
- `data-testid="loading-[context]"` - Loading indicators
- `data-testid="progress-[name]"` - Progress bars

## ARIA Attributes

### Required ARIA Roles

#### Landmark Roles
```tsx
role="banner"        // Header/top section
role="navigation"    // Navigation menus
role="main"          // Main content area
role="complementary" // Sidebar content
role="contentinfo"   // Footer
role="search"        // Search sections
```

#### Widget Roles
```tsx
role="button"        // Clickable elements that aren't <button>
role="link"          // Clickable elements that navigate
role="tab"           // Tab navigation
role="tabpanel"      // Tab content
role="dialog"        // Modal dialogs
role="alert"         // Important messages
role="status"        // Status messages
role="progressbar"   // Progress indicators
```

#### Document Structure
```tsx
role="list"          // Lists
role="listitem"      // List items
role="table"         // Tables
role="row"           // Table rows
role="cell"          // Table cells
role="heading"       // Headings (with aria-level)
```

### ARIA States and Properties

#### Interactive States
```tsx
aria-expanded="true|false"    // Collapsible sections
aria-selected="true|false"    // Selectable items
aria-checked="true|false"     // Checkboxes
aria-pressed="true|false"     // Toggle buttons
aria-disabled="true|false"    // Disabled elements
aria-hidden="true|false"      // Hidden elements
aria-busy="true|false"        // Loading states
```

#### Descriptive Properties
```tsx
aria-label="Description"           // Accessible name
aria-labelledby="id"              // Reference to label
aria-describedby="id"             // Additional description
aria-live="polite|assertive"     // Dynamic content
aria-current="page|step|location" // Current item in set
aria-invalid="true|false"         // Validation state
aria-errormessage="id"            // Error message reference
```

## Implementation Examples

### Login Form Example
```tsx
<form
  data-testid="login-form"
  role="form"
  aria-label="User login"
  onSubmit={handleSubmit}
>
  <div>
    <label htmlFor="username">Username</label>
    <input
      id="username"
      data-testid="input-username"
      type="text"
      aria-required="true"
      aria-invalid={errors.username ? "true" : "false"}
      aria-describedby={errors.username ? "username-error" : undefined}
    />
    {errors.username && (
      <span
        id="username-error"
        data-testid="error-username"
        role="alert"
      >
        {errors.username}
      </span>
    )}
  </div>

  <button
    data-testid="button-submit"
    type="submit"
    aria-busy={isLoading}
    disabled={isLoading}
  >
    {isLoading ? "Signing in..." : "Sign In"}
  </button>
</form>
```

### Navigation Example
```tsx
<nav
  data-testid="nav-main"
  role="navigation"
  aria-label="Main navigation"
>
  <ul role="list">
    {navItems.map(item => (
      <li
        key={item.path}
        role="listitem"
      >
        <Link
          to={item.path}
          data-testid={`nav-link-${item.id}`}
          aria-current={isActive ? "page" : undefined}
        >
          {item.label}
        </Link>
      </li>
    ))}
  </ul>
</nav>
```

### Status Card Example
```tsx
<div
  data-testid={`endpoint-card-${endpoint.id}`}
  role="article"
  aria-label={`Status for ${endpoint.name}`}
>
  <h3>{endpoint.name}</h3>
  <div
    data-testid={`status-indicator-${endpoint.id}`}
    role="status"
    aria-live="polite"
    aria-label={`Current status: ${endpoint.status}`}
  >
    <Badge color={getStatusColor(endpoint.status)}>
      {endpoint.status}
    </Badge>
  </div>
</div>
```

### Modal Dialog Example
```tsx
<Dialog
  data-testid="modal-confirm-delete"
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  aria-modal="true"
>
  <DialogHeader>
    <DialogTitle id="dialog-title">Confirm Delete</DialogTitle>
  </DialogHeader>
  <DialogBody id="dialog-description">
    Are you sure you want to delete this endpoint?
  </DialogBody>
  <DialogFooter>
    <Button
      data-testid="button-cancel"
      onClick={onClose}
    >
      Cancel
    </Button>
    <Button
      data-testid="button-confirm"
      onClick={handleDelete}
      aria-busy={isDeleting}
    >
      Delete
    </Button>
  </DialogFooter>
</Dialog>
```

## Utility Functions

### Test ID Generator
```typescript
// utils/testUtils.ts
export const testId = {
  // Page elements
  page: (name: string) => `page-${name}`,
  pageHeader: (name: string) => `page-header-${name}`,
  pageContent: (name: string) => `page-content-${name}`,

  // Navigation
  nav: (name: string = 'main') => `nav-${name}`,
  navLink: (destination: string) => `nav-link-${destination}`,

  // Forms
  form: (name: string) => `form-${name}`,
  input: (field: string) => `input-${field}`,
  select: (field: string) => `select-${field}`,
  button: (action: string) => `button-${action}`,
  error: (field: string) => `error-${field}`,

  // Data display
  table: (name: string) => `table-${name}`,
  row: (id: string | number) => `row-${id}`,
  card: (id: string | number) => `card-${id}`,

  // Status
  status: (type: string, id?: string | number) =>
    id ? `status-${type}-${id}` : `status-${type}`,

  // Dynamic elements
  dynamic: (component: string, id: string | number) =>
    `${component}-${id}`,
};

// Usage
<input data-testid={testId.input('username')} />
<div data-testid={testId.card(endpoint.id)} />
```

### ARIA Helpers
```typescript
// utils/ariaUtils.ts
export const ariaUtils = {
  // Form field helpers
  fieldProps: (field: string, errors: Record<string, string>) => ({
    'aria-invalid': errors[field] ? 'true' : 'false',
    'aria-describedby': errors[field] ? `${field}-error` : undefined,
    'aria-required': 'true',
  }),

  // Loading state helpers
  loadingProps: (isLoading: boolean) => ({
    'aria-busy': isLoading,
    'aria-live': 'polite',
  }),

  // Selection helpers
  selectionProps: (isSelected: boolean) => ({
    'aria-selected': isSelected,
    'aria-current': isSelected ? 'true' : undefined,
  }),
};
```

## Testing Best Practices

### 1. Selector Priority (Playwright Testing Library)
1. **Role selectors**: `getByRole('button', { name: 'Submit' })`
2. **Label text**: `getByLabelText('Username')`
3. **Placeholder text**: `getByPlaceholderText('Enter username')`
4. **Text content**: `getByText('Welcome')`
5. **Display value**: `getByDisplayValue('test@example.com')`
6. **Alt text**: `getByAltText('Company logo')`
7. **Title**: `getByTitle('Close dialog')`
8. **Test ID**: `getByTestId('login-form')` (last resort)

### 2. Writing Resilient Tests
```typescript
// Good - Uses semantic queries
await page.getByRole('navigation', { name: 'Main' })
  .getByRole('link', { name: 'Dashboard' })
  .click();

// Good - Uses accessible name
await page.getByRole('button', { name: 'Sign In' }).click();

// Acceptable - When no semantic option exists
await page.getByTestId('complex-chart-widget').click();

// Bad - Too brittle
await page.locator('.btn.btn-primary:nth-child(2)').click();
```

### 3. Waiting for Elements
```typescript
// Wait for element to be visible
await expect(page.getByRole('alert')).toBeVisible();

// Wait for loading to complete
await expect(page.getByRole('progressbar')).toBeHidden();

// Wait for specific text
await expect(page.getByTestId('status-indicator'))
  .toHaveText('Online');
```

### 4. Form Interaction
```typescript
// Fill form using labels
await page.getByLabel('Username').fill('testuser');
await page.getByLabel('Password').fill('password123');

// Check validation
await page.getByRole('button', { name: 'Submit' }).click();
await expect(page.getByRole('alert'))
  .toContainText('Invalid credentials');
```

## Component Checklist

Before considering a component test-ready, ensure:

- [ ] All interactive elements have appropriate `data-testid`
- [ ] Form inputs have proper labels or aria-label
- [ ] Buttons have descriptive text or aria-label
- [ ] Dynamic content has aria-live regions
- [ ] Error messages have role="alert"
- [ ] Loading states have aria-busy
- [ ] Navigation has proper ARIA landmarks
- [ ] Modals have proper focus management
- [ ] Tables have proper structure roles
- [ ] Status indicators have role="status"

## Migration Strategy

### Phase 1: Critical User Paths
1. Authentication flow (login, logout)
2. Main navigation
3. Dashboard status display
4. Core CRUD operations

### Phase 2: Forms and Inputs
1. All form components
2. Validation messages
3. Field-level interactions
4. Submit/cancel actions

### Phase 3: Data Display
1. Tables and lists
2. Cards and status displays
3. Charts and visualizations
4. Pagination controls

### Phase 4: Advanced Interactions
1. Modals and dialogs
2. Tooltips and popovers
3. Drag and drop
4. Complex filtering

## Maintenance Guidelines

1. **Review Process**: All PRs must include test IDs for new components
2. **Documentation**: Update this guide when adding new patterns
3. **Consistency Check**: Regular audits for naming consistency
4. **Accessibility Testing**: Use axe-core in Playwright tests
5. **Visual Regression**: Consider adding visual regression tests for critical UI

## Resources

- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [MDN ARIA Documentation](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA)