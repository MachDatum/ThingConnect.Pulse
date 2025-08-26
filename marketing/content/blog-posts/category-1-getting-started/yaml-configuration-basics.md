# YAML Configuration Basics for ThingConnect Pulse

**SEO Slug**: `/blog/yaml-configuration-basics-thingconnect-pulse-setup`

**Meta Description**: Master YAML configuration for ThingConnect Pulse network monitoring. Complete guide with examples, best practices, and troubleshooting for manufacturing environments.

**Keywords**: YAML configuration ThingConnect Pulse, network monitoring configuration, manufacturing YAML setup, device configuration examples

---

<!-- IMAGE NEEDED: Header image showing YAML code on screen with manufacturing equipment in background -->

Walking into a plant last month, I met an IT manager who'd been struggling with their expensive network monitoring tool for weeks. "The GUI keeps changing our settings," he said, "and we can't track what changed when." That's when I introduced him to ThingConnect Pulse's YAML-based configuration approach.

Three days later, he called back: "This is exactly what we needed. Configuration as code means we can version control our monitoring setup just like our PLC programs."

If you've ever been frustrated by point-and-click configuration tools that make it impossible to track changes, replicate setups, or quickly deploy monitoring across multiple sites, YAML configuration will transform how you approach network monitoring.

## Why YAML for Manufacturing Network Monitoring?

### The Problems with GUI-Only Configuration:
- **No change tracking**: Who modified the alert threshold last week?
- **Difficult replication**: Setting up identical monitoring at Plant B requires manual clicking
- **No backup strategy**: GUI configurations are often stored in proprietary formats
- **Team collaboration**: Only one person can configure at a time

### The YAML Advantage:
- **Version Control**: Track every configuration change with Git
- **Documentation**: Comments explain why settings were chosen
- **Replication**: Copy configurations between similar environments
- **Automation**: Deploy configurations programmatically
- **Team Collaboration**: Multiple engineers can work on configurations

<!-- IMAGE NEEDED: Side-by-side comparison showing GUI configuration vs YAML file -->

## YAML Basics: What You Need to Know

YAML (Yet Another Markup Language) is a human-readable data format that's perfect for configuration files. Here's what makes it work well for manufacturing:

### Core YAML Concepts:

```yaml
# Comments start with hash symbols - use these for documentation
key: value
another_key: "strings can be quoted or not"
number_key: 42
boolean_key: true

# Lists use dashes
devices:
  - name: "PLC-Line-1"
  - name: "HMI-Station-A"
  - name: "Network-Switch-Main"

# Nested structures use indentation (spaces, not tabs!)
device_groups:
  production_line_1:
    priority: critical
    alert_email: production@company.com
  maintenance_systems:
    priority: normal
    alert_email: maintenance@company.com
```

**Critical Rule**: YAML uses spaces for indentation, never tabs. Mixing them will cause errors.

## ThingConnect Pulse Configuration Structure

Your main configuration file is located at:
`C:\ProgramData\ThingConnect\Pulse\config.yaml`

<!-- IMAGE NEEDED: File explorer screenshot showing the configuration file location -->

Here's the basic structure every ThingConnect Pulse configuration follows:

```yaml
# ThingConnect Pulse Configuration
# Plant: Main Manufacturing Facility
# Last Updated: 2024-01-15
# Updated By: John Smith, Plant IT Manager

# Global Settings
global:
  plant_name: "Main Manufacturing Facility"
  timezone: "America/Chicago"
  data_retention_days: 60
  
# Network Discovery Settings
discovery:
  enabled: true
  subnets:
    - "192.168.1.0/24"    # Production Network
    - "192.168.10.0/24"   # Control Systems Network
  scan_interval: "1h"     # Hourly discovery scans
  
# Device Monitoring Configuration
devices:
  # Individual device definitions go here
  
# Device Groups for Organization
groups:
  # Logical groupings of devices
  
# Alerting Configuration
alerts:
  # Alert rules and notification settings
  
# Dashboard Layout
dashboards:
  # Custom dashboard configurations
```

## Device Configuration Examples

### Basic Device Monitoring:

