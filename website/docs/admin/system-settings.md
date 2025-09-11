---
sidebar_position: 1
---

# System Settings

Configure system-wide settings and advanced options for ThingConnect Pulse.

## General System Settings

### System Information

View and configure basic system information and identification.

#### System Identity
- **System Name**: Friendly name for this ThingConnect Pulse instance
- **Installation ID**: Unique identifier for this installation
- **Environment**: Production, Staging, Development, or Test
- **Location**: Physical or logical location description

#### Version Information
- **Application Version**: Current software version
- **Database Version**: Schema version
- **Last Update**: When system was last updated
- **Update Channel**: Stable, Beta, or Development updates

### Performance Settings

Configure system performance and resource utilization.

#### Monitoring Performance
- **Maximum Concurrent Checks**: Limit simultaneous monitoring operations
- **Check Queue Size**: Maximum queued monitoring requests
- **Thread Pool Size**: Worker threads for monitoring operations
- **Memory Allocation**: Memory limits for monitoring processes

#### Database Performance
- **Connection Pool Size**: Maximum database connections
- **Query Timeout**: Default database query timeout
- **Maintenance Window**: Scheduled maintenance operations
- **Vacuum Schedule**: Database optimization schedule

#### Caching Configuration
- **Memory Cache Size**: In-memory cache allocation
- **Cache TTL**: Time-to-live for cached data
- **Cache Cleanup**: Automatic cache cleanup schedule
- **Distributed Cache**: Configuration for distributed caching

## Data Management

### Storage Configuration

Configure data storage locations and policies.

#### Storage Paths
- **Database Location**: SQLite database file path
- **Log Directory**: System and application log storage
- **Backup Directory**: Automated backup storage location
- **Temporary Files**: Temporary file storage path

#### Storage Quotas
- **Maximum Database Size**: Database size limits
- **Log Retention Size**: Maximum log storage
- **Backup Retention**: Number of backups to retain
- **Cleanup Policies**: Automatic cleanup rules

### Data Retention Policies

Configure how long different types of data are retained.

#### Raw Monitoring Data
- **Retention Period**: Default 60 days
- **Archive Options**: Long-term archival settings
- **Compression**: Data compression for older records
- **Cleanup Schedule**: When to purge old data

#### Aggregated Data
- **15-Minute Rollups**: Default 1 year retention
- **Daily Rollups**: Indefinite retention option
- **Weekly/Monthly Rollups**: Custom aggregation periods
- **Trend Data**: Long-term trend preservation

#### System Logs
- **Application Logs**: Application event log retention
- **Audit Logs**: Security and change audit logs
- **Error Logs**: Error and exception log retention
- **Performance Logs**: System performance metrics

## Security Configuration

### Authentication Settings

Configure user authentication and session management.

#### Session Management
- **Session Timeout**: Automatic logout after inactivity
- **Maximum Sessions**: Concurrent sessions per user
- **Session Storage**: Session data storage method
- **Remember Me**: Persistent login options

#### Password Policies
- **Minimum Length**: Required password length
- **Complexity Rules**: Character requirements
- **Expiration Period**: Password aging policy
- **History Requirements**: Previous password restrictions

#### Two-Factor Authentication
- **Enforce 2FA**: Require 2FA for all users
- **TOTP Settings**: Time-based OTP configuration
- **Backup Codes**: Recovery code generation
- **Device Registration**: Trusted device management

### API Security

Configure API access and security policies.

#### API Keys
- **Key Expiration**: API key lifetime
- **Key Rotation**: Automatic key rotation
- **Key Permissions**: Granular API permissions
- **Rate Limiting**: API request rate limits

#### CORS Configuration
- **Allowed Origins**: Cross-origin request sources
- **Allowed Methods**: Permitted HTTP methods
- **Allowed Headers**: Custom header permissions
- **Credentials**: Cookie and authentication handling

## Network Configuration

### HTTP Server Settings

Configure the built-in web server.

#### Basic Settings
- **Listen Port**: HTTP server port (default: 8080)
- **Bind Address**: Network interface binding
- **Base URL**: Public URL for the application
- **Request Timeout**: HTTP request timeout

#### HTTPS Configuration
- **SSL Certificate**: TLS certificate configuration
- **Certificate Store**: Certificate storage location
- **TLS Protocols**: Supported TLS versions
- **Cipher Suites**: Allowed encryption methods

#### Reverse Proxy
- **Proxy Headers**: X-Forwarded headers handling
- **Load Balancer**: Load balancer compatibility
- **Path Rewriting**: URL path modifications
- **Health Checks**: Load balancer health endpoints

### Firewall and Access Control

Configure network access restrictions.

#### IP Restrictions
- **Allowed IP Ranges**: Whitelist IP addresses/ranges
- **Blocked IPs**: Blacklist specific addresses
- **Geographic Restrictions**: Country-based blocking
- **VPN Detection**: VPN/proxy detection settings

#### Network Monitoring
- **Outbound Connections**: External connectivity requirements
- **DNS Resolution**: DNS server configuration
- **Proxy Settings**: Corporate proxy configuration
- **Network Interfaces**: Multi-homed network setup

## Logging and Monitoring

### System Logging

Configure application and system logging.

#### Log Levels
- **Application Logs**: Debug, Info, Warning, Error levels
- **Security Logs**: Authentication and authorization events
- **Performance Logs**: System performance metrics
- **Audit Logs**: Configuration and data changes

#### Log Destinations
- **File Logging**: Local file system logging
- **Syslog Integration**: System log forwarding
- **Event Log**: Windows Event Log integration
- **Remote Logging**: External log aggregation

