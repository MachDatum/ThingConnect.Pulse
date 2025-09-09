---
sidebar_position: 2
---

# Backup and Restore

Comprehensive backup and disaster recovery procedures for ThingConnect Pulse.

## Backup Overview

ThingConnect Pulse provides multiple backup strategies to protect your monitoring data and configuration.

### What Gets Backed Up

#### Essential Data
- **Database**: Complete SQLite database with all monitoring data
- **Configuration Files**: YAML configuration and system settings
- **User Data**: User accounts, roles, and preferences
- **System Settings**: Application configuration and preferences

#### Optional Data
- **Log Files**: Application and system logs
- **Temporary Files**: Cache and temporary data (usually excluded)
- **SSL Certificates**: Custom SSL certificates and keys
- **Custom Scripts**: User-defined scripts and extensions

## Automated Backup

### Backup Configuration

Configure automated backups through the administration interface.

#### Backup Schedule
```yaml
backup:
  enabled: true
  schedule: "0 2 * * *"  # Daily at 2 AM
  retention: 30          # Keep 30 backups
  compression: gzip      # Compression method
  destination: /backups/pulse
```

#### Backup Types

**Full Backup**
- Complete database and configuration backup
- Recommended for disaster recovery
- Larger file size but complete restore capability

**Incremental Backup**
- Only changes since last backup
- Faster backup process
- Requires full backup as baseline

**Differential Backup**
- Changes since last full backup
- Balance between speed and completeness
- Easier restoration than incremental

### Backup Storage Options

#### Local Storage
```bash
# Default backup location
/var/lib/thingconnect-pulse/backups/
├── daily/
│   ├── pulse-backup-2024-01-15.tar.gz
│   ├── pulse-backup-2024-01-14.tar.gz
│   └── ...
├── weekly/
└── monthly/
```

#### Network Storage
```yaml
backup:
  storage:
    type: network
    location: //backup-server/pulse-backups
    credentials:
      username: backup-user
      password: ${BACKUP_PASSWORD}
```

#### Cloud Storage
```yaml
backup:
  storage:
    type: s3
    bucket: company-pulse-backups
    region: us-west-2
    encryption: AES256
    credentials:
      accessKey: ${AWS_ACCESS_KEY}
      secretKey: ${AWS_SECRET_KEY}
```

## Manual Backup

### Using the Web Interface

1. **Navigate to Administration** → **Backup & Restore**
2. **Click "Create Backup"**
3. **Select backup options:**
   - Backup type (full, incremental)
   - Include logs (optional)
   - Compression level
4. **Start backup process**
5. **Download backup file** when complete

### Command Line Backup

#### Database Backup
```bash
# Stop the service (optional but recommended)
sudo systemctl stop thingconnect-pulse

# Create database backup
sqlite3 /var/lib/thingconnect-pulse/pulse.db ".backup '/backups/pulse-db-$(date +%Y%m%d).db'"

# Create configuration backup
tar -czf /backups/pulse-config-$(date +%Y%m%d).tar.gz /etc/thingconnect-pulse/

# Restart service
sudo systemctl start thingconnect-pulse
```

#### Complete System Backup
```bash
#!/bin/bash
# pulse-backup.sh - Complete backup script

BACKUP_DIR="/backups/pulse"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="pulse-backup-${DATE}.tar.gz"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Stop service for consistent backup
sudo systemctl stop thingconnect-pulse

# Create compressed backup
tar -czf ${BACKUP_DIR}/${BACKUP_FILE} \
  /var/lib/thingconnect-pulse/ \
  /etc/thingconnect-pulse/ \
  /var/log/thingconnect-pulse/

# Restart service
sudo systemctl start thingconnect-pulse

# Clean up old backups (keep last 30)
find ${BACKUP_DIR} -name "pulse-backup-*.tar.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_DIR}/${BACKUP_FILE}"
```

## Backup Verification

### Automated Verification

```yaml
backup:
  verification:
    enabled: true
    testRestore: true          # Test restore on temp location
    checksumVerification: true # Verify backup integrity
    notifyOnFailure: true     # Alert on verification failure
```

### Manual Verification

#### Checksum Verification
```bash
# Create checksum during backup
sha256sum pulse-backup-20240115.tar.gz > pulse-backup-20240115.sha256

# Verify checksum
sha256sum -c pulse-backup-20240115.sha256
```

