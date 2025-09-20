/**
 * Utility functions for consistent ARIA attributes
 */

export interface FieldError {
  [field: string]: string | undefined;
}

export const ariaUtils = {
  /**
   * Generate ARIA props for form fields with validation
   */
  fieldProps: (field: string, errors: FieldError = {}, required = false) => {
    const hasError = Boolean(errors[field]);
    return {
      'aria-invalid': hasError ? ('true' as const) : ('false' as const),
      'aria-describedby': hasError ? `${field}-error` : undefined,
      'aria-required': required ? ('true' as const) : undefined,
    };
  },

  /**
   * Generate ARIA props for loading states
   */
  loadingProps: (isLoading: boolean, liveRegion = 'polite' as 'polite' | 'assertive') => ({
    'aria-busy': isLoading,
    'aria-live': liveRegion,
  }),

  /**
   * Generate ARIA props for selection states
   */
  selectionProps: (isSelected: boolean, currentType?: 'page' | 'step' | 'location' | 'true') => ({
    'aria-selected': isSelected,
    'aria-current': isSelected && currentType ? currentType : undefined,
  }),

  /**
   * Generate ARIA props for expandable/collapsible elements
   */
  expandableProps: (isExpanded: boolean, controls?: string) => ({
    'aria-expanded': isExpanded,
    'aria-controls': controls,
  }),

  /**
   * Generate ARIA props for modal dialogs
   */
  modalProps: (titleId: string, descriptionId?: string) => ({
    'aria-modal': true as const,
    'aria-labelledby': titleId,
    'aria-describedby': descriptionId,
  }),

  /**
   * Generate ARIA props for status indicators
   */
  statusProps: (status: string, live = true) => ({
    'aria-label': `Current status: ${status}`,
    'aria-live': live ? ('polite' as const) : undefined,
  }),

  /**
   * Generate ARIA props for navigation items
   */
  navItemProps: (isActive: boolean, label?: string) => ({
    'aria-current': isActive ? ('page' as const) : undefined,
    'aria-label': label,
  }),

  /**
   * Generate ARIA props for form sections
   */
  formSectionProps: (legend: string, required = false) => ({
    'aria-label': legend,
    'aria-required': required ? ('true' as const) : undefined,
  }),

  /**
   * Generate ARIA props for data tables
   */
  tableProps: (caption: string, sortable = false) => ({
    'aria-label': caption,
    'aria-sort': sortable ? ('none' as const) : undefined,
  }),

  /**
   * Generate ARIA props for interactive buttons
   */
  buttonProps: (
    label: string,
    pressed?: boolean,
    disabled = false,
    describedBy?: string
  ) => ({
    'aria-label': label,
    'aria-pressed': pressed !== undefined ? pressed : undefined,
    'aria-disabled': disabled,
    'aria-describedby': describedBy,
  }),
};

/**
 * Common ARIA role constants
 */
export const ARIA_ROLES = {
  // Landmark roles
  BANNER: 'banner' as const,
  NAVIGATION: 'navigation' as const,
  MAIN: 'main' as const,
  COMPLEMENTARY: 'complementary' as const,
  CONTENTINFO: 'contentinfo' as const,
  SEARCH: 'search' as const,
  FORM: 'form' as const,

  // Widget roles
  BUTTON: 'button' as const,
  LINK: 'link' as const,
  TAB: 'tab' as const,
  TABPANEL: 'tabpanel' as const,
  DIALOG: 'dialog' as const,
  ALERT: 'alert' as const,
  STATUS: 'status' as const,
  PROGRESSBAR: 'progressbar' as const,
  MENU: 'menu' as const,
  MENUITEM: 'menuitem' as const,

  // Document structure
  LIST: 'list' as const,
  LISTITEM: 'listitem' as const,
  TABLE: 'table' as const,
  ROW: 'row' as const,
  CELL: 'cell' as const,
  HEADING: 'heading' as const,
  ARTICLE: 'article' as const,
  SECTION: 'section' as const,
} as const;