#### Log Formats
- **Structured Logging**: JSON/XML formatted logs
- **Plain Text**: Human-readable log format
- **Custom Formats**: Template-based formatting
- **Log Enrichment**: Additional context data

### System Monitoring

Monitor system health and performance.

#### Resource Monitoring
- **CPU Usage**: Processor utilization tracking
- **Memory Usage**: RAM and virtual memory monitoring
- **Disk I/O**: Storage performance metrics
- **Network I/O**: Network utilization statistics

#### Application Metrics
- **Check Performance**: Monitoring operation metrics
- **Database Performance**: Query and connection metrics
- **Cache Hit Rates**: Cache effectiveness metrics
- **Error Rates**: Application error frequency

#### Alerting Thresholds
- **Resource Alerts**: CPU, memory, disk thresholds
- **Performance Alerts**: Response time degradation
- **Error Rate Alerts**: Elevated error frequencies
- **Capacity Alerts**: Growth and scaling warnings

## Integration Settings

### External System Integration

Configure connections to external systems.

#### LDAP/Active Directory
- **Server Configuration**: LDAP server connection details
- **Authentication**: Bind credentials and methods
- **User Mapping**: LDAP attribute to user property mapping
- **Group Synchronization**: Role mapping from LDAP groups

#### Email Integration
- **SMTP Server**: Email server configuration
- **Authentication**: SMTP authentication settings
- **Email Templates**: Customizable email formats
- **Delivery Settings**: Retry and queue configuration

#### Webhook Configuration
- **Global Settings**: Default webhook settings
- **Retry Policies**: Failed webhook retry logic
- **Authentication**: Webhook authentication methods
- **Rate Limiting**: Webhook delivery rate limits

### Third-Party Services

Configure integration with monitoring and alerting services.

#### Grafana Integration
- **Data Source**: Grafana data source configuration
- **Dashboards**: Pre-built dashboard deployment
- **Alerting**: Grafana alerting integration
- **User Synchronization**: User account synchronization

#### Prometheus Integration
- **Metrics Endpoint**: Prometheus metrics exposure
- **Metric Labels**: Custom metric labeling
- **Scrape Configuration**: Prometheus scrape settings
- **Alert Manager**: AlertManager integration

## Backup and Recovery

### Automated Backups

Configure automatic system backups.

#### Backup Schedule
- **Frequency**: Daily, weekly, monthly backups
- **Backup Window**: Preferred backup time
- **Retention Policy**: Number of backups to keep
- **Backup Types**: Full, incremental, differential

#### Backup Storage
- **Local Storage**: Local filesystem backup
- **Network Storage**: SMB/NFS network storage
- **Cloud Storage**: Cloud provider integration
- **Encryption**: Backup encryption settings

#### Backup Content
- **Database Backup**: Complete database backup
- **Configuration Backup**: Settings and configuration
- **Log Backup**: System and application logs
- **Custom Files**: Additional file inclusions

### Disaster Recovery

Configure disaster recovery procedures.

#### Recovery Procedures
- **Recovery Documentation**: Step-by-step procedures
- **Recovery Testing**: Automated recovery testing
- **Failover Procedures**: Service failover processes
- **Data Recovery**: Data restoration procedures

#### High Availability
- **Cluster Configuration**: Multi-node deployment
- **Load Balancing**: Traffic distribution
- **Health Monitoring**: Service health checks
- **Automatic Failover**: Unattended failover

## Maintenance and Updates

### System Maintenance

Configure automated maintenance tasks.

#### Database Maintenance
- **Index Optimization**: Database index rebuilding
- **Statistics Updates**: Query optimizer statistics
- **Cleanup Operations**: Old data purging
- **Integrity Checks**: Database consistency checks

#### System Cleanup
- **Temporary Files**: Automatic cleanup of temp files
- **Log Rotation**: Automatic log file rotation
- **Cache Cleanup**: Expired cache entry removal
- **Backup Cleanup**: Old backup file removal

### Software Updates

Configure automatic software updates.

#### Update Configuration
- **Update Channel**: Stable, beta, or development
- **Automatic Updates**: Enable/disable auto-updates
- **Update Window**: Preferred update time
- **Rollback Policy**: Automatic rollback on failure

#### Update Notifications
- **Available Updates**: Notification of available updates
- **Security Updates**: Priority security update alerts
- **Update History**: Log of applied updates
- **Update Approval**: Manual update approval process

## Troubleshooting Tools

### Diagnostic Information

Built-in diagnostic and troubleshooting tools.

#### System Diagnostics
- **Health Check**: Overall system health status
- **Configuration Validation**: Settings validation
- **Network Connectivity**: External connectivity tests
- **Database Integrity**: Database health checks

#### Performance Analysis
- **Resource Utilization**: Current resource usage
- **Bottleneck Identification**: Performance bottlenecks
- **Query Performance**: Database query analysis
- **Cache Analysis**: Cache hit/miss statistics

#### Debugging Tools
- **Log Analysis**: Built-in log analysis tools
- **Trace Collection**: Detailed execution tracing
- **Memory Profiling**: Memory usage analysis
- **Network Debugging**: Network connectivity debugging

### Support Information

Information for technical support and troubleshooting.

#### System Information
- **Environment Details**: Complete system information
- **Configuration Summary**: Key configuration settings
- **Version Information**: Software and component versions
- **License Information**: License status and details

#### Export Options
- **Diagnostic Export**: Complete diagnostic information
- **Configuration Export**: System configuration export
- **Log Export**: System and application logs
- **Support Bundle**: Complete support information package