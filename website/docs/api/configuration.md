---
sidebar_position: 5
---

# Configuration API

Manage ThingConnect Pulse configuration programmatically via the Configuration API.

## Configuration Schema

ThingConnect Pulse uses YAML-based configuration with a well-defined schema.

### Basic Structure

```yaml
# ThingConnect Pulse Configuration
version: "1.0"
metadata:
  name: "Production Network Monitoring"
  description: "Manufacturing site network monitoring configuration"
  created: "2024-01-15T10:00:00Z"
  lastModified: "2024-01-15T10:30:00Z"

# Global settings
settings:
  defaultInterval: 30
  defaultTimeout: 5
  defaultRetryCount: 3
  dataRetention:
    rawData: "60 days"
    rollupData: "1 year"

# Endpoint groups
groups:
  - id: "network"
    name: "Network Infrastructure"
    description: "Core network devices"
  - id: "servers"
    name: "Server Infrastructure"
    description: "Application and database servers"

# Monitoring endpoints
endpoints:
  - id: "router-01"
    name: "Primary Router"
    address: "192.168.1.1"
    type: "icmp"
    group: "network"
    interval: 30
    timeout: 5
    retryCount: 3
  
  - id: "server-01"
    name: "Web Server"
    address: "192.168.1.100"
    type: "http"
    port: 80
    path: "/health"
    group: "servers"
    interval: 60
    timeout: 10
```

## Configuration Management

### Get Current Configuration

Retrieve the active monitoring configuration.

```http
GET /api/config
```

**Response:**

```json
{
  "version": "1.2.3",
  "lastModified": "2024-01-15T10:30:00Z",
  "checksum": "sha256:abc123...",
  "configuration": {
    "version": "1.0",
    "metadata": {...},
    "settings": {...},
    "groups": [...],
    "endpoints": [...]
  }
}
```

### Update Configuration

Apply a new configuration to the monitoring system.

```http
POST /api/config
Content-Type: application/json
```

**Request Body:**

```json
{
  "configuration": {
    "version": "1.0",
    "settings": {
      "defaultInterval": 30,
      "defaultTimeout": 5,
      "defaultRetryCount": 3
    },
    "groups": [...],
    "endpoints": [...]
  },
  "validateOnly": false,
  "dryRun": false
}
```

**Parameters:**

- `validateOnly` (boolean): Only validate without applying changes
- `dryRun` (boolean): Simulate the update and return planned changes

**Response:**

```json
{
  "success": true,
  "version": "1.2.4",
  "appliedAt": "2024-01-15T10:35:00Z",
  "changes": {
    "summary": {
      "endpointsAdded": 2,
      "endpointsModified": 1,
      "endpointsRemoved": 0,
      "groupsAdded": 1,
      "groupsModified": 0,
      "groupsRemoved": 0
    },
    "details": [
      {
        "action": "add",
        "type": "endpoint",
        "id": "new-server",
        "description": "Added endpoint 'New Server'"
      },
      {
        "action": "modify",
        "type": "endpoint",
        "id": "router-01",
        "description": "Updated interval from 30 to 60 seconds",
        "changes": {
          "interval": {"from": 30, "to": 60}
        }
      }
    ]
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
      "level": "warning",
      "message": "Endpoint 'test-server' has very short timeout (1s)",
      "path": "endpoints[0].timeout",
      "suggestion": "Consider increasing timeout to at least 5 seconds"
    }
  ],
  "statistics": {
    "totalEndpoints": 25,
    "endpointsByType": {
      "icmp": 15,
      "tcp": 8,
      "http": 2
    },
    "totalGroups": 3
  }
}
```

## Configuration Versions

### List Configuration History

Get history of configuration changes.

```http
GET /api/config/history
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number | 1 |
| `pageSize` | integer | Results per page | 20 |
| `since` | string | Show changes since timestamp | - |

**Response:**

```json
{
  "items": [
    {
      "version": "1.2.4",
      "timestamp": "2024-01-15T10:35:00Z",
      "author": "admin",
      "summary": "Added 2 new endpoints",
      "changeSummary": {
        "endpointsAdded": 2,
        "endpointsModified": 0,
        "endpointsRemoved": 0
      }
    }
  ],
  "meta": {
    "totalItems": 45,
    "currentVersion": "1.2.4"
  }
}
```

### Get Specific Version

Retrieve a specific configuration version.

```http
GET /api/config/versions/{version}
```

**Response:**

```json
{
  "version": "1.2.3",
  "timestamp": "2024-01-15T09:30:00Z",
  "author": "admin",
  "configuration": {...}
}
```

### Rollback Configuration

Rollback to a previous configuration version.

```http
POST /api/config/rollback
Content-Type: application/json
```

**Request Body:**

```json
{
  "targetVersion": "1.2.3",
  "reason": "Rollback due to issues with new endpoints"
}
```

## Endpoint Management

### List Endpoints

Get all configured endpoints with filtering options.

```http
GET /api/config/endpoints
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `groupId` | string | Filter by group |
| `type` | string | Filter by endpoint type |
| `status` | string | Filter by current status |

### Create Endpoint

Add a new monitoring endpoint to the configuration.

```http
POST /api/config/endpoints
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Database Server",
  "address": "192.168.1.200",
  "type": "tcp",
  "port": 3306,
  "group": "servers",
  "interval": 60,
  "timeout": 10,
  "retryCount": 3,
  "tags": ["database", "mysql", "critical"]
}
```

