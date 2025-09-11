---
sidebar_position: 1
---

# API Overview

ThingConnect Pulse provides a comprehensive REST API for integration and automation.

## API Base URL

All API endpoints are available at:

```
http://[server]:8080/api/
```

## Authentication

The API uses cookie-based authentication consistent with the web interface.

### Authentication Flow

1. **Login**: POST to `/api/auth/login` with credentials
2. **Session Cookie**: Receive authentication cookie
3. **Subsequent Requests**: Include cookie in all API calls
4. **Logout**: POST to `/api/auth/logout` to end session

### Example Login Request

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your-password"
}
```

## Core Endpoints

### Monitoring Status
- **GET** `/api/status/live` - Real-time endpoint status
- **GET** `/api/status/summary` - Overall system status
- **GET** `/api/status/{endpointId}` - Specific endpoint status

### Historical Data
- **GET** `/api/history/raw` - Raw monitoring data
- **GET** `/api/history/rollup/15min` - 15-minute aggregated data
- **GET** `/api/history/rollup/daily` - Daily aggregated data

### Configuration Management
- **GET** `/api/config` - Current configuration
- **POST** `/api/config` - Update configuration
- **GET** `/api/config/validate` - Validate configuration

### Endpoint Management
- **GET** `/api/endpoints` - List all endpoints
- **POST** `/api/endpoints` - Create new endpoint
- **PUT** `/api/endpoints/{id}` - Update endpoint
- **DELETE** `/api/endpoints/{id}` - Delete endpoint

## Data Formats

### Status Response Format

```json
{
  "endpointId": "endpoint-123",
  "name": "Primary Router",
  "status": "online",
  "responseTime": 2.5,
  "lastCheck": "2024-01-15T10:30:00Z",
  "uptime": 99.5
}
```

### Historical Data Format

```json
{
  "endpointId": "endpoint-123",
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "online",
  "responseTime": 2.5,
  "details": {
    "httpStatus": 200,
    "contentLength": 1024
  }
}
```

## Query Parameters

### Pagination
- **page**: Page number (default: 1)
- **pageSize**: Results per page (default: 50, max: 1000)

### Filtering
- **status**: Filter by endpoint status (online, offline, warning)
- **endpointId**: Specific endpoint ID
- **tags**: Filter by endpoint tags

### Time Range
- **startTime**: Start of time range (ISO 8601)
- **endTime**: End of time range (ISO 8601)
- **last**: Relative time (1h, 24h, 7d, 30d)

### Example Query

```http
GET /api/status/live?status=offline&pageSize=25&page=1
```

## Error Handling

### HTTP Status Codes
- **200** - Success
- **400** - Bad Request (invalid parameters)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **500** - Internal Server Error

### Error Response Format

```json
{
  "error": {
    "code": "INVALID_ENDPOINT",
    "message": "The specified endpoint does not exist",
    "details": {
      "endpointId": "invalid-id"
    }
  }
}
```

## Rate Limiting

API requests are rate-limited to ensure system stability:

- **General Endpoints**: 100 requests per minute
- **Status Endpoints**: 300 requests per minute  
- **Configuration**: 10 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234800
```

## Webhooks

Configure webhooks for real-time notifications:

### Webhook Events
- **endpoint.status.changed** - Endpoint status change
- **endpoint.performance.degraded** - Performance threshold exceeded
- **system.alert.triggered** - System-level alerts

### Webhook Payload

```json
{
  "event": "endpoint.status.changed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "endpointId": "endpoint-123",
    "name": "Primary Router",
    "oldStatus": "online",
    "newStatus": "offline",
    "responseTime": null
  }
}
```

## SDK and Integration

### Available SDKs
- **JavaScript/Node.js**: npm package for easy integration
- **PowerShell**: Module for Windows automation
- **Python**: pip package for data analysis and automation

### Integration Examples
- **Grafana**: Display monitoring data in dashboards
- **Slack/Teams**: Alert notifications via chat platforms
- **ITSM Systems**: Incident creation and management
- **Custom Applications**: Embed monitoring data in existing tools