---
sidebar_position: 2
---

# Monitoring Endpoints

Learn how to configure and manage monitoring endpoints for your network infrastructure.

## Endpoint Types

ThingConnect Pulse supports three types of monitoring:

### ICMP Ping Monitoring
- **Purpose**: Basic connectivity and reachability testing
- **Use Cases**: Network devices, servers, workstations
- **Metrics**: Response time, packet loss, availability

### TCP Port Monitoring  
- **Purpose**: Service availability and port accessibility
- **Use Cases**: Database servers, web servers, custom applications
- **Metrics**: Connection time, port status, service availability

### HTTP/HTTPS Monitoring
- **Purpose**: Web service and API endpoint monitoring
- **Use Cases**: Websites, REST APIs, web applications
- **Metrics**: Response time, HTTP status codes, content validation

## Adding Endpoints

### Using the Web Interface

1. **Navigate** to Endpoints in the sidebar
2. **Click** "Add Endpoint" button
3. **Select** endpoint type (ICMP, TCP, or HTTP)
4. **Configure** endpoint details
5. **Save** and activate monitoring

### Required Configuration

#### Basic Settings
- **Name**: Friendly name for identification
- **Address**: IP address or hostname
- **Description**: Optional details about the endpoint

#### Monitoring Settings
- **Check Interval**: How often to test (30s default)
- **Timeout**: Response timeout (5s default)  
- **Retry Count**: Retries before marking failed (3 default)

#### Advanced Settings
- **Tags**: Categorization and grouping
- **Priority**: Business criticality level
- **Maintenance Windows**: Scheduled downtime periods

### Endpoint-Specific Configuration

#### ICMP Settings
- **Packet Size**: Ping packet size (32 bytes default)
- **TTL**: Time-to-live for packets

#### TCP Settings
- **Port Number**: Target port to monitor
- **Connection Type**: TCP or UDP protocol

#### HTTP Settings
- **URL Path**: Specific path to monitor
- **HTTP Method**: GET, POST, PUT, etc.
- **Expected Status**: Success status codes (200 default)
- **Request Headers**: Custom HTTP headers
- **Request Body**: POST/PUT data
- **Content Validation**: Expected response content

## Bulk Configuration

### YAML Import
For managing many endpoints, use YAML configuration:

```yaml
endpoints:
  - name: "Primary Router"
    type: icmp
    address: "192.168.1.1"
    interval: 30
    timeout: 5
    
  - name: "Database Server"
    type: tcp
    address: "192.168.1.10"
    port: 3306
    interval: 30
    
  - name: "Company Website"
    type: http
    address: "https://company.com"
    path: "/health"
    expected_status: 200
```

### CSV Import
Import from spreadsheet applications:
- Download CSV template
- Fill in endpoint details
- Upload and validate
- Apply configuration

## Managing Endpoints

### Endpoint Status Management
- **Enable/Disable**: Control monitoring without deletion
- **Pause**: Temporary monitoring suspension
- **Delete**: Permanent removal with data cleanup

### Bulk Operations
- **Select Multiple**: Checkbox selection for batch actions
- **Bulk Edit**: Modify multiple endpoints simultaneously
- **Export**: Generate endpoint configuration backups

### Endpoint Groups
- **Create Groups**: Organize related endpoints
- **Apply Tags**: Categorize by function, location, or priority
- **Group Actions**: Bulk operations on grouped endpoints

## Monitoring Configuration

### Alert Thresholds
Configure when alerts are triggered:

- **Failure Count**: Consecutive failures before alerting
- **Response Time**: Latency thresholds for performance alerts
- **Uptime Percentage**: Availability thresholds

### Flap Damping
Prevent alert storms from intermittent issues:

- **Flap Detection**: Identify rapid state changes
- **Damping Period**: Suppress alerts during instability
- **Recovery Threshold**: Requirements for alert clearing

### Maintenance Windows
Schedule planned maintenance:

- **Recurring Windows**: Weekly, monthly maintenance schedules
- **One-time Windows**: Special maintenance events
- **Alert Suppression**: Disable alerts during maintenance

## Best Practices

### Endpoint Selection
- **Critical Path Monitoring**: Focus on business-critical components
- **Layer Monitoring**: Monitor at multiple network layers
- **End-to-End Testing**: Include user-facing services

### Configuration Guidelines
- **Appropriate Intervals**: Balance monitoring frequency with system load
- **Realistic Timeouts**: Account for network latency and jitter
- **Meaningful Names**: Use descriptive, searchable names

### Performance Considerations
- **Monitor Capacity**: Consider system resources for large deployments
- **Network Impact**: Minimize monitoring traffic overhead
- **Scalability Planning**: Design for future growth

## Troubleshooting

### Common Issues
- **DNS Resolution**: Ensure hostname resolution works
- **Firewall Rules**: Verify monitoring traffic is allowed
- **Authentication**: Check credentials for authenticated services

### Debugging Tools
- **Test Endpoint**: Manual endpoint testing from the interface
- **Detailed Logs**: View monitoring attempt details
- **Network Diagnostics**: Built-in network troubleshooting tools