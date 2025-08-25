# Data Retention and Prune Policy

This document explains the data retention policies, automated pruning mechanisms, and manual data management tools for ThingConnect Pulse.

## Overview

ThingConnect Pulse implements a tiered data retention strategy to balance operational value with storage efficiency. Raw monitoring data has limited retention (60 days default), while aggregated rollups and critical records are preserved longer or permanently.

## Retention Policy Summary

### Automatic Data Lifecycle

| Data Type | Default Retention | Pruning Frequency | Rationale |
|-----------|-------------------|-------------------|-----------|
| **CheckResultRaw** | 60 days | Weekly | High-volume data, detailed troubleshooting |
| **Rollup15m** | 1 year | Monthly | Medium-volume, operational trends |
| **RollupDaily** | Permanent | Never | Low-volume, historical reporting |
| **Outage** | Permanent | Never | Critical incident records |
| **ConfigHistory** | Permanent | Never | Compliance and audit trail |
| **Settings** | Permanent | Never | System state and watermarks |

### Storage Budget Impact

**Typical deployment (1,000 endpoints, 10-second intervals)**:
- Raw data: ~51GB (stable after 60 days)
- 15-minute rollups: ~350MB (grows ~1MB/day after first year)
- Daily rollups: ~10MB/year (minimal growth)
- **Total database size: ~52GB** (steady state)

## Automated Pruning

### Background Service Implementation

The `DataPruneBackgroundService` runs weekly to enforce retention policies:

```csharp
public class DataPruneBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DataPruneBackgroundService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromDays(7); // Weekly pruning

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RunPruneOperationsAsync();
                await Task.Delay(_interval, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Data prune operation failed");
            }
        }
    }
}
```

### Retention Configuration

Configuration options available in `appsettings.json`:

```json
{
  "Data": {
    "Retention": {
      "RawDays": 60,
      "Rollup15mDays": 365,
      "RollupDailyDays": -1,
      "OutageDays": -1,
      "ConfigHistoryDays": -1
    },
    "Pruning": {
      "Enabled": true,
      "IntervalHours": 168,
      "BatchSize": 1000,
      "MaxExecutionMinutes": 30
    }
  }
}
```

**Configuration details**:
- `-1` value = permanent retention (no pruning)
- `Enabled: false` = disable all automated pruning
- `BatchSize` = records deleted per transaction (performance tuning)
- `MaxExecutionMinutes` = safety timeout to prevent long-running operations

### Pruning Operations

#### Raw Data Pruning (CheckResultRaw)

Most frequent and impactful pruning operation:

```sql
-- Delete raw check results older than retention period
DELETE FROM check_result_raw 
WHERE created_at < @cutoff_date 
LIMIT @batch_size;

-- Cutoff calculation: UtcNow - retention_days
-- Example: 2024-11-01 - 60 days = 2024-09-02
```

**Performance characteristics**:
- Processes ~1M records per batch (configurable)
- Uses timestamp index for efficient range deletion
- Transaction-scoped to prevent corruption
- Logs progress every 10 batches

#### Rollup Pruning (Rollup15m)

Less frequent, typically after first year:

```sql
-- Delete 15-minute rollups older than retention period  
DELETE FROM rollup_15m 
WHERE bucket_ts < @cutoff_date
LIMIT @batch_size;
```

**Timing**: Only runs when `Rollup15mDays` > 0 and data exceeds retention period.

#### Database Maintenance

Post-pruning optimization:

```sql
-- Reclaim disk space after bulk deletions
VACUUM;

-- Update table statistics for query optimization  
ANALYZE;
```

**Note**: `VACUUM` operations can take several minutes on large databases and temporarily double disk space requirements.

## Manual Data Management

### Immediate Pruning Commands

For emergency disk space recovery or testing:

**PowerShell administrative scripts**:

```powershell
# Force immediate pruning (30-day retention)
& "C:\Program Files\ThingConnect.Pulse\Tools\prune-data.ps1" -Days 30 -Confirm

# Dry run to estimate space savings
& "C:\Program Files\ThingConnect.Pulse\Tools\prune-data.ps1" -Days 30 -WhatIf

# Prune only raw data, preserve rollups
& "C:\Program Files\ThingConnect.Pulse\Tools\prune-data.ps1" -Days 30 -RawOnly -Confirm
```

### Database Size Analysis

Tools for monitoring data growth and retention effectiveness:

```powershell
# Generate storage report
& "C:\Program Files\ThingConnect.Pulse\Tools\storage-report.ps1"

# Output example:
# CheckResultRaw: 45.2 GB (89.1% of database)
# Rollup15m: 234 MB (0.5% of database) 
# RollupDaily: 12 MB (0.02% of database)
# Other tables: 89 MB (0.2% of database)
# Total: 50.7 GB
```

### Configuration Validation

Ensure retention policies align with storage capacity:

```powershell
# Validate retention settings against available disk space
& "C:\Program Files\ThingConnect.Pulse\Tools\validate-retention.ps1"

# Warning example:
# WARNING: Current retention (60 days) projects to 51 GB
# Available disk space: 45 GB  
# Recommendation: Reduce retention to 50 days or add storage
```

## Operational Procedures

### Changing Retention Policies

**Step 1**: Update configuration file
```json
{
  "Data": {
    "Retention": {
      "RawDays": 30  // Reduced from 60 days
    }
  }
}
```

**Step 2**: Restart ThingConnect.Pulse service
```powershell
Restart-Service "ThingConnect.Pulse"
```

**Step 3**: Force immediate pruning (optional)
```powershell
& "C:\Program Files\ThingConnect.Pulse\Tools\prune-data.ps1" -Days 30 -Confirm
```

**Step 4**: Monitor next automated pruning cycle
- Check Windows Event Log for "ThingConnect.Pulse" source
- Verify database size reduction after next weekly run

### Disaster Recovery

**Data corruption scenarios**:

1. **Rollup data corruption**: Delete affected rollups, they will regenerate from raw data
2. **Raw data corruption**: No automatic recovery, requires restore from backup
3. **Database file corruption**: Stop service, restore from file-based backup

**Emergency space recovery**:

```powershell
# Aggressive pruning to 7 days (emergency only)
& "C:\Program Files\ThingConnect.Pulse\Tools\prune-data.ps1" -Days 7 -Force

# Remove all rollups (they regenerate from remaining raw data)  
& "C:\Program Files\ThingConnect.Pulse\Tools\prune-data.ps1" -RollupsOnly -Force
```

### Performance Impact

**During pruning operations**:
- Database response may slow by 10-20%  
- Concurrent monitoring continues normally
- Web UI queries may experience brief delays
- Export operations may queue until completion

**Mitigation strategies**:
- Schedule pruning during low-activity periods
- Use smaller batch sizes for critical systems
- Monitor system resources during operations

## Monitoring and Alerting

### Key Metrics to Track

**Database growth rate**:
```sql
-- Daily database size growth
SELECT 
    DATE(created_at) as date,
    COUNT(*) as records,
    COUNT(*) * 100 / 1024 / 1024 as estimated_mb
FROM check_result_raw 
WHERE created_at > DATE('now', '-7 days')
GROUP BY DATE(created_at)
ORDER BY date;
```

**Pruning effectiveness**:
```sql
-- Oldest record in each table
SELECT 
    'CheckResultRaw' as table_name,
    MIN(created_at) as oldest_record,
    COUNT(*) as total_records
FROM check_result_raw
UNION ALL
SELECT 
    'Rollup15m',
    MIN(bucket_ts),
    COUNT(*)
FROM rollup_15m;
```

### Alerting Triggers

**Critical alerts**:
- Database file >90% of available disk space
- Pruning operations failing for >3 consecutive cycles  
- Database growth rate exceeding retention policy projections

**Warning alerts**:
- Database file >75% of available disk space
- Pruning operations taking >60 minutes to complete
- Individual table sizes deviating >20% from expected retention budget

### Troubleshooting Common Issues

**"Database is locked" during pruning**:
- Caused by long-running queries or exports
- Wait for operations to complete, then retry
- Consider reducing batch size to minimize lock duration

**"Insufficient disk space for VACUUM"**:  
- VACUUM requires temporary space equal to database size
- Free additional disk space before pruning
- Skip VACUUM operation if space constrained (disk space won't be reclaimed)

**"Pruning taking excessive time"**:
- Check for missing indexes on timestamp columns
- Reduce batch size from 1000 to 100 records
- Consider running during maintenance windows

---

This pruning policy ensures ThingConnect Pulse maintains predictable storage usage while preserving operationally valuable data. Regular monitoring and proactive configuration adjustments help maintain optimal performance and storage efficiency.