#### Test Restore
```bash
# Extract to temporary location
mkdir /tmp/pulse-restore-test
tar -xzf pulse-backup-20240115.tar.gz -C /tmp/pulse-restore-test

# Verify database integrity
sqlite3 /tmp/pulse-restore-test/var/lib/thingconnect-pulse/pulse.db "PRAGMA integrity_check;"
```

## Restoration Procedures

### Complete System Restore

#### Prerequisites
1. **Stop ThingConnect Pulse service**
2. **Backup current installation** (if recovering from corruption)
3. **Verify backup integrity** before restoration
4. **Ensure sufficient disk space**

#### Restoration Steps

**Step 1: Stop Services**
```bash
sudo systemctl stop thingconnect-pulse
sudo systemctl stop nginx  # If using reverse proxy
```

**Step 2: Backup Current State**
```bash
# Move current installation
sudo mv /var/lib/thingconnect-pulse /var/lib/thingconnect-pulse.old
sudo mv /etc/thingconnect-pulse /etc/thingconnect-pulse.old
```

**Step 3: Extract Backup**
```bash
# Extract backup to root
sudo tar -xzf pulse-backup-20240115.tar.gz -C /

# Restore ownership and permissions
sudo chown -R pulse:pulse /var/lib/thingconnect-pulse
sudo chown -R root:root /etc/thingconnect-pulse
sudo chmod -R 644 /etc/thingconnect-pulse
sudo chmod 755 /etc/thingconnect-pulse
```

**Step 4: Verify Restoration**
```bash
# Check database integrity
sqlite3 /var/lib/thingconnect-pulse/pulse.db "PRAGMA integrity_check;"

# Verify configuration
thingconnect-pulse --validate-config
```

**Step 5: Restart Services**
```bash
sudo systemctl start thingconnect-pulse
sudo systemctl start nginx

# Verify services are running
sudo systemctl status thingconnect-pulse
```

### Selective Restore

#### Configuration Only
```bash
# Stop service
sudo systemctl stop thingconnect-pulse

# Extract only configuration
tar -xzf pulse-backup-20240115.tar.gz -C / etc/thingconnect-pulse/

# Restart service
sudo systemctl start thingconnect-pulse
```

#### Database Only
```bash
# Stop service
sudo systemctl stop thingconnect-pulse

# Restore database
sqlite3 /var/lib/thingconnect-pulse/pulse.db ".restore '/backups/pulse-db-20240115.db'"

# Restart service
sudo systemctl start thingconnect-pulse
```

### Point-in-Time Recovery

For more granular recovery using incremental backups:

#### Restore Process
1. **Restore latest full backup**
2. **Apply incremental backups in chronological order**
3. **Stop at desired point in time**
4. **Verify data consistency**

#### Example Recovery Script
```bash
#!/bin/bash
# point-in-time-restore.sh

TARGET_DATE="2024-01-15 14:30:00"
BACKUP_DIR="/backups/pulse"

# Find full backup before target date
FULL_BACKUP=$(find ${BACKUP_DIR} -name "*full*.tar.gz" -newermt "${TARGET_DATE}" | head -1)

# Restore full backup
echo "Restoring full backup: ${FULL_BACKUP}"
tar -xzf ${FULL_BACKUP} -C /

# Apply incremental backups up to target time
for INCREMENTAL in $(find ${BACKUP_DIR} -name "*incremental*.tar.gz" -newermt "$(stat -c %Y ${FULL_BACKUP})" -not -newermt "${TARGET_DATE}" | sort); do
    echo "Applying incremental: ${INCREMENTAL}"
    tar -xzf ${INCREMENTAL} -C /
done
```

## Disaster Recovery

### Recovery Planning

#### Recovery Time Objective (RTO)
- **Critical Systems**: 1 hour maximum downtime
- **Standard Operations**: 4 hour recovery window
- **Non-Critical Features**: 24 hour recovery window

#### Recovery Point Objective (RPO)
- **Monitoring Data**: Maximum 15 minutes data loss
- **Configuration Changes**: No data loss acceptable
- **User Data**: Maximum 1 hour data loss

### High Availability Setup

