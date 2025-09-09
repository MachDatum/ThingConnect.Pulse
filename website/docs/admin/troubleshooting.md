---
sidebar_position: 3
---

# Troubleshooting

Common issues, diagnostic procedures, and solutions for ThingConnect Pulse.

## General Diagnostics

### System Health Check

Before troubleshooting specific issues, perform a general system health check.

#### Service Status
```bash
# Check service status
sudo systemctl status thingconnect-pulse

# View recent log entries
sudo journalctl -u thingconnect-pulse --since "1 hour ago"

# Check if service is responding
curl -f http://localhost:8080/api/health
```

#### Resource Utilization
```bash
# Check CPU and memory usage
top -p $(pgrep thingconnect-pulse)

# Check disk space
df -h /var/lib/thingconnect-pulse

# Check database size
du -h /var/lib/thingconnect-pulse/pulse.db
```

#### Network Connectivity
```bash
# Test outbound connectivity
curl -f http://example.com

# Check DNS resolution
nslookup example.com

# Verify listening ports
netstat -tlnp | grep 8080
```

## Common Issues

### Service Won't Start

#### Symptoms
- Service fails to start
- Error messages in system logs
- Process exits immediately

#### Diagnosis
```bash
# Check service logs
sudo journalctl -u thingconnect-pulse -f

# Verify configuration
thingconnect-pulse --validate-config

# Check file permissions
ls -la /var/lib/thingconnect-pulse/
ls -la /etc/thingconnect-pulse/

# Test manual startup
sudo -u pulse thingconnect-pulse --config /etc/thingconnect-pulse/pulse.yaml
```

#### Common Causes and Solutions

**Database Permission Issues**
```bash
# Fix ownership
sudo chown pulse:pulse /var/lib/thingconnect-pulse/pulse.db

# Fix permissions
chmod 644 /var/lib/thingconnect-pulse/pulse.db
```

**Port Already in Use**
```bash
# Find process using port 8080
sudo lsof -i :8080

# Kill conflicting process
sudo kill -9 <PID>

# Or change port in configuration
sudo nano /etc/thingconnect-pulse/pulse.yaml
```

**Configuration Errors**
```bash
# Validate YAML syntax
yamllint /etc/thingconnect-pulse/pulse.yaml

# Check configuration schema
thingconnect-pulse --validate-config --verbose
```

### High CPU Usage

#### Symptoms
- System sluggishness
- High CPU utilization by pulse process
- Slow monitoring responses

#### Diagnosis
```bash
# Monitor CPU usage over time
top -p $(pgrep thingconnect-pulse)

# Check monitoring load
sqlite3 /var/lib/thingconnect-pulse/pulse.db \
"SELECT COUNT(*) as total_endpoints FROM endpoints WHERE enabled = 1;"

# Analyze slow queries
sqlite3 /var/lib/thingconnect-pulse/pulse.db \
"EXPLAIN QUERY PLAN SELECT * FROM monitoring_data WHERE timestamp > datetime('now', '-1 hour');"
```

#### Solutions

**Optimize Monitoring Intervals**
```yaml
# Increase intervals for non-critical endpoints
endpoints:
  - name: "Non-critical server"
    interval: 300  # 5 minutes instead of 30 seconds
```

**Database Optimization**
```bash
# Analyze and optimize database
sqlite3 /var/lib/thingconnect-pulse/pulse.db "ANALYZE;"

# Vacuum database
sqlite3 /var/lib/thingconnect-pulse/pulse.db "VACUUM;"

# Update statistics
sqlite3 /var/lib/thingconnect-pulse/pulse.db "UPDATE sqlite_stat1 SET stat = NULL;"
```

**Limit Concurrent Checks**
```yaml
monitoring:
  max_concurrent_checks: 50  # Reduce from default
  check_timeout: 5000        # 5 second timeout
```

### High Memory Usage

#### Symptoms
- Out of memory errors
- System swapping
- Process killed by OOM killer

#### Diagnosis
```bash
# Check memory usage
ps aux | grep thingconnect-pulse

# Monitor memory over time
watch -n 5 'ps -p $(pgrep thingconnect-pulse) -o pid,vsz,rss,pmem,comm'

# Check system memory
free -h
```

#### Solutions

**Configure Memory Limits**
```yaml
performance:
  memory_limit: "512MB"
  cache_size: "128MB"
  max_connections: 100
```

**Optimize Data Retention**
```yaml
data_retention:
  raw_data: "30 days"      # Reduce from 60 days
  rollup_data: "6 months"  # Reduce from 1 year
```

**Enable Memory Profiling**
```yaml
logging:
  memory_profiling: true
  gc_logging: true
```

### Database Issues

#### Database Corruption

**Symptoms**
- Database errors in logs
- Unexpected query failures
- Service crashes

**Diagnosis**
```bash
# Check database integrity
sqlite3 /var/lib/thingconnect-pulse/pulse.db "PRAGMA integrity_check;"

# Check for corruption
sqlite3 /var/lib/thingconnect-pulse/pulse.db "PRAGMA quick_check;"
```