### Update Endpoint

Modify an existing endpoint configuration.

```http
PUT /api/config/endpoints/{endpointId}
Content-Type: application/json
```

### Delete Endpoint

Remove an endpoint from the configuration.

```http
DELETE /api/config/endpoints/{endpointId}
```

## Group Management

### List Groups

Get all endpoint groups.

```http
GET /api/config/groups
```

### Create Group

Add a new endpoint group.

```http
POST /api/config/groups
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Database Servers",
  "description": "All database server instances",
  "tags": ["database", "backend"]
}
```

## Configuration Templates

### List Templates

Get available configuration templates.

```http
GET /api/config/templates
```

**Response:**

```json
{
  "templates": [
    {
      "id": "network-basic",
      "name": "Basic Network Monitoring",
      "description": "Template for basic network device monitoring",
      "category": "network",
      "endpoints": 5,
      "groups": 2
    },
    {
      "id": "web-services",
      "name": "Web Services Monitoring",
      "description": "Template for web application monitoring",
      "category": "applications",
      "endpoints": 8,
      "groups": 1
    }
  ]
}
```

### Apply Template

Apply a configuration template.

```http
POST /api/config/templates/{templateId}/apply
Content-Type: application/json
```

**Request Body:**

```json
{
  "parameters": {
    "networkPrefix": "192.168.1",
    "defaultInterval": 30,
    "groupPrefix": "prod"
  },
  "mergeWithExisting": true
}
```

## Import and Export

### Export Configuration

Export configuration in various formats.

```http
GET /api/config/export
```

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `format` | string | Format (yaml, json, csv) | yaml |
| `includeMetadata` | boolean | Include metadata | true |
| `compression` | string | Compression (none, gzip) | none |

### Import Configuration

Import configuration from file or payload.

```http
POST /api/config/import
Content-Type: multipart/form-data
```

**Form Data:**

- `file`: Configuration file (YAML or JSON)
- `format`: File format (auto-detected if not specified)
- `merge`: Merge with existing configuration (boolean)
- `validateOnly`: Only validate without importing (boolean)

**Response:**

```json
{
  "success": true,
  "importedAt": "2024-01-15T10:45:00Z",
  "summary": {
    "endpointsImported": 15,
    "groupsImported": 3,
    "duplicatesSkipped": 2,
    "validationErrors": 0
  },
  "warnings": [
    "2 endpoints were skipped due to duplicate names"
  ]
}
```

## Bulk Operations

### Bulk Endpoint Update

Update multiple endpoints at once.

```http
POST /api/config/endpoints/bulk
Content-Type: application/json
```

**Request Body:**

```json
{
  "operation": "update",
  "filter": {
    "groupId": "servers"
  },
  "changes": {
    "interval": 60,
    "timeout": 15
  }
}
```

### Bulk Endpoint Creation

Create multiple endpoints from template.

```http
POST /api/config/endpoints/bulk-create
Content-Type: application/json
```

**Request Body:**

```json
{
  "template": {
    "type": "icmp",
    "group": "network",
    "interval": 30,
    "timeout": 5
  },
  "endpoints": [
    {
      "name": "Router 1",
      "address": "192.168.1.1"
    },
    {
      "name": "Router 2", 
      "address": "192.168.1.2"
    }
  ]
}
```

## Configuration Validation Rules

### Endpoint Validation

- **Name**: Must be unique within configuration
- **Address**: Must be valid IP address, hostname, or URL
- **Type**: Must be one of: icmp, tcp, http, https
- **Port**: Required for TCP endpoints, range 1-65535
- **Interval**: Minimum 10 seconds, maximum 86400 seconds (24 hours)
- **Timeout**: Must be less than interval
- **Group**: Must reference existing group

### Group Validation

- **Name**: Must be unique, 1-50 characters
- **Description**: Optional, maximum 200 characters

### Global Validation

- **Maximum Endpoints**: 1000 endpoints per configuration
- **Maximum Groups**: 50 groups per configuration
- **Naming Conflicts**: No duplicate endpoint or group names

## Error Handling

### Configuration Errors

```json
{
  "error": {
    "code": "CONFIG_VALIDATION_FAILED",
    "message": "Configuration validation failed",
    "details": {
      "validationErrors": [
        {
          "path": "endpoints[0].timeout",
          "message": "Timeout (15s) must be less than interval (10s)",
          "code": "TIMEOUT_EXCEEDS_INTERVAL"
        }
      ]
    }
  }
}
```

### Version Conflicts

```json
{
  "error": {
    "code": "CONFIG_VERSION_CONFLICT",
    "message": "Configuration has been modified by another user",
    "details": {
      "currentVersion": "1.2.5",
      "providedVersion": "1.2.4",
      "lastModified": "2024-01-15T10:40:00Z",
      "modifiedBy": "other_user"
    }
  }
}
```

## Best Practices

### Configuration Management

- Always validate configuration before applying
- Use version control for configuration files
- Test configuration changes in a staging environment
- Document configuration changes with meaningful descriptions

### Performance Considerations

- Avoid setting very short intervals for many endpoints
- Group related endpoints for better organization
- Use appropriate timeouts based on network conditions
- Monitor system resource usage when scaling endpoints

### Security Guidelines

- Restrict configuration API access to authorized users
- Audit all configuration changes
- Use secure connections (HTTPS) for configuration management
- Validate all input data to prevent injection attacks