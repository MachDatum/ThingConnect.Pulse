---
sidebar_position: 4
---

# Monitoring Integration

Learn how to integrate ThingConnect Pulse with external monitoring systems and tools.

## Real-Time Data Streaming

### WebSocket Connection

Connect to real-time monitoring data via WebSocket.

```javascript
const ws = new WebSocket('ws://localhost:8080/api/ws/status');

ws.onopen = () => {
  console.log('Connected to ThingConnect Pulse');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Status update:', data);
};
```

**Message Format:**

```json
{
  "type": "status_update",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "endpointId": "ep-123",
    "status": "online",
    "responseTime": 2.5,
    "previousStatus": "offline"
  }
}
```

### Server-Sent Events

Subscribe to status updates via Server-Sent Events.

```javascript
const eventSource = new EventSource('/api/events/status');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Status event:', data);
};
```

## Grafana Integration

### Data Source Configuration

Configure ThingConnect Pulse as a Grafana data source.

**Grafana JSON API Plugin:**

```json
{
  "url": "http://localhost:8080/api/grafana",
  "access": "proxy",
  "basicAuth": false,
  "withCredentials": false
}
```

### Sample Queries

#### Endpoint Availability Query

```json
{
  "target": "availability",
  "endpointId": "ep-123",
  "refId": "A"
}
```

#### Response Time Query

```json
{
  "target": "response_time",
  "endpointId": "ep-123",
  "aggregation": "avg",
  "interval": "5m",
  "refId": "B"
}
```

### Dashboard Examples

**Network Overview Dashboard:**

```json
{
  "dashboard": {
    "title": "Network Monitoring",
    "panels": [
      {
        "title": "Endpoint Status",
        "type": "stat",
        "targets": [
          {
            "target": "status_count",
            "status": "online"
          }
        ]
      },
      {
        "title": "Response Times",
        "type": "graph",
        "targets": [
          {
            "target": "response_time",
            "aggregation": "avg",
            "interval": "1m"
          }
        ]
      }
    ]
  }
}
```

## Prometheus Integration

### Metrics Endpoint

ThingConnect Pulse exposes Prometheus metrics.

```http
GET /api/metrics
```

**Sample Metrics:**

```
# HELP pulse_endpoint_status Current status of monitoring endpoints (1=online, 0=offline)
# TYPE pulse_endpoint_status gauge
pulse_endpoint_status{endpoint="router-01",group="network"} 1
pulse_endpoint_status{endpoint="server-01",group="servers"} 0

# HELP pulse_endpoint_response_time Response time in milliseconds
# TYPE pulse_endpoint_response_time gauge
pulse_endpoint_response_time{endpoint="router-01",group="network"} 2.5
pulse_endpoint_response_time{endpoint="server-01",group="servers"} 0

# HELP pulse_checks_total Total number of monitoring checks performed
# TYPE pulse_checks_total counter
pulse_checks_total{endpoint="router-01",status="success"} 8640
pulse_checks_total{endpoint="router-01",status="failure"} 12

# HELP pulse_system_uptime System uptime in seconds
# TYPE pulse_system_uptime gauge
pulse_system_uptime 1296000
```

### Prometheus Configuration

**prometheus.yml:**