#### Primary-Secondary Configuration
```yaml
ha:
  primary:
    node: pulse-primary
    address: 192.168.1.10
  secondary:
    node: pulse-secondary  
    address: 192.168.1.11
  replication:
    mode: asynchronous
    lag_threshold: 60s
```

#### Load Balancer Configuration
```nginx
upstream pulse_backend {
    server 192.168.1.10:8080 max_fails=3 fail_timeout=30s;
    server 192.168.1.11:8080 max_fails=3 fail_timeout=30s backup;
}

server {
    listen 80;
    location / {
        proxy_pass http://pulse_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        health_check;
    }
}
```

### Failover Procedures

#### Automatic Failover
```bash
#!/bin/bash
# failover-monitor.sh

PRIMARY="192.168.1.10:8080"
SECONDARY="192.168.1.11:8080"

while true; do
    if ! curl -f http://${PRIMARY}/api/health; then
        echo "Primary failed, initiating failover"
        
        # Update load balancer
        nginx -s reload
        
        # Notify administrators
        echo "Failover completed" | mail -s "Pulse Failover" admin@company.com
        
        # Wait for primary recovery
        while ! curl -f http://${PRIMARY}/api/health; do
            sleep 30
        done
        
        echo "Primary recovered, failing back"
        nginx -s reload
    fi
    
    sleep 10
done
```

## Best Practices

### Backup Strategy

#### 3-2-1 Rule
- **3 copies** of important data
- **2 different** storage media types
- **1 copy** stored off-site

#### Backup Scheduling
- **Daily backups** during low-usage periods
- **Weekly full backups** for complete recovery
- **Monthly off-site backups** for disaster recovery
- **Immediate backups** before major changes

### Security Considerations

#### Backup Encryption
```bash
# Encrypt backup with GPG
gpg --cipher-algo AES256 --compress-algo 1 --symmetric \
    --output pulse-backup-encrypted.tar.gz.gpg \
    pulse-backup-20240115.tar.gz
```

#### Access Control
- **Restrict backup access** to authorized personnel only
- **Use dedicated backup accounts** with minimal privileges
- **Audit backup access** and restoration activities
- **Secure backup storage** locations and transport

### Monitoring and Alerting

#### Backup Monitoring
```yaml
monitoring:
  backup_success: true
  backup_duration: 3600  # Alert if backup takes > 1 hour
  backup_size: 10GB      # Alert if backup size exceeds threshold
  missing_backups: 24h   # Alert if no backup in 24 hours
```

#### Restoration Testing
- **Monthly restoration tests** on non-production systems
- **Quarterly disaster recovery drills**
- **Annual full recovery testing**
- **Document all test results** and improvements

### Documentation

#### Backup Documentation
- **Backup procedures** and schedules
- **Storage locations** and access credentials
- **Retention policies** and cleanup procedures
- **Contact information** for backup administrators

#### Recovery Documentation
- **Step-by-step recovery procedures**
- **Emergency contact information**
- **System dependencies** and prerequisites
- **Post-recovery verification** checklists

## Troubleshooting

### Common Backup Issues

#### Insufficient Disk Space
```bash
# Check available space
df -h /backups

# Clean old backups
find /backups -name "*.tar.gz" -mtime +30 -delete

# Monitor disk usage
watch df -h /backups
```

#### Backup Corruption
```bash
# Test backup integrity
tar -tzf pulse-backup-20240115.tar.gz > /dev/null
echo $?  # 0 = success, non-zero = corruption

# Attempt repair (limited success)
tar --ignore-failed-read -xzf pulse-backup-20240115.tar.gz
```

#### Database Lock Issues
```bash
# Check for active connections
sqlite3 /var/lib/thingconnect-pulse/pulse.db ".databases"

# Force unlock (use with caution)
sqlite3 /var/lib/thingconnect-pulse/pulse.db "BEGIN IMMEDIATE; ROLLBACK;"
```

### Recovery Issues

#### Service Won't Start After Restore
1. **Check log files** for error messages
2. **Verify file permissions** and ownership
3. **Validate configuration** files
4. **Check database integrity**
5. **Review system dependencies**

#### Data Inconsistency After Restore
1. **Run database integrity checks**
2. **Compare with backup checksums**
3. **Verify restoration procedure**
4. **Check for partial restoration**
5. **Consider point-in-time recovery**