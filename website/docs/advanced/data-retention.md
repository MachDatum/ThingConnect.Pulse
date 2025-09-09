---
sidebar_position: 3
---

# Data Retention

Configure data retention policies and understand data lifecycle management in ThingConnect Pulse.

## Data Types and Storage

ThingConnect Pulse stores different types of data with varying retention requirements:

### Raw Monitoring Data

Individual check results with full detail.

```sql
-- Raw monitoring_data table structure
CREATE TABLE monitoring_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    status TEXT NOT NULL, -- 'online', 'offline', 'warning'
    response_time REAL,
    details JSON,
    check_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Characteristics:**
- **Volume**: Highest data volume
- **Detail**: Complete check results with all metadata
- **Frequency**: Every check interval (typically 30 seconds)
- **Default Retention**: 60 days
- **Storage Growth**: ~100-500 MB per endpoint per year

### Rollup Data

Aggregated statistics for efficient long-term storage and reporting.

#### 15-Minute Rollups

```sql
CREATE TABLE rollup_15min (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT NOT NULL,
    period_start DATETIME NOT NULL,
    period_end DATETIME NOT NULL,
    
    -- Availability metrics
    total_checks INTEGER NOT NULL,
    successful_checks INTEGER NOT NULL,
    failed_checks INTEGER NOT NULL,
    availability_percent REAL NOT NULL,
    
    -- Performance metrics
    avg_response_time REAL,
    min_response_time REAL,
    max_response_time REAL,
    p95_response_time REAL,
    p99_response_time REAL,
    
    -- Status transitions
    status_changes INTEGER DEFAULT 0,
    downtime_seconds INTEGER DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Characteristics:**
- **Frequency**: Every 15 minutes
- **Default Retention**: 1 year
- **Compression**: ~96% reduction from raw data
- **Use Cases**: Dashboard displays, recent trend analysis

#### Daily Rollups

```sql
CREATE TABLE rollup_daily (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint_id TEXT NOT NULL,
    date DATE NOT NULL,
    
    -- Daily availability
    total_checks INTEGER NOT NULL,
    successful_checks INTEGER NOT NULL,
    availability_percent REAL NOT NULL,
    
    -- Daily performance
    avg_response_time REAL,
    p95_response_time REAL,
    max_response_time REAL,
    
    -- Outage summary
    total_outages INTEGER DEFAULT 0,
    total_downtime_minutes INTEGER DEFAULT 0,
    longest_outage_minutes INTEGER DEFAULT 0,
    
    -- First/last seen issues
    first_failure_time DATETIME,
    last_failure_time DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Characteristics:**
- **Frequency**: Daily aggregation
- **Default Retention**: Indefinite (or 5+ years)
- **Compression**: ~99.7% reduction from raw data
- **Use Cases**: Long-term reporting, SLA tracking, capacity planning

### System and Application Logs

```sql
CREATE TABLE system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL, -- DEBUG, INFO, WARN, ERROR, FATAL
    component TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSON,
    timestamp DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Default Retention**: 30 days

## Retention Configuration

### Global Retention Settings

```yaml
# Global data retention configuration
dataRetention:
  # Raw monitoring data
  rawData:
    retention: "60d"
    compressionAfter: "7d"
    archiveAfter: "30d"
    
  # Rollup data
  rollupData:
    fifteenMinute:
      retention: "1y"
      compressionAfter: "30d"
    daily:
      retention: "indefinite"  # Or specific period like "5y"
      compressionAfter: "90d"
    
  # System logs
  systemLogs:
    retention: "30d"
    level: "INFO"  # Only retain INFO and above
    
  # Audit logs (special handling)
  auditLogs:
    retention: "7y"  # Compliance requirement
    immutable: true
    encryption: true

# Cleanup schedule
maintenance:
  cleanupSchedule: "0 2 * * *"  # Daily at 2 AM
  vacuumSchedule: "0 3 * * SUN"  # Weekly database optimization
  compressionSchedule: "0 1 * * *"  # Daily compression
```

### Per-Endpoint Retention

```yaml
# Override retention for specific endpoints
endpoints:
  - name: "Critical Production Server"
    address: "192.168.1.100"
    type: "http"
    
    # Extended retention for critical systems
    dataRetention:
      rawData: "90d"    # Keep raw data longer
      rollupData: "2y"  # Extended rollup retention
      priority: "high"  # Higher priority for cleanup
    
  - name: "Development Server"
    address: "192.168.1.200" 
    type: "http"
    
    # Reduced retention for non-production
    dataRetention:
      rawData: "14d"     # Shorter raw data retention
      rollupData: "6m"   # Shorter rollup retention
      priority: "low"    # Lower cleanup priority
```

## Data Lifecycle Management

### Automated Cleanup Process

```sql
-- Example cleanup procedure
CREATE PROCEDURE cleanup_old_data()
BEGIN
    -- Clean up raw data older than retention period
    DELETE FROM monitoring_data 
    WHERE created_at < datetime('now', '-60 days');
    
    -- Clean up 15-minute rollups
    DELETE FROM rollup_15min 
    WHERE created_at < datetime('now', '-1 year');
    
    -- Clean up old logs
    DELETE FROM system_logs 
    WHERE created_at < datetime('now', '-30 days');
    
    -- Vacuum database to reclaim space
    VACUUM;
    
    -- Update statistics
    ANALYZE;
END;
```

### Data Compression

ThingConnect Pulse can compress older data to save storage space:

```yaml
compression:
  enabled: true
  
  # Compression algorithms
  algorithms:
    - name: "gzip"
      level: 6
      ratio: 3.5  # Average compression ratio
    - name: "lz4"
      level: 1
      ratio: 2.8  # Faster but less compression
  
  # Compression rules
  rules:
    - name: "old_raw_data"
      condition: "age > 7d"
      algorithm: "gzip"
      tables: ["monitoring_data"]
      
    - name: "old_rollups"
      condition: "age > 30d"
      algorithm: "lz4"
      tables: ["rollup_15min", "rollup_daily"]
```

### Data Archival

For long-term storage and compliance:

```yaml
archival:
  enabled: true
  
  # Archive destinations
  destinations:
    - name: "local_archive"
      type: "filesystem"
      path: "/var/lib/pulse/archive"
      compression: "gzip"
      
    - name: "cloud_archive"
      type: "s3"
      bucket: "pulse-archive-bucket"
      storageClass: "GLACIER"
      encryption: true
  
  # Archival rules
  rules:
    - name: "archive_old_raw_data"
      condition: "age > 30d"
      source: "monitoring_data"
      destination: "cloud_archive"
      format: "parquet"  # Columnar format for analysis
      
    - name: "archive_compliance_data"
      condition: "endpoint.compliance == true AND age > 90d"
      source: "rollup_daily"
      destination: "local_archive"
      retention: "7y"
```

## Storage Optimization

### Database Tuning

```sql
-- Optimize SQLite for time-series data
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;

-- Partitioning large tables (logical partitioning)
CREATE TABLE monitoring_data_2024_01 AS 
SELECT * FROM monitoring_data 
WHERE timestamp BETWEEN '2024-01-01' AND '2024-02-01';

-- Optimize indexes for time-series queries
CREATE INDEX idx_monitoring_data_endpoint_time 
ON monitoring_data(endpoint_id, timestamp DESC);

CREATE INDEX idx_monitoring_data_time_status 
ON monitoring_data(timestamp DESC, status);
```

### Storage Monitoring

```yaml
# Monitor storage usage and growth
monitoring:
  storage:
    enabled: true
    alerts:
      - name: "database_size"
        threshold: "10GB"
        action: "alert"
      - name: "rapid_growth"
        threshold: "1GB/day"
        action: "alert"
      - name: "disk_space"
        threshold: "90%"
        action: "cleanup"
    
    # Growth tracking
    tracking:
      interval: "1h"
      metrics:
        - "total_database_size"
        - "table_sizes"
        - "index_sizes"
        - "growth_rate"
```

## Compliance and Legal Requirements

### Regulatory Compliance

```yaml
compliance:
  # GDPR compliance
  gdpr:
    enabled: true
    dataSubjectRights:
      - right_to_erasure
      - right_to_portability
    retentionBasis: "legitimate_interest"
    
  # HIPAA compliance (if applicable)
  hipaa:
    enabled: false
    encryption: "AES-256"
    auditLogging: true
    
  # Industry-specific requirements
  manufacturing:
    enabled: true
    equipmentLogs:
      retention: "10y"  # Equipment lifecycle
    safetyLogs:
      retention: "30y"  # Safety regulation requirement
    qualityData:
      retention: "7y"   # Quality management system
```

### Data Export for Compliance

```yaml
export:
  compliance:
    formats: ["json", "csv", "xml"]
    encryption: true
    auditTrail: true
    
    # Automated compliance exports
    schedules:
      - name: "monthly_compliance_export"
        schedule: "0 0 1 * *"  # First of month
        format: "json"
        destination: "compliance_archive"
        scope: "all_data"
        retention: "7y"
```

## Performance Impact

### Query Performance

Different retention strategies affect query performance:

```sql
-- Raw data queries (heavy for large time ranges)
SELECT AVG(response_time) 
FROM monitoring_data 
WHERE endpoint_id = 'ep-123' 
  AND timestamp > datetime('now', '-24 hours');

-- Rollup queries (efficient for longer periods)
SELECT AVG(avg_response_time) 
FROM rollup_15min 
WHERE endpoint_id = 'ep-123' 
  AND period_start > datetime('now', '-7 days');

-- Mixed queries for optimal performance
WITH recent AS (
    SELECT AVG(response_time) as avg_rt
    FROM monitoring_data 
    WHERE endpoint_id = 'ep-123' 
      AND timestamp > datetime('now', '-1 hours')
),
historical AS (
    SELECT AVG(avg_response_time) as avg_rt
    FROM rollup_15min 
    WHERE endpoint_id = 'ep-123' 
      AND period_start BETWEEN datetime('now', '-24 hours') 
                            AND datetime('now', '-1 hours')
)
SELECT (recent.avg_rt + historical.avg_rt) / 2 as overall_avg
FROM recent, historical;
```

### Storage Growth Estimation

```python
# Storage growth calculator
def estimate_storage_growth(endpoints, check_interval, retention_days):
    """Estimate storage growth for monitoring data"""
    
    # Average record sizes (bytes)
    raw_record_size = 200  # JSON metadata, timestamps, etc.
    rollup_15min_size = 150
    rollup_daily_size = 100
    
    # Calculate daily data generation
    checks_per_day = (24 * 60 * 60) / check_interval
    daily_raw_data = endpoints * checks_per_day * raw_record_size
    
    # Rollup data (much smaller)
    rollups_15min_per_day = (24 * 60) / 15
    daily_15min_rollups = endpoints * rollups_15min_per_day * rollup_15min_size
    
    daily_rollups = endpoints * 1 * rollup_daily_size  # One per day
    
    # Total storage estimates
    total_raw_data = daily_raw_data * retention_days
    total_15min_rollups = daily_15min_rollups * 365  # 1 year default
    total_daily_rollups = daily_rollups * 1825  # 5 years default
    
    return {
        'daily_growth_mb': (daily_raw_data + daily_15min_rollups + daily_rollups) / 1024 / 1024,
        'total_storage_gb': (total_raw_data + total_15min_rollups + total_daily_rollups) / 1024 / 1024 / 1024,
        'breakdown': {
            'raw_data_gb': total_raw_data / 1024 / 1024 / 1024,
            '15min_rollups_gb': total_15min_rollups / 1024 / 1024 / 1024,
            'daily_rollups_gb': total_daily_rollups / 1024 / 1024 / 1024
        }
    }

# Example: 100 endpoints, 30-second intervals, 60-day retention
result = estimate_storage_growth(100, 30, 60)
print(f"Daily growth: {result['daily_growth_mb']:.2f} MB")
print(f"Total storage needed: {result['total_storage_gb']:.2f} GB")
```

## Best Practices

### Retention Strategy

1. **Tiered Retention**: Use different retention periods for different data types
2. **Business Alignment**: Align retention with business and compliance needs
3. **Performance Balance**: Balance detail with query performance
4. **Regular Review**: Periodically review and adjust retention policies

### Implementation Guidelines

```yaml
# Example production configuration
production:
  dataRetention:
    # Critical production systems
    critical:
      rawData: "90d"
      rollup15min: "2y" 
      rollupDaily: "indefinite"
      
    # Standard systems  
    standard:
      rawData: "60d"
      rollup15min: "1y"
      rollupDaily: "5y"
      
    # Development/test systems
    development:
      rawData: "14d"
      rollup15min: "3m"
      rollupDaily: "1y"
      
  # Maintenance windows
  maintenance:
    cleanupWindow: "02:00-04:00"
    maintenanceDay: "sunday"
    vacuumFrequency: "weekly"
    
  # Monitoring retention system health
  alerts:
    databaseSize: "5GB"
    cleanupFailure: true
    growthRate: "500MB/day"
```

### Migration Strategies

When changing retention policies:

```sql
-- Gradual migration approach
BEGIN TRANSACTION;

-- Create new table with updated schema
CREATE TABLE monitoring_data_new (
    -- Updated schema with compression support
);

-- Migrate data in batches
INSERT INTO monitoring_data_new 
SELECT * FROM monitoring_data 
WHERE timestamp > datetime('now', '-30 days');

-- Switch tables
ALTER TABLE monitoring_data RENAME TO monitoring_data_old;
ALTER TABLE monitoring_data_new RENAME TO monitoring_data;

-- Clean up old data gradually
-- (Do this in separate maintenance windows)

COMMIT;
```

### Disaster Recovery

Ensure retention policies don't compromise disaster recovery:

```yaml
disaster_recovery:
  # Backup retention separate from operational retention  
  backups:
    daily: "30d"    # Keep daily backups for 30 days
    weekly: "12w"   # Keep weekly backups for 12 weeks
    monthly: "12m"  # Keep monthly backups for 1 year
    
  # Archive critical data before deletion
  criticalDataArchive:
    enabled: true
    beforeDeletion: true
    destination: "long_term_archive"
    verification: true
```