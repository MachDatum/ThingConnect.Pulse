/**
 * Manufacturing Analytics Utilities
 * Helper functions for tracking manufacturing-specific KPIs and metrics
 */

import type { LiveStatusItem } from '@/api/types';

export interface ManufacturingKPIs {
  monitoringCoverage: number;
  mttd: number; // Mean Time To Detection (seconds)
  mttr: number; // Mean Time To Recovery (seconds)
  falsePositiveRate: number;
  networkSegments: number;
  criticalEndpoints: number;
  availabilityScore: number;
  alertResponseTime: number;
}

export interface ConfigurationComplexity {
  totalRules: number;
  uniqueProbeTypes: string[];
  customIntervals: number;
  advancedFeatures: string[];
  configSizeKb: number;
  validationErrors: number;
}

export interface UserEfficiencyMetrics {
  tasksCompleted: number;
  avgTaskDuration: number;
  navigationDepth: number;
  helpUsage: number;
  keyboardShortcuts: number;
}

/**
 * Calculate manufacturing KPIs from live status data
 */
export function calculateManufacturingKPIs(
  statusItems: LiveStatusItem[],
  historicalData?: any[]
): ManufacturingKPIs {
  const totalEndpoints = statusItems.length;
  const upEndpoints = statusItems.filter(item => item.status === 'up').length;
  // Count down and flapping endpoints for potential future use
  // const downEndpoints = statusItems.filter(item => item.status === 'down').length;
  // const flappingEndpoints = statusItems.filter(item => item.status === 'flapping').length;

  // Calculate unique network segments (by host/IP patterns)
  const networkSegments = new Set(
    statusItems.map(item => {
      const target = item.endpoint.host;
      // Extract network segment (first 3 octets for IP, or domain for hostnames)
      if (target.match(/^\d+\.\d+\.\d+\.\d+$/)) {
        return target.split('.').slice(0, 3).join('.');
      }
      return target.split('.').slice(-2).join('.');
    })
  ).size;

  // Identify critical endpoints (assumed to be those with custom names or specific groups)
  const criticalEndpoints = statusItems.filter(item => 
    item.endpoint.group?.name?.toLowerCase().includes('critical') ||
    item.endpoint.name?.toLowerCase().includes('critical') ||
    item.endpoint.host.includes('prod') ||
    item.endpoint.host.includes('main')
  ).length;

  return {
    monitoringCoverage: totalEndpoints > 0 ? (upEndpoints / totalEndpoints) * 100 : 0,
    mttd: calculateMTTD(statusItems, historicalData),
    mttr: calculateMTTR(statusItems, historicalData),
    falsePositiveRate: calculateFalsePositiveRate(statusItems, historicalData),
    networkSegments,
    criticalEndpoints,
    availabilityScore: totalEndpoints > 0 ? (upEndpoints / totalEndpoints) * 100 : 0,
    alertResponseTime: calculateAverageAlertResponseTime(historicalData)
  };
}

/**
 * Analyze configuration complexity
 */
export function analyzeConfigurationComplexity(configData: any): ConfigurationComplexity {
  const config = typeof configData === 'string' ? parseYAMLSafely(configData) : configData;
  
  if (!config || typeof config !== 'object') {
    return {
      totalRules: 0,
      uniqueProbeTypes: [],
      customIntervals: 0,
      advancedFeatures: [],
      configSizeKb: 0,
      validationErrors: 0
    };
  }

  const endpoints = config.endpoints || [];
  const probeTypes = new Set<string>();
  const customIntervals = new Set<number>();
  const advancedFeatures: string[] = [];
  
  endpoints.forEach((endpoint: any) => {
    if (endpoint.type) probeTypes.add(endpoint.type);
    if (endpoint.interval && endpoint.interval !== 30) {
      customIntervals.add(endpoint.interval);
    }
    
    // Detect advanced features
    if (endpoint.authentication) advancedFeatures.push('authentication');
    if (endpoint.headers) advancedFeatures.push('custom_headers');
    if (endpoint.timeout && endpoint.timeout !== 5) advancedFeatures.push('custom_timeout');
    if (endpoint.retries && endpoint.retries > 1) advancedFeatures.push('retry_logic');
    if (endpoint.ssl_verify === false) advancedFeatures.push('ssl_bypass');
  });

  const configSize = typeof configData === 'string' ? 
    new Blob([configData]).size / 1024 : 
    JSON.stringify(config).length / 1024;

  return {
    totalRules: endpoints.length,
    uniqueProbeTypes: Array.from(probeTypes),
    customIntervals: customIntervals.size,
    advancedFeatures: [...new Set(advancedFeatures)],
    configSizeKb: Math.round(configSize * 100) / 100,
    validationErrors: 0 // Would be populated by validation logic
  };
}

