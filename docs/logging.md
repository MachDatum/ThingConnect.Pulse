# ThingConnect Pulse - Logging Configuration

This document defines the logging policies, configuration, and best practices for ThingConnect Pulse.

## Logging Framework

**Primary Logger**: Serilog with structured logging
**Secondary Logger**: Windows Event Log (errors only)

## Log File Configuration

### File Location
```
%ProgramData%\ThingConnect.Pulse\logs\pulse-{Date}.log
```

### Rolling Policy
- **Rolling Interval**: Daily
- **File Name Pattern**: `pulse-yyyymmdd.log`
- **Retention Policy**: 30 days
- **File Sharing**: Enabled (allows read while service running)
- **Maximum File Size**: 100 MB per day (estimated)
- **Archive Format**: None (files auto-deleted after retention)

### Example File Names
```
pulse-20241224.log    # Today's log
pulse-20241223.log    # Yesterday's log  
pulse-20241222.log    # 2 days ago
...
pulse-20241125.log    # 30 days ago (will be deleted)
```

## Log Levels

### Information (Default)
- Service startup/shutdown events
- Configuration changes applied
- Monitoring job statistics (hourly summary)
- API endpoint access (non-sensitive)
- Database migration completions

### Warning
- Configuration validation warnings
- Network probe timeouts or retries
- Database connection recoveries
- High memory usage alerts
- Rate limiting activations

### Error
- Service startup failures
- Configuration parsing errors
- Database connection failures
- Unhandled exceptions
- Critical monitoring failures
- API authentication failures (if auth enabled)

### Debug (Development Only)
- Individual probe execution details
- SQL query execution times
- HTTP request/response details
- Background job scheduling

## Log Format

### Structured JSON Format
```json
{
  "@timestamp": "2024-08-24T10:30:45.123Z",
  "@level": "Information", 
  "@message": "Configuration applied successfully",
  "ConfigVersionId": "20240824103045-a1b2c3d4",
  "Added": 5,
  "Updated": 2,
  "Removed": 1,
  "Actor": "admin",
  "SourceContext": "ThingConnect.Pulse.Server.Services.ConfigurationService"
}
```

### Console Format (Development)
```
[10:30:45 INF] Configuration applied successfully Added=5 Updated=2 Removed=1 ConfigVersionId="20240824103045-a1b2c3d4"
```

## Security and Privacy

### Never Log
- User passwords or API keys
- Database connection strings with credentials  
- Configuration file contents (may contain sensitive data)
- Full HTTP request/response bodies
- Personal identifiable information (PII)

### Hash Sensitive Data
- Configuration file hashes (SHA-256)
- Session identifiers
- Database record IDs

### Sanitize Before Logging
- Network endpoints (remove credentials from URLs)
- Error messages (strip file paths, user info)
- SQL queries (remove parameter values)

## Performance Considerations

### Asynchronous Logging
- All file writes are asynchronous to avoid blocking
- Buffer size: 10,000 events
- Flush interval: 10 seconds
- Emergency flush on service shutdown

### Log Volume Management
- Sampling for high-frequency events (probe results)
- Structured logging reduces redundant text
- Conditional debug logging (only if enabled)

### Monitoring Impact
- Logging overhead: <1% CPU, <10MB memory
- Disk I/O: <1MB/hour under normal operation
- Network monitoring not affected by logging performance

## Configuration Examples

### appsettings.json - Production
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.Hosting.Lifetime": "Information",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "File",
        "Args": {
          "path": "%ProgramData%\\ThingConnect.Pulse\\logs\\pulse-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 30,
          "shared": true,
          "formatter": "Serilog.Formatting.Json.JsonFormatter"
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithThreadId", "WithEnvironment"]
  }
}
```

### appsettings.Development.json - Development
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "Microsoft": "Information"
      }
    },
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "File", 
        "Args": {
          "path": "%ProgramData%\\ThingConnect.Pulse\\logs\\pulse-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 7
        }
      }
    ]
  }
}
```

## Windows Event Log Integration

### Event Sources
- **Source Name**: `ThingConnect Pulse`
- **Log Name**: `Application`

### Event Types
- **Error (1)**: Service failures, critical errors
- **Warning (2)**: Configuration issues, performance warnings
- **Information (4)**: Service start/stop, major state changes

### Event IDs
- **1001**: Service started successfully
- **1002**: Service stopped
- **1010**: Configuration applied
- **2001**: Configuration validation warning
- **3001**: Database connection failure
- **3002**: Network monitoring failure
- **9999**: Unhandled exception

## Log Analysis and Monitoring

### Common Queries

#### Service Health
```bash
# Check service startup/shutdown
grep -E "(Service started|Service stopped)" pulse-*.log

# Find configuration changes  
grep "Configuration applied" pulse-*.log

# Error summary
grep -c '"@level":"Error"' pulse-*.log
```

#### Performance Monitoring
```bash
# Database performance
grep "Database.*slow" pulse-*.log

# Memory usage warnings
grep "memory" pulse-*.log | grep -i warning

# Network probe failures
grep "probe.*failed" pulse-*.log
```

### Log Rotation Commands
```powershell
# Manual cleanup (older than 30 days)
Get-ChildItem "C:\ProgramData\ThingConnect.Pulse\logs\pulse-*.log" | 
  Where-Object {$_.LastWriteTime -lt (Get-Date).AddDays(-30)} | 
  Remove-Item

# Check current log size
Get-ChildItem "C:\ProgramData\ThingConnect.Pulse\logs\" -Recurse | 
  Measure-Object -Property Length -Sum
```

## Troubleshooting

### Common Issues

#### Log Files Not Created
- Check service account permissions on logs directory
- Verify `%ProgramData%\ThingConnect.Pulse\logs\` exists
- Check Event Log for Serilog configuration errors

#### High Disk Usage
- Verify retention policy is working (30-day cleanup)
- Check for excessive Debug logging in production
- Consider reducing log level from Information to Warning

#### Missing Log Entries
- Check minimum log level configuration
- Verify logger is properly injected in service classes
- Check for async logging buffer overflows

### Debug Mode Activation
```json
// Temporarily enable debug logging
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "ThingConnect.Pulse": "Debug"
      }
    }
  }
}
```

**Warning**: Debug mode generates 10x more log data. Use only for troubleshooting and revert to Information level.

## Compliance and Auditing

### Audit Trail Requirements
- All configuration changes logged with actor and timestamp
- Service start/stop events with reason codes
- Failed authentication attempts (when auth implemented)
- Database schema changes and migrations

### Log Integrity
- No log file modification after creation (append-only)
- File timestamps preserved for forensic analysis
- Structured format enables automated parsing
- Configuration changes create immutable version history

## Future Enhancements

### Planned Features (v2.0+)
- Centralized logging to external systems (Seq, Elasticsearch)
- Log compression for long-term archival
- Real-time log streaming API
- Configurable sampling rates per component
- Log-based alerting and notifications

This logging configuration balances operational visibility with performance and security requirements for manufacturing environment deployment.