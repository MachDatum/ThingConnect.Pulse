---
sidebar_position: 3
---

# API Endpoints

Complete reference for all ThingConnect Pulse API endpoints.

## Status Endpoints

### Live Status

Get real-time status of monitoring endpoints.

```http
GET /api/status/live
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number | 1 |
| `pageSize` | integer | Results per page (max 1000) | 50 |
| `status` | string | Filter by status (online, offline, flapping) | - |
| `groupId` | string | Filter by endpoint group ID | - |
| `search` | string | Search endpoint names | - |

**Response:**

```json
{
  "items": [
    {
      "endpoint": {
        "id": "ep-123",
        "name": "Primary Router",
        "address": "192.168.1.1",
        "type": "icmp",
        "group": {
          "id": "grp-1",
          "name": "Network Infrastructure"
        }
      },
      "status": "online",
      "responseTime": 2.5,
      "lastCheck": "2024-01-15T10:30:00Z",
      "uptime": 99.5
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 50,
    "totalItems": 125,
    "totalPages": 3
  }
}
```

### System Status

Get overall system health and summary statistics.

```http
GET /api/status/summary
```

**Response:**

```json
{
  "system": {
    "status": "healthy",
    "uptime": "15d 4h 32m",
    "lastRestart": "2024-01-01T00:00:00Z"
  },
  "endpoints": {
    "total": 125,
    "online": 120,
    "offline": 3,
    "flapping": 2
  },
  "monitoring": {
    "checksPerMinute": 250,
    "averageResponseTime": 45.2,
    "dataRetention": "60 days"
  }
}
```

### Individual Endpoint Status

Get detailed status for a specific endpoint.

```http
GET /api/status/endpoints/{endpointId}
```

**Response:**

```json
{
  "endpoint": {
    "id": "ep-123",
    "name": "Primary Router",
    "address": "192.168.1.1",
    "type": "icmp",
    "interval": 30,
    "timeout": 5,
    "retryCount": 3
  },
  "currentStatus": {
    "status": "online",
    "responseTime": 2.5,
    "lastCheck": "2024-01-15T10:30:00Z",
    "consecutiveFailures": 0
  },
  "statistics": {
    "uptime24h": 99.8,
    "uptime7d": 99.2,
    "uptime30d": 98.9,
    "averageResponseTime": 3.1
  }
}
```

## Historical Data Endpoints

### Raw Historical Data

Get raw monitoring check results.

```http
GET /api/history/raw
```

**Query Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `endpointId` | string | Endpoint identifier | Yes |
| `startTime` | string | Start time (ISO 8601) | Yes |
| `endTime` | string | End time (ISO 8601) | Yes |
| `page` | integer | Page number | No |
| `pageSize` | integer | Results per page | No |

**Response:**

```json
{
  "items": [
    {
      "timestamp": "2024-01-15T10:30:00Z",
      "status": "online",
      "responseTime": 2.5,
      "details": {
        "packetsSent": 1,
        "packetsReceived": 1,
        "packetLoss": 0
      }
    }
  ],
  "meta": {
    "endpointId": "ep-123",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "totalItems": 120
  }
}
```

### 15-Minute Rollup Data

Get aggregated 15-minute summary data.

```http
GET /api/history/rollup/15min
```

**Response Format:**

```json
{
  "items": [
    {
      "timestamp": "2024-01-15T10:15:00Z",
      "availability": 100.0,
      "averageResponseTime": 2.8,
      "minResponseTime": 1.2,
      "maxResponseTime": 4.1,
      "checkCount": 30,
      "failureCount": 0
    }
  ]
}
```

### Daily Rollup Data

Get daily aggregated statistics.

```http
GET /api/history/rollup/daily
```

**Response Format:**

```json
{
  "items": [
    {
      "date": "2024-01-15",
      "availability": 99.8,
      "averageResponseTime": 2.5,
      "totalChecks": 2880,
      "totalFailures": 6,
      "downtimeMinutes": 18
    }
  ]
}
```

## Configuration Endpoints

### Get Configuration

Retrieve current monitoring configuration.

```http
GET /api/config
```

**Response:**

```json
{
  "version": "1.2.3",
  "lastModified": "2024-01-15T10:30:00Z",
  "endpoints": [
    {
      "id": "ep-123",
      "name": "Primary Router",
      "address": "192.168.1.1",
      "type": "icmp",
      "interval": 30,
      "timeout": 5,
      "retryCount": 3,
      "group": "network"
    }
  ],
  "groups": [
    {
      "id": "network",
      "name": "Network Infrastructure",
      "description": "Core network devices"
    }
  ]
}
```

### Update Configuration

Apply new monitoring configuration.

```http
POST /api/config
Content-Type: application/json
```

**Request Body:**

```json
{
  "endpoints": [...],
  "groups": [...],
  "settings": {
    "defaultInterval": 30,
    "defaultTimeout": 5,
    "defaultRetryCount": 3
  }
}
```

**Response:**

```json
{
  "success": true,
  "version": "1.2.4",
  "appliedAt": "2024-01-15T10:35:00Z",
  "changes": {
    "endpointsAdded": 2,
    "endpointsModified": 1,
    "endpointsRemoved": 0
  }
}
```

### Validate Configuration

Validate configuration without applying changes.

```http
POST /api/config/validate
Content-Type: application/json
```

**Response:**

```json
{
  "valid": true,
  "errors": [],
  "warnings": [
    {
      "message": "Endpoint 'test-server' has very short timeout",
      "field": "endpoints[0].timeout"
    }
  ]
}
```

## Endpoint Management

### List All Endpoints

Get all configured monitoring endpoints.

```http
GET /api/endpoints
```

### Create Endpoint

Add a new monitoring endpoint.

```http
POST /api/endpoints
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "New Server",
  "address": "192.168.1.100",
  "type": "tcp",
  "port": 80,
  "interval": 30,
  "timeout": 10,
  "retryCount": 3,
  "groupId": "grp-1"
}
```

### Update Endpoint

Modify an existing endpoint.

```http
PUT /api/endpoints/{endpointId}
Content-Type: application/json
```

### Delete Endpoint

Remove an endpoint from monitoring.

```http
DELETE /api/endpoints/{endpointId}
```

**Response:**

```json
{
  "success": true,
  "message": "Endpoint deleted successfully",
  "endpointId": "ep-123"
}
```

## Webhook Endpoints

### List Webhooks

Get all configured webhook endpoints.

```http
GET /api/webhooks
```

### Create Webhook

Add a new webhook endpoint.

```http
POST /api/webhooks
Content-Type: application/json
```

**Request Body:**

```json
{
  "url": "https://api.example.com/webhook",
  "events": ["endpoint.status.changed", "system.alert.triggered"],
  "headers": {
    "Authorization": "Bearer token123"
  },
  "enabled": true
}
```

## Export Endpoints

### Export Historical Data

Export monitoring data in various formats.

```http
GET /api/export/history
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `format` | string | Export format (csv, json, xlsx) | csv |
| `endpointId` | string | Specific endpoint | - |
| `startTime` | string | Start time (ISO 8601) | - |
| `endTime` | string | End time (ISO 8601) | - |
| `bucket` | string | Data resolution (raw, 15min, daily) | raw |

### Export Configuration

Export current configuration as YAML.

```http
GET /api/export/config
Accept: application/yaml
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "ENDPOINT_NOT_FOUND",
    "message": "The specified endpoint does not exist",
    "details": {
      "endpointId": "invalid-id"
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Rate Limiting

Rate limits apply to all endpoints:

- **General**: 100 requests per minute
- **Status**: 300 requests per minute
- **Configuration**: 10 requests per minute
- **Export**: 5 requests per minute

Rate limit headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234800
```