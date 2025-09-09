---
sidebar_position: 4
---

# Configuration

Configure system settings, alerts, and monitoring parameters for optimal performance.

## System Configuration

### General Settings

Access system configuration through **Settings** in the sidebar:

#### Basic System Settings
- **System Name**: Friendly name for your monitoring instance
- **Time Zone**: Local time zone for timestamps and scheduling
- **Language**: User interface language preferences
- **Theme**: Light or dark mode selection

#### Data Retention Policies
- **Raw Data Retention**: How long to keep individual monitoring checks (default: 60 days)
- **Rollup Data Retention**: Retention for aggregated data (15-minute: 1 year, daily: indefinite)
- **Log Retention**: System log retention period
- **Cleanup Schedule**: Automated data cleanup frequency

### Database Configuration

#### Storage Settings
- **Database Location**: SQLite database file location
- **Backup Frequency**: Automated backup schedule
- **Backup Retention**: How many backup copies to retain
- **Compression**: Enable database compression for space savings

#### Performance Tuning
- **Connection Pool Size**: Database connection limits
- **Query Timeout**: Maximum query execution time
- **Cache Settings**: Memory cache configuration
- **Indexing**: Database index optimization

## Monitoring Configuration

### Global Monitoring Settings

#### Default Check Parameters
- **Default Check Interval**: Frequency for new endpoints (30 seconds)
- **Default Timeout**: Response timeout for new endpoints (5 seconds)
- **Default Retry Count**: Retries before marking as failed (3)
- **Concurrent Checks**: Maximum simultaneous monitoring checks

#### Performance Thresholds
- **Warning Threshold**: Response time for performance warnings
- **Critical Threshold**: Response time for critical alerts
- **Availability Threshold**: Uptime percentage for SLA tracking

### Protocol-Specific Settings

#### ICMP Settings
- **Default Packet Size**: Ping packet size (32 bytes)
- **TTL Settings**: Time-to-live for ping packets
- **Fragmentation**: Allow packet fragmentation

#### TCP Settings
- **Connection Timeout**: TCP connection establishment timeout
- **Keep-Alive Settings**: TCP keep-alive parameters
- **Port Range Limits**: Allowed port ranges for monitoring

#### HTTP Settings
- **User Agent**: Default User-Agent header for HTTP requests
- **Follow Redirects**: Automatic redirect following
- **SSL Verification**: Certificate validation settings
- **Request Headers**: Default headers for HTTP requests

## Alert Configuration

### Alert Rules

#### Status Change Alerts
- **Endpoint Down**: Alert when endpoint becomes unavailable
- **Endpoint Up**: Notification when endpoint recovers
- **Flapping Detection**: Alert for rapid status changes

#### Performance Alerts
- **Slow Response**: Alert when response time exceeds thresholds
- **Performance Degradation**: Gradual performance decline detection
- **SLA Violations**: Service level agreement breach notifications

### Alert Channels

#### Email Notifications
- **SMTP Configuration**: Email server settings
- **Recipient Groups**: Define email distribution lists
- **Email Templates**: Customize alert message formats
- **Delivery Options**: Immediate, batched, or scheduled delivery

#### Web Hooks
- **HTTP POST Endpoints**: Send alerts to external systems
- **Payload Format**: JSON or XML alert payload structure
- **Authentication**: API keys or certificates for webhook security
- **Retry Logic**: Webhook delivery retry configuration

#### Integration Channels
- **Slack Integration**: Send alerts to Slack channels
- **Microsoft Teams**: Teams channel notifications
- **SMS Gateway**: Text message alert delivery
- **Custom Integrations**: API-based custom alert channels

### Alert Policies

#### Escalation Rules
- **Primary Notification**: Initial alert delivery
- **Escalation Delay**: Time before escalation triggers
- **Secondary Notification**: Escalated alert recipients
- **Maximum Escalations**: Limit escalation attempts

#### Suppression Rules
- **Maintenance Windows**: Scheduled alert suppression
- **Dependency Rules**: Suppress dependent endpoint alerts
- **Frequency Limits**: Prevent alert flooding
- **Acknowledgment**: Manual alert acknowledgment

## User Management

### User Accounts

#### Account Settings
- **User Roles**: Administrator, operator, viewer permissions
- **Password Policy**: Complexity and expiration requirements
- **Session Management**: Timeout and concurrent session limits
- **Two-Factor Authentication**: TOTP-based 2FA configuration

#### Access Control
- **Endpoint Permissions**: Limit user access to specific endpoints
- **Feature Permissions**: Control access to configuration and administration
- **View Restrictions**: Limit historical data access
- **API Access**: Control programmatic access permissions

### Authentication

#### Local Authentication
- **Local User Database**: Built-in user management
- **Password Storage**: Secure password hashing
- **Account Lockout**: Failed login attempt protection

#### External Authentication
- **Active Directory**: Windows domain integration
- **LDAP**: External directory service integration
- **SAML**: Single sign-on integration
- **OAuth**: Third-party authentication providers

## Configuration Management

### Configuration Backup

#### Backup Options
- **Full System Backup**: Complete configuration and data backup
- **Configuration Only**: Settings and endpoint definitions
- **Scheduled Backups**: Automated backup creation
- **Manual Backups**: On-demand backup generation

#### Backup Storage
- **Local Storage**: Backup to local file system
- **Network Storage**: Remote backup destinations
- **Cloud Storage**: Cloud backup integration
- **Encryption**: Backup encryption and security

### Configuration Import/Export

#### Export Formats
- **YAML Export**: Human-readable configuration export
- **JSON Export**: Programmatic configuration format
- **CSV Export**: Spreadsheet-compatible endpoint lists
- **Binary Export**: Complete system configuration

#### Import Options
- **Configuration Validation**: Validate before applying changes
- **Merge Strategy**: How to handle conflicts during import
- **Rollback Capability**: Undo configuration changes
- **Change Tracking**: Audit trail for configuration modifications

## Best Practices

### Configuration Strategy
- **Environment Separation**: Different configurations for dev/test/production
- **Version Control**: Track configuration changes over time
- **Documentation**: Document configuration decisions and rationale
- **Regular Review**: Periodic configuration audits and updates

### Performance Optimization
- **Resource Monitoring**: Track system resource usage
- **Scalability Planning**: Plan for growth and increased load
- **Bottleneck Identification**: Monitor for performance constraints
- **Tuning Guidelines**: Optimize based on system behavior

### Security Considerations
- **Access Logging**: Log all configuration changes
- **Principle of Least Privilege**: Minimize user permissions
- **Regular Updates**: Keep system and dependencies updated
- **Security Audits**: Regular security configuration reviews