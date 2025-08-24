/**
 * Test identifiers for Playwright/E2E testing
 * Centralized constants to ensure consistency across tests
 */
export const testIds = {
  // Layout components
  layout: {
    appShell: 'app-shell',
    mainLayout: 'main-layout',
    navigationSidebar: 'navigation-sidebar',
    pageContent: 'page-content',
    mobileOverlay: 'mobile-overlay',
  },

  // Header components
  header: {
    container: 'header',
    mobileMenuButton: 'mobile-menu-button',
    logoSection: 'logo-section',
    thingconnectLogo: 'thingconnect-logo',
    appTitle: 'app-title',
    appDescription: 'app-description',
    headerControls: 'header-controls',
    connectionStatus: 'connection-status',
    lastRefreshTime: 'last-refresh-time',
    themeToggle: 'theme-toggle',
  },

  // Navigation components
  navigation: {
    container: 'navigation',
    brandSection: 'brand-section',
    thingconnectIcon: 'thingconnect-icon',
    brandName: 'brand-name',
    brandSubtitle: 'brand-subtitle',
    navigationItems: 'navigation-items',
    navItemDashboard: 'nav-item-dashboard',
    navItemHistory: 'nav-item-history',
    navItemConfig: 'nav-item-config',
    navItemSettings: 'nav-item-settings',
    systemStatus: 'system-status',
  },

  // Footer components
  footer: {
    container: 'footer',
    appVersion: 'app-version',
    appDescription: 'app-description',
  },

  // Page containers (to be added by each page)
  pages: {
    dashboard: 'dashboard-page',
    history: 'history-page',
    config: 'config-page',
    settings: 'settings-page',
    endpointDetail: 'endpoint-detail-page',
    notFound: 'not-found-page',
  },

  // Common UI components
  common: {
    loadingSpinner: 'loading-spinner',
    errorBoundary: 'error-boundary',
    suspenseFallback: 'suspense-fallback',
  },
} as const

// Type for all test IDs for TypeScript safety
export type TestId = typeof testIds[keyof typeof testIds][keyof typeof testIds[keyof typeof testIds]]

// Helper function to get nested test IDs
export function getTestId(category: keyof typeof testIds, key: string): string {
  const categoryObj = testIds[category] as Record<string, string>
  return categoryObj[key] || `${String(category)}-${key}`
}

// Playwright selector helpers
export const selectors = {
  byTestId: (testId: string) => `[data-testid="${testId}"]`,
  byAriaLabel: (label: string) => `[aria-label="${label}"]`,
  byRole: (role: string, name?: string) => 
    name ? `[role="${role}"][aria-label="${name}"]` : `[role="${role}"]`,
} as const