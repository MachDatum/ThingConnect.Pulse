# Non-Functional Requirements (NFRs)

This document defines the non-functional requirements for ThingConnect Pulse v1, including performance targets, data retention budgets, and operational constraints.

## Overview

ThingConnect Pulse is designed for manufacturing environments with typical loads of 100-1,000 endpoints and 10-60 second polling intervals. These NFRs ensure the system remains responsive, reliable, and manageable within resource constraints.

## Performance Requirements

### Response Time
- **API endpoints**: <200ms for data queries (95th percentile)
- **Web UI**: Initial page load <3 seconds
- **Real-time updates**: Status changes reflected within 30 seconds
- **Export operations**: CSV generation <10 seconds for 30-day datasets

### Throughput
- **Concurrent users**: Support 5-10 simultaneous web users
- **Check processing**: Handle 1,000 endpoints × 10-second intervals (6M checks/hour)
- **Database operations**: 500+ read/write operations per second
- **Background processing**: Complete 15-minute rollups within 2 minutes

### Resource Consumption
- **Memory usage**: <512MB RSS under normal load (1,000 endpoints)
- **CPU utilization**: <25% on 4-core systems during peak processing
- **Database file size**: <2GB with default retention policies (see below)
- **Log file growth**: <100MB per day, managed by retention policies

## Data Retention Budget

The retention policy balances operational needs with storage constraints, following a tiered approach where raw data has limited retention while aggregated data is preserved longer.

### Primary Data Retention

| Data Type | Default Retention | Configuration Key | Typical Size (1,000 endpoints) |
|-----------|-------------------|-------------------|--------------------------------|
| **CheckResultRaw** | 60 days | `data.retention.raw_days` | ~51GB (518M records) |
| **Rollup15m** | 1 year | `data.retention.rollup15m_days` | ~350MB (2M records) |
| **RollupDaily** | Permanent | N/A (always retained) | ~10MB per year (36K/year) |
| **Outage** | Permanent | N/A (always retained) | <1MB per year |
| **ConfigHistory** | Permanent | N/A (always retained) | <10MB total |
| **Settings** | Permanent | N/A (always retained) | <1MB total |

### Log Data Retention

| Log Type | Default Retention | Configuration Key | Typical Size |
|----------|-------------------|-------------------|--------------|
| **Application logs** | 30 days | `logging.retention.days` | ~3GB (100MB/day) |
| **Structured logs** | 30 days | Same as application | Included in application logs |

### Total Storage Budget

**Conservative sizing (1,000 endpoints)**:
- Database: ~52GB (with 60-day retention)  
- Logs: ~3GB (with 30-day retention)
- **Total: ~55GB** for complete monitoring dataset

**Aggressive sizing (configurable to 30-day raw retention)**:
- Database: ~26GB (with 30-day retention)
- Logs: ~3GB (with 30-day retention) 
- **Total: ~29GB** for cost-sensitive deployments

### Storage Growth Characteristics

**Linear growth phase** (first 60 days):
- Raw data grows at ~850MB per day (1,000 endpoints × 10-second intervals)
- Rollups grow at ~10MB per day initially

**Steady state** (after retention policies take effect):
- Raw data maintains constant size (~51GB)
- 15-minute rollups continue growing at ~1MB per day
- Daily rollups grow at ~30KB per day

## Availability Requirements

### Uptime
- **Target availability**: 99.5% (excluding planned maintenance)
- **Maximum downtime**: 4 hours per month (planned + unplanned)
- **Recovery time**: <5 minutes for service restart scenarios
- **Data integrity**: Zero tolerance for data corruption

### Reliability
- **Graceful degradation**: Continue monitoring during UI failures
- **Self-recovery**: Automatic restart from transient failures
- **Error handling**: All exceptions logged with context
- **Monitoring continuity**: Service must recover checking after crashes

## Scalability Requirements

### Current Scale (v1.0)
- **Endpoints**: 100-1,000 (tested up to 2,000)
- **Check intervals**: 10-300 seconds (recommended 10-60 seconds)
- **Concurrent checks**: Up to 100 simultaneous network probes
- **Historical data**: 60-day raw retention + indefinite rollups

### Growth Capacity
- **Endpoint growth**: Support 2x capacity (2,000 endpoints) without architectural changes
- **Data volume**: Handle 10x historical data through retention policy adjustments
- **User growth**: Scale to 20 concurrent web users with current architecture

## Security Requirements

### Data Protection
- **Local-only storage**: No cloud dependencies, all data remains on-premises
- **File system permissions**: Restrict database and config file access to service account
- **Network isolation**: Support deployment without internet access
- **Configuration security**: YAML files readable only by administrator and service

### Access Control
- **No authentication required**: Internal network assumption for v1.0
- **File-based configuration**: Admin control over monitoring targets
- **Service permissions**: Run as low-privilege Windows service account
- **Log security**: No sensitive data in log files

## Operational Requirements

### Installation and Deployment
- **Silent installation**: MSI package with unattended deployment options
- **Service integration**: Automatic Windows service registration and startup
- **Configuration validation**: Detect and report YAML configuration errors
- **Database migration**: Automatic schema updates between versions

### Monitoring and Observability
- **Structured logging**: JSON format with correlation IDs
- **Health endpoints**: API status checks for external monitoring
- **Performance metrics**: Built-in timing and resource usage tracking
- **Error reporting**: Detailed error messages with actionable guidance

### Maintenance
- **Automatic cleanup**: Background services for log and data retention
- **Database maintenance**: Periodic VACUUM operations for SQLite optimization
- **Update mechanism**: In-place version updates with configuration preservation
- **Backup support**: File-based backup procedures for database and configuration

## Quality Gates

These requirements are enforced through:
- **Build-time analysis**: StyleCop and .NET analyzers prevent quality regressions
- **Performance testing**: Load testing with 1,000 endpoints validates throughput
- **Resource monitoring**: Memory and CPU profiling during development
- **Data validation**: Retention policy testing ensures storage budget compliance

## Compliance and Constraints

### Data Residency
- **On-premises only**: All monitoring data stored locally
- **No external dependencies**: Operate without internet connectivity  
- **Privacy compliance**: No personal data collection or transmission
- **Audit trail**: Configuration changes tracked in ConfigHistory table

### Environmental Constraints
- **Windows platforms**: Server 2019+ and Windows 10/11
- **Resource limits**: Designed for modest hardware (4-core, 8GB RAM)
- **Network constraints**: Function on segmented manufacturing networks
- **Database limits**: SQLite file size limits (~281TB theoretical, ~2GB practical)

---

This NFR specification provides measurable targets for validating ThingConnect Pulse meets its operational requirements while maintaining acceptable resource consumption and reliability standards.