**Recovery**
```bash
# Stop service
sudo systemctl stop thingconnect-pulse

# Backup corrupted database
cp /var/lib/thingconnect-pulse/pulse.db /var/lib/thingconnect-pulse/pulse.db.corrupt

# Attempt repair
sqlite3 /var/lib/thingconnect-pulse/pulse.db ".mode insert" ".output /tmp/dump.sql" ".dump"
sqlite3 /var/lib/thingconnect-pulse/pulse-new.db ".read /tmp/dump.sql"

# Replace with repaired database
mv /var/lib/thingconnect-pulse/pulse-new.db /var/lib/thingconnect-pulse/pulse.db

# Restart service
sudo systemctl start thingconnect-pulse
```

#### Database Lock Issues

**Symptoms**
- "Database is locked" errors
- Timeouts on database operations
- Service hangs

**Diagnosis**
```bash
# Check for active connections
lsof /var/lib/thingconnect-pulse/pulse.db

# Check for lock files
ls -la /var/lib/thingconnect-pulse/pulse.db-*
```

**Solutions**
```bash
# Remove stale lock files (service must be stopped)
sudo systemctl stop thingconnect-pulse
rm -f /var/lib/thingconnect-pulse/pulse.db-wal
rm -f /var/lib/thingconnect-pulse/pulse.db-shm
sudo systemctl start thingconnect-pulse

# Optimize database configuration
sqlite3 /var/lib/thingconnect-pulse/pulse.db "PRAGMA journal_mode = WAL;"
sqlite3 /var/lib/thingconnect-pulse/pulse.db "PRAGMA synchronous = NORMAL;"
```

### Network and Connectivity Issues

#### Monitoring Failures

**Symptoms**
- Multiple endpoints showing offline
- Intermittent connectivity issues
- DNS resolution failures

**Diagnosis**
```bash
# Test network connectivity from server
ping -c 4 8.8.8.8

# Test DNS resolution
nslookup google.com

# Check firewall rules
sudo iptables -L

# Test specific endpoint
curl -v http://endpoint-address/health
```

#### Solutions

**DNS Configuration**
```yaml
monitoring:
  dns_servers:
    - "8.8.8.8"
    - "8.8.4.4"
  dns_timeout: 5
```

**Network Timeouts**
```yaml
monitoring:
  default_timeout: 10      # Increase timeout
  retry_count: 5           # More retries
  retry_delay: 2           # Delay between retries
```

**Proxy Configuration**
```yaml
network:
  proxy:
    http_proxy: "http://proxy.company.com:8080"
    https_proxy: "http://proxy.company.com:8080"
    no_proxy: "localhost,127.0.0.1,.local"
```

### Performance Issues

#### Slow Dashboard Loading

**Symptoms**
- Web interface takes long to load
- API responses are slow
- Timeouts in browser

**Diagnosis**
```bash
# Test API response times
time curl http://localhost:8080/api/status/live

# Check database query performance
sqlite3 /var/lib/thingconnect-pulse/pulse.db \
"EXPLAIN QUERY PLAN SELECT * FROM live_status ORDER BY last_check DESC LIMIT 100;"

# Monitor request handling
tail -f /var/log/thingconnect-pulse/access.log
```

#### Solutions

**Database Optimization**
```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_monitoring_data_timestamp 
ON monitoring_data(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_live_status_endpoint
ON live_status(endpoint_id, last_check DESC);
```

**Caching Configuration**
```yaml
caching:
  enabled: true
  ttl: 30                    # 30 second cache
  max_size: "100MB"
  compression: true
```

**Connection Pooling**
```yaml
database:
  connection_pool_size: 20
  max_idle_connections: 5
  connection_timeout: 30
```

## Log Analysis

### Log Locations

#### System Logs
```bash
# Service logs
/var/log/thingconnect-pulse/pulse.log

# System service logs
journalctl -u thingconnect-pulse

# Application logs
/var/log/thingconnect-pulse/application.log

# Error logs
/var/log/thingconnect-pulse/error.log
```

### Common Log Patterns

#### Successful Operations
```
2024-01-15 10:30:00 [INFO] Monitoring check completed for endpoint 'router-01': ONLINE (2.5ms)
2024-01-15 10:30:15 [INFO] Configuration updated: 2 endpoints modified
2024-01-15 10:30:30 [INFO] Database cleanup completed: 1000 old records removed
```

#### Warning Signs
```
2024-01-15 10:30:00 [WARN] High response time for endpoint 'server-01': 8500ms
2024-01-15 10:30:15 [WARN] Database connection pool exhausted, waiting for available connection
2024-01-15 10:30:30 [WARN] Memory usage approaching limit: 85% used
```

#### Error Conditions
```
2024-01-15 10:30:00 [ERROR] Failed to connect to endpoint 'database-01': Connection timeout
2024-01-15 10:30:15 [ERROR] Database error: database is locked
2024-01-15 10:30:30 [ERROR] Configuration validation failed: Invalid YAML syntax
```

