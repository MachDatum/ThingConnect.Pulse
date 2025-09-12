import { getAnalyticsService } from './useAnalyticsConsentInit';

export function useAnalytics() {
  const analytics = getAnalyticsService();

  const trackPageView = (pageName: string, properties?: Record<string, unknown>) => {
    analytics.track('Page View', {
      page_name: pageName,
      timestamp: new Date().toISOString(),
      session_duration: performance.now(),
      ...properties
    });
  };

  const trackFeatureUsage = (featureName: string, action: string, properties?: Record<string, unknown>) => {
    analytics.track('Feature Used', {
      feature_name: featureName,
      action,
      timestamp: new Date().toISOString(),
      ...properties
    });
  };

  const trackMonitoringAction = (action: string, properties?: Record<string, unknown>) => {
    analytics.track('Monitoring Action', {
      action,
      timestamp: new Date().toISOString(),
      ...properties
    });
  };

  const trackConfigurationChange = (changeType: string, properties?: Record<string, unknown>) => {
    analytics.track('Configuration Changed', {
      change_type: changeType,
      timestamp: new Date().toISOString(),
      ...properties
    });
  };

  const trackDashboardInteraction = (interactionType: string, properties?: Record<string, unknown>) => {
    analytics.track('Dashboard Interaction', {
      interaction_type: interactionType,
      timestamp: new Date().toISOString(),
      ...properties
    });
  };

  // Manufacturing-specific tracking methods
  const trackEndpointManagement = (action: string, endpointData?: Record<string, unknown>) => {
    analytics.track('Endpoint Management', {
      action, // 'create', 'update', 'delete', 'test'
      endpoint_type: endpointData?.type,
      probe_interval: endpointData?.interval,
      timeout_seconds: endpointData?.timeout,
      has_authentication: !!endpointData?.authentication,
      timestamp: new Date().toISOString(),
      ...endpointData
    });
  };

  const trackAlertInteraction = (action: string, alertData?: Record<string, unknown>) => {
    analytics.track('Alert Interaction', {
      action, // 'acknowledge', 'resolve', 'escalate', 'view_details'
      alert_severity: alertData?.severity,
      alert_type: alertData?.type,
      response_time_seconds: alertData?.responseTime,
      resolution_method: alertData?.resolutionMethod,
      timestamp: new Date().toISOString()
    });
  };

  const trackSystemMetrics = (metrics: Record<string, unknown>) => {
    analytics.track('System Metrics', {
      total_endpoints: metrics.totalEndpoints,
      active_alerts: metrics.activeAlerts,
      overall_availability: metrics.overallAvailability,
      monitored_services: metrics.monitoredServices,
      data_retention_days: metrics.dataRetentionDays,
      uptime_percentage: metrics.uptimePercentage,
      timestamp: new Date().toISOString()
    });
  };

  const trackPerformanceMetrics = (pageName: string, metrics?: Record<string, unknown>) => {
    analytics.track('Performance Metrics', {
      page_name: pageName,
      load_time_ms: metrics?.loadTime,
      data_fetch_time_ms: metrics?.dataFetchTime,
      render_time_ms: metrics?.renderTime,
      memory_usage_mb: 'memory' in performance ? Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024) : undefined,
      timestamp: new Date().toISOString()
    });
  };

  const trackManufacturingKPIs = (kpiData: Record<string, unknown>) => {
    analytics.track('Manufacturing KPIs', {
      monitoring_coverage_percentage: kpiData.monitoringCoverage,
      mean_time_to_detection_seconds: kpiData.mttd,
      mean_time_to_recovery_seconds: kpiData.mttr,
      false_positive_rate: kpiData.falsePositiveRate,
      network_segments_monitored: kpiData.networkSegments,
      critical_endpoints_count: kpiData.criticalEndpoints,
      timestamp: new Date().toISOString()
    });
  };

  const trackConfigurationComplexity = (configData: Record<string, unknown>) => {
    analytics.track('Configuration Complexity', {
      total_rules: configData.totalRules,
      unique_probe_types: configData.uniqueProbeTypes,
      custom_intervals_count: configData.customIntervals,
      advanced_features_used: configData.advancedFeatures,
      configuration_size_kb: configData.configSizeKb,
      validation_errors: configData.validationErrors,
      timestamp: new Date().toISOString()
    });
  };

  const trackUserEfficiency = (efficiencyData: Record<string, unknown>) => {
    analytics.track('User Efficiency', {
      tasks_completed_per_session: efficiencyData.tasksCompleted,
      average_task_duration_seconds: efficiencyData.avgTaskDuration,
      navigation_depth: efficiencyData.navigationDepth,
      help_usage_count: efficiencyData.helpUsage,
      keyboard_shortcuts_used: efficiencyData.keyboardShortcuts,
      timestamp: new Date().toISOString()
    });
  };

  return {
    track: analytics.track.bind(analytics),
    trackPageView,
    trackFeatureUsage,
    trackMonitoringAction,
    trackConfigurationChange,
    trackDashboardInteraction,
    // Manufacturing-specific methods
    trackEndpointManagement,
    trackAlertInteraction,
    trackSystemMetrics,
    trackPerformanceMetrics,
    trackManufacturingKPIs,
    trackConfigurationComplexity,
    trackUserEfficiency,
    isInitialized: analytics.isInitialized()
  };
}