```yaml
devices:
  # Simple ICMP ping monitoring
  - name: "PLC-Assembly-Line-1"
    address: "192.168.1.50"
    type: "plc"
    monitor_types:
      - icmp
    check_interval: "30s"
    timeout: "5s"
    description: "Main assembly line PLC - critical production system"
    
  # Web interface monitoring
  - name: "HMI-Station-A"
    address: "192.168.1.75"
    type: "hmi"
    monitor_types:
      - icmp
      - tcp
    tcp_port: 80
    check_interval: "1m"
    description: "Operator interface station - Line A"
```

### Advanced Device Configuration:

```yaml
devices:
  # SNMP monitoring with custom OIDs
  - name: "Network-Switch-Main"
    address: "192.168.1.1"
    type: "network_switch"
    monitor_types:
      - icmp
      - snmp
    snmp:
      version: "2c"
      community: "public"
      port: 161
      timeout: "10s"
      custom_oids:
        - name: "cpu_usage"
          oid: "1.3.6.1.4.1.9.2.1.58.0"
          warning_threshold: 70
          critical_threshold: 85
        - name: "memory_usage"
          oid: "1.3.6.1.4.1.9.2.1.8.0"
          warning_threshold: 80
          critical_threshold: 90
    check_interval: "2m"
    
  # HTTP/HTTPS application monitoring
  - name: "MES-Server"
    address: "192.168.1.100"
    type: "server"
    monitor_types:
      - icmp
      - http
    http:
      url: "https://192.168.1.100/health"
      method: "GET"
      expected_status: 200
      expected_content: "OK"
      ssl_verify: true
      timeout: "30s"
    check_interval: "1m"
```

<!-- IMAGE NEEDED: Screenshot of YAML configuration file in a text editor with syntax highlighting -->

## Device Groups and Organization

Organizing devices into logical groups makes management much easier:

```yaml
groups:
  # Group by production line
  production_line_1:
    description: "Assembly Line 1 - Main Product"
    priority: "critical"
    devices:
      - "PLC-Assembly-Line-1"
      - "HMI-Station-A"
      - "Vision-System-A1"
      - "Barcode-Scanner-A1"
    maintenance_window:
      day: "sunday"
      start_time: "02:00"
      duration: "4h"
      
  # Group by system type
  network_infrastructure:
    description: "Core networking equipment"
    priority: "critical"
    devices:
      - "Network-Switch-Main"
      - "Network-Switch-Floor-1"
      - "Network-Switch-Floor-2"
      - "Wireless-Access-Point-1"
    maintenance_window:
      day: "saturday"
      start_time: "01:00"
      duration: "2h"
      
  # Group by criticality level
  production_critical:
    description: "Systems that directly impact production"
    priority: "critical"
    devices:
      - "PLC-Assembly-Line-1"
      - "PLC-Assembly-Line-2"
      - "MES-Server"
      - "Quality-Database-Server"
```

## Alert Configuration

Manufacturing environments need smart alerting that understands production schedules:

```yaml
alerts:
  # Global alert settings
  global:
    enabled: true
    default_retry_count: 3
    escalation_delay: "15m"
    
  # Email notification settings
  email:
    smtp_server: "mail.company.com"
    smtp_port: 587
    username: "pulse-alerts@company.com"
    password: "${EMAIL_PASSWORD}"  # Use environment variables for secrets
    from_address: "pulse-alerts@company.com"
    
  # Alert rules
  rules:
    # Critical production systems
    - name: "Production Critical Down"
      condition: "device_down"
      device_groups: ["production_critical"]
      severity: "critical"
      notification_methods: ["email", "sms"]
      recipients:
        - "production-manager@company.com"
        - "plant-it@company.com"
      message: "CRITICAL: Production system {{device_name}} is down"
      
    # Network infrastructure alerts
    - name: "Network Infrastructure Issues"
      condition: "device_down OR high_latency"
      device_groups: ["network_infrastructure"]
      severity: "warning"
      notification_methods: ["email"]
      recipients:
        - "network-admin@company.com"
      message: "Network issue detected: {{device_name}} - {{condition}}"
      
    # Maintenance window suppression
    - name: "Suppress During Maintenance"
      condition: "maintenance_window_active"
      action: "suppress_alerts"
      device_groups: ["all"]
```