### Log Analysis Tools

#### Built-in Log Viewer
```bash
# View recent logs
thingconnect-pulse --logs --tail 100

# Filter by log level
thingconnect-pulse --logs --level ERROR

# Search logs
thingconnect-pulse --logs --search "database"
```

#### Command Line Analysis
```bash
# Count error types
grep "ERROR" /var/log/thingconnect-pulse/pulse.log | awk '{print $4}' | sort | uniq -c

# Monitor logs in real-time
tail -f /var/log/thingconnect-pulse/pulse.log | grep -E "(ERROR|WARN)"

# Analyze response times
grep "response time" /var/log/thingconnect-pulse/pulse.log | awk '{print $(NF-1)}' | sort -n
```

## Configuration Validation

### YAML Syntax Validation

```bash
# Check YAML syntax
yamllint /etc/thingconnect-pulse/pulse.yaml

# Validate with built-in validator
thingconnect-pulse --validate-config --config /etc/thingconnect-pulse/pulse.yaml
```

### Schema Validation

```bash
# Validate against schema
thingconnect-pulse --validate-schema --config /etc/thingconnect-pulse/pulse.yaml

# Check for deprecated settings
thingconnect-pulse --check-deprecated --config /etc/thingconnect-pulse/pulse.yaml
```

### Common Configuration Errors

#### Invalid Endpoint Configuration
```yaml
# WRONG: Missing required fields
endpoints:
  - name: "Server"
    # Missing address and type

# CORRECT: Complete configuration
endpoints:
  - name: "Server"
    address: "192.168.1.100"
    type: "icmp"
```

#### Invalid Time Formats
```yaml
# WRONG: Invalid interval
interval: "30s"  # Should be integer seconds

# CORRECT: Integer seconds
interval: 30
```

#### Circular Dependencies
```yaml
# WRONG: Group references itself
groups:
  - name: "servers"
    parent: "servers"  # Circular reference

# CORRECT: Valid hierarchy
groups:
  - name: "infrastructure"
  - name: "servers"
    parent: "infrastructure"
```

## Monitoring System Health

### Health Check Endpoints

```bash
# Basic health check
curl http://localhost:8080/api/health

# Detailed health information
curl http://localhost:8080/api/health/detailed

# Database health
curl http://localhost:8080/api/health/database

# System resources
curl http://localhost:8080/api/health/resources
```

### System Metrics

#### Key Performance Indicators
- **Response Time**: Average API response time < 200ms
- **CPU Usage**: Average CPU usage < 70%
- **Memory Usage**: Memory usage < 80%
- **Database Performance**: Query time < 100ms
- **Error Rate**: Error rate < 1%

#### Monitoring Commands
```bash
# CPU usage over time
sar -u 5 12  # 5-second intervals, 12 samples

# Memory usage
free -m -s 5  # Memory stats every 5 seconds

# Disk I/O
iostat -x 5   # Extended disk stats every 5 seconds

# Network statistics
ss -tuln | grep :8080  # Check listening ports
```

## Getting Help

### Support Information Collection

Before contacting support, collect the following information:

#### System Information
```bash
# System details
uname -a
cat /etc/os-release

# ThingConnect Pulse version
thingconnect-pulse --version

# Service status
systemctl status thingconnect-pulse
```

#### Configuration Export
```bash
# Export anonymized configuration
thingconnect-pulse --export-config --anonymize > pulse-config.yaml

# Export system diagnostics
thingconnect-pulse --diagnostics > pulse-diagnostics.txt
```

#### Log Collection
```bash
# Collect recent logs
tar -czf pulse-logs.tar.gz \
  /var/log/thingconnect-pulse/ \
  /var/log/syslog \
  /var/log/messages

# Include system information
dmesg > system-messages.txt
journalctl -u thingconnect-pulse --since "24 hours ago" > service-logs.txt
```

### Support Channels

#### Community Support
- **GitHub Issues**: Bug reports and feature requests
- **Community Forum**: User discussions and tips
- **Documentation**: Comprehensive online documentation

#### Commercial Support
- **Email Support**: support@thingconnect.io
- **Phone Support**: Available for enterprise customers
- **Professional Services**: Implementation and training

### Emergency Procedures

#### Service Recovery
1. **Stop the service**: `sudo systemctl stop thingconnect-pulse`
2. **Check logs**: Review error messages
3. **Backup data**: Protect current state
4. **Restore from backup**: If corruption detected
5. **Restart service**: `sudo systemctl start thingconnect-pulse`

#### Data Recovery
1. **Assess damage**: Determine extent of data loss
2. **Stop writes**: Prevent further corruption
3. **Restore backup**: Use most recent clean backup
4. **Verify integrity**: Check restored data
5. **Resume operations**: Restart monitoring

#### Escalation Procedures
1. **Assess severity**: Critical, high, medium, low
2. **Follow runbook**: Use documented procedures
3. **Notify stakeholders**: Alert relevant teams
4. **Engage support**: Contact technical support
5. **Document incident**: Record for future reference