/**
 * Track user efficiency metrics
 */
export function trackUserEfficiency(): UserEfficiencyMetrics {
  const sessionStart = sessionStorage.getItem('session_start_time');
  const tasksCompleted = parseInt(sessionStorage.getItem('tasks_completed') || '0', 10);
  const helpUsage = parseInt(sessionStorage.getItem('help_usage_count') || '0', 10);
  
  const sessionDuration = sessionStart ? 
    (Date.now() - parseInt(sessionStart, 10)) / 1000 : 0;

  return {
    tasksCompleted,
    avgTaskDuration: tasksCompleted > 0 ? sessionDuration / tasksCompleted : 0,
    navigationDepth: getNavigationDepth(),
    helpUsage,
    keyboardShortcuts: 0 // Would track keyboard usage
  };
}

/**
 * Calculate Mean Time to Detection (MTTD)
 */
function calculateMTTD(statusItems: LiveStatusItem[], _historicalData?: any[]): number {
  // This would analyze historical data to determine detection times
  // For now, return a reasonable estimate based on probe intervals
  const avgInterval = statusItems.reduce((sum, item) => sum + (item.endpoint.intervalSeconds || 30), 0) / statusItems.length;
  return avgInterval || 30;
}

/**
 * Calculate Mean Time to Recovery (MTTR)
 */
function calculateMTTR(_statusItems: LiveStatusItem[], _historicalData?: any[]): number {
  // This would analyze historical outage data to calculate recovery times
  // For now, return a manufacturing-typical MTTR
  return 300; // 5 minutes default
}

/**
 * Calculate false positive rate
 */
function calculateFalsePositiveRate(statusItems: LiveStatusItem[], _historicalData?: any[]): number {
  // This would analyze flapping endpoints and quick state changes
  const flappingCount = statusItems.filter(item => item.status === 'flapping').length;
  return statusItems.length > 0 ? (flappingCount / statusItems.length) * 100 : 0;
}

/**
 * Calculate average alert response time
 */
function calculateAverageAlertResponseTime(_historicalData?: any[]): number {
  // This would analyze historical alert acknowledgment times
  return 120; // 2 minutes default
}

/**
 * Get current navigation depth
 */
function getNavigationDepth(): number {
  const path = window.location.pathname;
  return (path.match(/\//g) || []).length - 1;
}

/**
 * Safely parse YAML-like configuration
 */
function parseYAMLSafely(yamlString: string): any {
  try {
    // Simple YAML-like parsing - in production would use proper YAML parser
    return JSON.parse(yamlString);
  } catch {
    return null;
  }
}

/**
 * Increment task completion counter
 */
export function incrementTaskCompletion(taskType: string): void {
  const current = parseInt(sessionStorage.getItem('tasks_completed') || '0', 10);
  sessionStorage.setItem('tasks_completed', (current + 1).toString());
  sessionStorage.setItem(`last_task_${taskType}`, Date.now().toString());
}

/**
 * Increment help usage counter
 */
export function incrementHelpUsage(): void {
  const current = parseInt(sessionStorage.getItem('help_usage_count') || '0', 10);
  sessionStorage.setItem('help_usage_count', (current + 1).toString());
}

/**
 * Initialize session tracking
 */
export function initializeSessionTracking(): void {
  if (!sessionStorage.getItem('session_start_time')) {
    sessionStorage.setItem('session_start_time', Date.now().toString());
  }
}