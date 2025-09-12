# Mixpanel Analytics Usage Examples

This document shows how to use the privacy-first Mixpanel analytics integration in ThingConnect Pulse components.

## Basic Usage

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function Dashboard() {
  const analytics = useAnalytics();

  useEffect(() => {
    // Track page view
    analytics.trackPageView('Dashboard', {
      view_type: 'main_dashboard',
      has_alerts: alertCount > 0
    });
  }, []);

  const handleRefresh = () => {
    // Track feature usage
    analytics.trackFeatureUsage('Dashboard', 'refresh', {
      refresh_type: 'manual',
      endpoints_count: endpointsCount
    });
  };

  return <div>...</div>;
}
```

## Monitoring Actions

```tsx
function EndpointConfiguration() {
  const analytics = useAnalytics();

  const handleAddEndpoint = (endpoint: Endpoint) => {
    analytics.trackMonitoringAction('add_endpoint', {
      endpoint_type: endpoint.type, // 'ICMP', 'TCP', 'HTTP'
      probe_interval: endpoint.interval,
      timeout_seconds: endpoint.timeout
    });
  };

  const handleDeleteEndpoint = (endpointId: string) => {
    analytics.trackMonitoringAction('delete_endpoint', {
      endpoint_id: endpointId // Will be anonymized automatically
    });
  };
}
```

## Configuration Changes

```tsx
function ConfigurationEditor() {
  const analytics = useAnalytics();

  const handleConfigSave = (changes: ConfigChanges) => {
    analytics.trackConfigurationChange('yaml_config_update', {
      sections_changed: changes.sections.length,
      endpoints_added: changes.endpointsAdded,
      endpoints_removed: changes.endpointsRemoved,
      validation_errors: changes.validationErrors
    });
  };
}
```

## Dashboard Interactions

```tsx
function StatusTable() {
  const analytics = useAnalytics();

  const handleSort = (column: string) => {
    analytics.trackDashboardInteraction('sort_table', {
      table_type: 'status_overview',
      sort_column: column,
      sort_direction: sortDirection
    });
  };

  const handleFilter = (filterType: string, value: string) => {
    analytics.trackDashboardInteraction('apply_filter', {
      filter_type: filterType,
      filter_value: value, // Will be sanitized
      total_results: filteredResults.length
    });
  };
}
```

## Privacy-First Principles

The analytics service automatically:

✅ **Only initializes with explicit consent** (usageAnalytics = true)  
✅ **Sanitizes PII** - removes emails, IPs, sensitive data  
✅ **Uses anonymized user IDs** - hashed, not directly identifiable  
✅ **No default PII collection** - sendDefaultPii: false  
✅ **Respects Do Not Track** - follows browser DNT settings  
✅ **Graceful degradation** - works normally when disabled  

## Event Categories

- **Session Started** - User login/authentication
- **User Login** - Successful authentication  
- **User Registered** - New user onboarding
- **User Logout** - Session end
- **Page View** - Navigation tracking
- **Feature Used** - Feature interaction
- **Monitoring Action** - Endpoint/probe management
- **Configuration Changed** - YAML config updates
- **Dashboard Interaction** - UI interactions

## Manufacturing Context Data

All events include relevant manufacturing monitoring context:

```json
{
  "app_version": "1.0",
  "deployment_type": "on_premise",
  "platform": "web",
  "timezone": "America/New_York",
  "screen_resolution": "1920x1080",
  "is_mobile": false
}
```