```yaml
scrape_configs:
  - job_name: 'thingconnect-pulse'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

## Splunk Integration

### HTTP Event Collector

Send monitoring data to Splunk via HEC.

**Configuration:**

```json
{
  "splunk": {
    "enabled": true,
    "hecUrl": "https://splunk.company.com:8088/services/collector",
    "token": "your-hec-token",
    "index": "network_monitoring",
    "source": "thingconnect_pulse"
  }
}
```

**Sample Event:**

```json
{
  "time": 1642234800,
  "host": "pulse-monitor",
  "source": "thingconnect_pulse",
  "sourcetype": "network_monitoring",
  "index": "network_monitoring",
  "event": {
    "endpoint": "router-01",
    "status": "online",
    "response_time": 2.5,
    "group": "network",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## ITSM Integration

### ServiceNow Integration

Automatically create incidents in ServiceNow.

**Webhook Configuration:**

```json
{
  "webhook": {
    "url": "https://company.service-now.com/api/now/table/incident",
    "method": "POST",
    "headers": {
      "Authorization": "Basic base64-credentials",
      "Content-Type": "application/json"
    },
    "body": {
      "short_description": "Network endpoint {{endpoint.name}} is {{status}}",
      "description": "Endpoint {{endpoint.name}} ({{endpoint.address}}) changed from {{previous_status}} to {{status}} at {{timestamp}}",
      "category": "Network",
      "subcategory": "Monitoring",
      "urgency": "{{#eq status 'offline'}}1{{else}}3{{/eq}}",
      "impact": "2",
      "caller_id": "monitoring_system"
    }
  }
}
```

### Jira Integration

Create Jira issues for monitoring alerts.

**Webhook Payload:**

```json
{
  "fields": {
    "project": {
      "key": "NET"
    },
    "summary": "Network Alert: {{endpoint.name}} is {{status}}",
    "description": "Monitoring endpoint {{endpoint.name}} has changed status to {{status}}.\n\nDetails:\n- Address: {{endpoint.address}}\n- Group: {{endpoint.group}}\n- Response Time: {{response_time}}ms\n- Timestamp: {{timestamp}}",
    "issuetype": {
      "name": "Bug"
    },
    "priority": {
      "name": "{{#eq status 'offline'}}High{{else}}Medium{{/eq}}"
    }
  }
}
```

## Custom Integrations

### PowerShell Module

**Installation:**

```powershell
Install-Module -Name ThingConnectPulse
```

**Usage:**

```powershell
# Connect to ThingConnect Pulse
Connect-ThingConnectPulse -Server "http://localhost:8080" -Credential $cred

# Get endpoint status
$status = Get-PulseEndpointStatus -All

# Get specific endpoint history
$history = Get-PulseEndpointHistory -EndpointId "ep-123" -Hours 24

# Create new endpoint
New-PulseEndpoint -Name "New Server" -Address "192.168.1.100" -Type "tcp" -Port 80
```

### Python SDK

**Installation:**

```bash
pip install thingconnect-pulse
```

**Usage:**

```python
from thingconnect_pulse import PulseClient

# Initialize client
client = PulseClient("http://localhost:8080", username="admin", password="password")

# Get live status
status = client.get_live_status()

# Get endpoint history
history = client.get_endpoint_history("ep-123", start_time="2024-01-15T00:00:00Z")

# Create endpoint
endpoint = client.create_endpoint({
    "name": "New Server",
    "address": "192.168.1.100",
    "type": "tcp",
    "port": 80
})
```

### Node.js SDK

**Installation:**

```bash
npm install thingconnect-pulse-sdk
```

**Usage:**

```javascript
const { PulseClient } = require('thingconnect-pulse-sdk');

const client = new PulseClient({
  baseUrl: 'http://localhost:8080',
  username: 'admin',
  password: 'password'
});

// Get live status
const status = await client.getLiveStatus();

// Subscribe to real-time updates
client.onStatusChange((data) => {
  console.log('Status changed:', data);
});
```

## Alerting Integrations

### Slack Integration

Send alerts to Slack channels.

**Webhook Configuration:**

```json
{
  "slack": {
    "webhookUrl": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    "channel": "#network-alerts",
    "username": "ThingConnect Pulse",
    "iconEmoji": ":warning:",
    "messageTemplate": {
      "text": "{{#eq status 'offline'}}🔴{{else}}🟢{{/eq}} *{{endpoint.name}}* is now *{{status}}*",
      "attachments": [
        {
          "color": "{{#eq status 'offline'}}danger{{else}}good{{/eq}}",
          "fields": [
            {
              "title": "Address",
              "value": "{{endpoint.address}}",
              "short": true
            },
            {
              "title": "Group",
              "value": "{{endpoint.group}}",
              "short": true
            },
            {
              "title": "Response Time",
              "value": "{{response_time}}ms",
              "short": true
            }
          ]
        }
      ]
    }
  }
}
```

### Microsoft Teams Integration

Send notifications to Microsoft Teams.

**Adaptive Card Format:**

```json
{
  "@type": "MessageCard",
  "@context": "https://schema.org/extensions",
  "summary": "Network Alert",
  "themeColor": "{{#eq status 'offline'}}FF0000{{else}}00FF00{{/eq}}",
  "sections": [
    {
      "activityTitle": "{{endpoint.name}} Status Change",
      "activitySubtitle": "{{timestamp}}",
      "facts": [
        {
          "name": "Status",
          "value": "{{status}}"
        },
        {
          "name": "Address",
          "value": "{{endpoint.address}}"
        },
        {
          "name": "Response Time",
          "value": "{{response_time}}ms"
        }
      ]
    }
  ]
}
```

## Data Export Integration

### Scheduled Reports

Configure automated report generation and delivery.

```json
{
  "reports": [
    {
      "name": "Daily Network Summary",
      "schedule": "0 8 * * *",
      "format": "pdf",
      "recipients": ["admin@company.com"],
      "content": {
        "timeRange": "24h",
        "sections": ["summary", "availability", "performance"],
        "endpoints": "all"
      }
    }
  ]
}
```

### API-Driven Exports

Automate data exports via API.

```bash
# Export daily data
curl -X GET "http://localhost:8080/api/export/history?format=csv&bucket=daily&startTime=2024-01-01T00:00:00Z&endTime=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer your-api-key" \
  -o monthly_report.csv
```

## Best Practices

### Performance Optimization
- Use appropriate polling intervals for external systems
- Implement caching for frequently accessed data
- Use WebSockets for real-time updates instead of polling

### Security Considerations
- Use API keys for programmatic access
- Implement rate limiting to prevent abuse
- Validate all webhook URLs and payloads
- Use HTTPS for all external integrations

### Error Handling
- Implement retry logic with exponential backoff
- Log integration failures for troubleshooting
- Provide fallback mechanisms for critical integrations
- Monitor integration health and performance