<!-- IMAGE NEEDED: Email alert example showing formatted alert message -->

## Configuration Best Practices

### 1. Use Comments Extensively:

```yaml
# Production Line 1 Configuration
# Contact: John Smith (ext. 1234)
# Last Major Change: 2024-01-15 - Added vision system monitoring
# Next Review Date: 2024-04-15

devices:
  - name: "PLC-Assembly-Line-1"
    address: "192.168.1.50"
    # Check every 30 seconds due to JIT production requirements
    check_interval: "30s"
    # 5 second timeout - faster detection of issues
    timeout: "5s"
```

### 2. Environment-Specific Configurations:

```yaml
# Use environment variables for site-specific settings
global:
  plant_name: "${PLANT_NAME}"           # Set per environment
  timezone: "${PLANT_TIMEZONE}"
  alert_email: "${ALERT_EMAIL}"

# Use includes for common device types
device_templates: !include templates/plc-template.yaml
```

### 3. Validation and Testing:

```yaml
# Include test configurations that can be validated
test_devices:
  - name: "Test-Localhost"
    address: "127.0.0.1"
    type: "test"
    monitor_types: ["icmp"]
    check_interval: "1m"
```

## Configuration File Management

### Version Control Strategy:

<!-- IMAGE NEEDED: Screenshot of Git repository showing configuration file history -->

1. **Initialize Git repository** in your configuration directory:
   ```bash
   cd "C:\ProgramData\ThingConnect\Pulse\"
   git init
   git add config.yaml
   git commit -m "Initial ThingConnect Pulse configuration"
   ```

2. **Create meaningful commit messages**:
   ```bash
   git commit -m "Add monitoring for new packaging line PLCs"
   git commit -m "Update alert thresholds based on baseline analysis"
   git commit -m "Add maintenance window for weekend upgrades"
   ```

3. **Use branches for major changes**:
   ```bash
   git checkout -b "add-line-2-monitoring"
   # Make configuration changes
   git add config.yaml
   git commit -m "Configure monitoring for production line 2"
   git checkout main
   git merge add-line-2-monitoring
   ```

### Backup and Recovery:

```yaml
# Document backup procedures in configuration
# Backup Strategy:
# - Daily automated backup to network share
# - Weekly backup to cloud storage
# - Configuration stored in Git repository
# - Test restoration monthly

backup:
  enabled: true
  schedule: "0 2 * * *"  # Daily at 2 AM
  retention_days: 30
  destinations:
    - type: "file"
      path: "//backup-server/pulse-configs/"
    - type: "email"
      address: "it-backup@company.com"
```

## Common Configuration Patterns

### Pattern 1: Production Line Template

```yaml
# Template for production line monitoring
production_line_template: &production_line
  check_interval: "30s"
  timeout: "5s"
  priority: "critical"
  alert_groups: ["production", "management"]
  maintenance_window:
    day: "sunday"
    start_time: "02:00"
    duration: "4h"

# Use the template
devices:
  - name: "PLC-Line-1"
    address: "192.168.1.50"
    <<: *production_line
    
  - name: "PLC-Line-2"
    address: "192.168.1.51"
    <<: *production_line
```

### Pattern 2: Environment-Specific Overrides

```yaml
# Base configuration
base_config: &base
  check_interval: "1m"
  timeout: "10s"
  
# Production overrides (faster monitoring)
production_overrides: &production
  check_interval: "30s"
  timeout: "5s"
  
# Development overrides (slower monitoring)
development_overrides: &development
  check_interval: "5m"
  timeout: "30s"
```

## Troubleshooting YAML Configuration

### Common Syntax Errors:

**Problem**: Mixed tabs and spaces
```yaml
# Wrong - mixing tabs and spaces
devices:
    - name: "PLC-1"      # 4 spaces
	address: "192.168.1.50"  # tab character - ERROR!
```

**Solution**: Use only spaces (2 or 4 spaces consistently)
```yaml
# Correct - consistent spacing
devices:
  - name: "PLC-1"        # 2 spaces
    address: "192.168.1.50"  # 4 spaces
```

