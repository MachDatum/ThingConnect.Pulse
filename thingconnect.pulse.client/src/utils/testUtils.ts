/**
 * Utility functions for generating consistent test IDs
 * Following the pattern: [component]-[element]-[modifier]
 */
export const testId = {
  // Page elements
  page: (name: string) => `page-${name}`,
  pageHeader: (name: string) => `page-header-${name}`,
  pageContent: (name: string) => `page-content-${name}`,

  // Navigation
  nav: (name: string = 'main') => `nav-${name}`,
  navLink: (destination: string) => `nav-link-${destination}`,
  navMenu: (name: string) => `nav-menu-${name}`,
  breadcrumb: (level: string | number) => `breadcrumb-${level}`,

  // Forms
  form: (name: string) => `form-${name}`,
  input: (field: string) => `input-${field}`,
  select: (field: string) => `select-${field}`,
  checkbox: (field: string) => `checkbox-${field}`,
  radio: (field: string, value: string) => `radio-${field}-${value}`,
  button: (action: string) => `button-${action}`,
  error: (field: string) => `error-${field}`,
  validation: (field: string) => `validation-${field}`,

  // Data display
  table: (name: string) => `table-${name}`,
  row: (id: string | number) => `row-${id}`,
  cell: (column: string, row: string | number) => `cell-${column}-${row}`,
  card: (id: string | number) => `card-${id}`,
  list: (name: string) => `list-${name}`,
  listItem: (id: string | number) => `list-item-${id}`,

  // Interactive elements
  modal: (name: string) => `modal-${name}`,
  dialog: (name: string) => `dialog-${name}`,
  drawer: (name: string) => `drawer-${name}`,
  accordion: (name: string) => `accordion-${name}`,
  tab: (name: string) => `tab-${name}`,
  tooltip: (name: string) => `tooltip-${name}`,

  // Status indicators
  status: (type: string, id?: string | number) =>
    id ? `status-${type}-${id}` : `status-${type}`,
  alert: (type: string) => `alert-${type}`,
  notification: (type: string) => `notification-${type}`,
  loading: (context: string) => `loading-${context}`,
  progress: (name: string) => `progress-${name}`,

  // Dynamic elements
  dynamic: (component: string, id: string | number) => `${component}-${id}`,

  // Custom formatter
  custom: (parts: string[]) => parts.join('-'),
};

/**
 * Type-safe test ID builder
 */
export const buildTestId = (...parts: (string | number | undefined)[]): string => {
  return parts.filter(Boolean).join('-');
};