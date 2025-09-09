---
sidebar_position: 2
---

# Initial Setup

Configure your first monitoring endpoints and get ThingConnect Pulse running.

## First-Time Setup Wizard

When you first access ThingConnect Pulse, you'll be guided through the setup process:

### 1. Create Administrator Account

- Set up your first admin user account
- Choose a strong password
- Configure your email preferences

### 2. Configure Basic Settings

- **System Name**: Give your monitoring system a name
- **Time Zone**: Set your local time zone
- **Retention Policy**: Configure data retention (default: 60 days)

### 3. Add Your First Endpoints

Start monitoring immediately by adding endpoints:

- **ICMP Ping**: Monitor device availability
- **TCP Port**: Check service accessibility  
- **HTTP/HTTPS**: Monitor web services and APIs

## Configuration Methods

### Method 1: Web Interface (Recommended)

Use the built-in configuration editor:

1. Navigate to **Configuration** in the sidebar
2. Click **Add Endpoint**
3. Fill in the endpoint details
4. **Save** and activate monitoring

### Method 2: YAML Configuration

For advanced users or bulk configuration:

1. Edit the YAML configuration file
2. Upload through the web interface
3. Validate and apply changes

## Essential Endpoints

Consider monitoring these critical endpoints first:

- **Network Gateway**: Your primary router/firewall
- **Domain Controllers**: Active Directory servers
- **Critical Servers**: Database, file, and application servers
- **Internet Connectivity**: External connectivity check

## Monitoring Configuration

### Basic Settings

- **Check Interval**: How often to test each endpoint (default: 30 seconds)
- **Timeout**: How long to wait for a response (default: 5 seconds)
- **Retry Count**: Number of retries before marking as failed (default: 3)

### Advanced Settings

- **Flap Damping**: Prevent alert storms from intermittent failures
- **Maintenance Windows**: Schedule maintenance periods
- **Alert Thresholds**: Customize when alerts are triggered

## Validation

After setup, verify everything is working:

1. **Check Dashboard**: View real-time status of all endpoints
2. **Review Logs**: Ensure monitoring is running without errors
3. **Test Alerts**: Verify notification delivery

## Next Steps

Once your initial setup is complete:

- [First Login](first-login) - Learn how to navigate the interface
- [Dashboard Overview](../user-guide/dashboard) - Understand the monitoring dashboard
- [Adding More Endpoints](../user-guide/monitoring-endpoints) - Expand your monitoring coverage