**Problem**: Incorrect list syntax
```yaml
# Wrong
devices:
- name: "PLC-1"
address: "192.168.1.50"  # Missing dash for list item
```

**Solution**: Each list item needs a dash
```yaml
# Correct
devices:
  - name: "PLC-1"
    address: "192.168.1.50"
```

### Validation Tools:

<!-- IMAGE NEEDED: Screenshot of YAML validator showing syntax error -->

ThingConnect Pulse includes built-in configuration validation:

```bash
# Command line validation
pulse-config validate config.yaml

# Output example:
✓ YAML syntax is valid
✓ All required fields present
✓ Device addresses are reachable
⚠ Warning: Device 'Old-PLC' not responding
✗ Error: Invalid email address in alerts configuration
```

## Real-World Configuration Example

Here's a complete configuration for a small manufacturing facility:

```yaml
# Small Manufacturing Plant Configuration
# Plant: ABC Manufacturing - Building A
# IT Contact: Jane Doe (jane.doe@abc-mfg.com)
# Last Updated: 2024-01-15

global:
  plant_name: "ABC Manufacturing - Building A"
  timezone: "America/New_York"
  data_retention_days: 60
  polling_threads: 10

discovery:
  enabled: true
  subnets:
    - "192.168.100.0/24"  # Production Network
    - "192.168.200.0/24"  # Office Network
  scan_interval: "2h"
  
# Device Groups
groups:
  production_critical:
    description: "Systems that directly impact production"
    devices:
      - "Main-PLC"
      - "HMI-Station-1"
      - "Quality-Server"
  
  infrastructure:
    description: "Network and IT infrastructure"
    devices:
      - "Core-Switch"
      - "WiFi-AP-Floor1"

# Device Definitions
devices:
  # Production Systems
  - name: "Main-PLC"
    address: "192.168.100.10"
    type: "plc"
    monitor_types: ["icmp", "tcp"]
    tcp_port: 502  # Modbus TCP
    check_interval: "30s"
    group: "production_critical"
    
  - name: "HMI-Station-1"
    address: "192.168.100.15"
    type: "hmi"
    monitor_types: ["icmp", "http"]
    http:
      url: "http://192.168.100.15/"
      expected_status: 200
    check_interval: "1m"
    group: "production_critical"
    
  # Infrastructure
  - name: "Core-Switch"
    address: "192.168.100.1"
    type: "switch"
    monitor_types: ["icmp", "snmp"]
    snmp:
      version: "2c"
      community: "public"
    check_interval: "2m"
    group: "infrastructure"

# Alerting
alerts:
  email:
    smtp_server: "smtp.office365.com"
    smtp_port: 587
    username: "alerts@abc-mfg.com"
    from_address: "pulse-alerts@abc-mfg.com"
    
  rules:
    - name: "Production Critical Alert"
      condition: "device_down"
      device_groups: ["production_critical"]
      severity: "critical"
      notification_methods: ["email"]
      recipients:
        - "production@abc-mfg.com"
        - "it@abc-mfg.com"
```

## Next Steps: Advanced Configuration

Once you've mastered basic YAML configuration, you can explore:

- **Custom monitoring plugins** for specialized equipment
- **API integration** for automated configuration updates  
- **Multi-site configuration management** using Git repositories
- **Configuration templates** for standardized deployments

## Why Configuration-as-Code Matters in Manufacturing

Manufacturing environments are complex, critical, and constantly evolving. YAML configuration gives you:

- **Audit Trail**: Know exactly who changed what and when
- **Disaster Recovery**: Quickly restore monitoring after system failures
- **Standardization**: Ensure consistent monitoring across multiple facilities
- **Collaboration**: Enable team-based configuration management
- **Documentation**: Configuration files become living documentation

**Ready to implement YAML configuration?** Download ThingConnect Pulse free and experience the power of configuration-as-code for manufacturing network monitoring.

**Need help with YAML configuration?** Join our community forum where manufacturing IT professionals share configuration examples and best practices.

---

**About ThingConnect Pulse**: Free network monitoring software designed specifically for manufacturing environments. Features YAML-based configuration, version control integration, and manufacturing-aware alerting.