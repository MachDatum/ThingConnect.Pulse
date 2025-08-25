# ThingConnect Pulse - Installer Conventions

This document defines the standardized conventions for installing, configuring, and managing ThingConnect Pulse as a Windows service.

## Service Configuration

### Service Details
- **Service Name**: `ThingConnectPulseSvc`
- **Display Name**: `ThingConnect Pulse Server`
- **Description**: `Network availability monitoring system for manufacturing sites`
- **Startup Type**: `Automatic`
- **Log On As**: `Local System`

### Service Account Permissions
The Local System account requires:
- Read/Write access to `%ProgramData%\ThingConnect.Pulse\*`
- Network access for probe monitoring
- Event log write permissions

## Directory Structure

All application data is stored under `%ProgramData%\ThingConnect.Pulse\`:

```
C:\ProgramData\ThingConnect.Pulse\
├── config\
│   └── config.yaml              # Main configuration file
├── versions\
│   └── yyyymmdd_hhmmss_*.yaml   # Configuration version history
├── logs\
│   └── pulse-yyyymmdd.log       # Daily rolling log files
└── data\
    └── pulse.db                 # SQLite database
```

### Directory Purposes

#### `/config/`
- Contains the active configuration file (`config.yaml`)
- User-editable YAML configuration
- Validated against schema on application startup
- Backed up to `/versions/` on each successful apply

#### `/versions/`
- Stores historical configuration versions
- Named with timestamp and hash: `20241224_143022_a1b2c3d4.yaml`
- Used for configuration rollback and audit trail
- Automatically cleaned up after 90 days

#### `/logs/`
- Daily rolling log files with 30-day retention
- Named: `pulse-yyyymmdd.log`
- Structured logging with JSON format
- Log levels: Information, Warning, Error
- No sensitive data logged (passwords, keys, etc.)

#### `/data/`
- SQLite database file (`pulse.db`)
- Contains monitoring data, rollups, and metadata
- Automatic backup before schema migrations
- Raw data retention: 60 days (configurable)

## Installation Process

### Pre-Installation
1. Verify .NET 8 Runtime is installed
2. Check Windows version compatibility (Windows 10+, Server 2016+)
3. Verify Administrator privileges

### Installation Steps
1. Copy application binaries to `%ProgramFiles%\ThingConnect.Pulse\`
2. Create directory structure under `%ProgramData%\ThingConnect.Pulse\`
3. Set directory permissions for Local System account
4. Install Windows service with automatic startup
5. Create default configuration file if none exists
6. Initialize SQLite database with schema
7. Start service and verify operation

### Post-Installation
- Service starts automatically on system boot
- Web interface available at `http://localhost:8080` (see [Security Baseline](security.md))
- Configuration UI available for initial setup
- Event log entries confirm successful startup

## Uninstallation Process

### Pre-Uninstall Confirmation
Display dialog with options:
```
ThingConnect Pulse Uninstaller

The following data will be PERMANENTLY DELETED:
• Configuration files and version history
• All monitoring data and historical records  
• Log files

□ Keep configuration files (recommended for reinstall)
□ Keep monitoring data (database backup)

[Uninstall] [Cancel]
```

### Uninstall Steps
1. Stop ThingConnect Pulse service
2. Remove Windows service registration
3. Delete application binaries from `%ProgramFiles%\ThingConnect.Pulse\`
4. Based on user selection:
   - **Full cleanup**: Delete entire `%ProgramData%\ThingConnect.Pulse\` directory
   - **Keep config**: Preserve `/config/` and `/versions/` directories
   - **Keep data**: Create backup of database before cleanup
5. Remove Start Menu entries and shortcuts
6. Clean up Windows registry entries

### Data Backup on Uninstall
If user selects data preservation:
- Configuration: Copy `/config/config.yaml` to user's Documents folder
- Database: Export to `ThingConnect.Pulse.Backup.{timestamp}.db`
- Versions: Create ZIP archive of `/versions/` directory

## Registry Entries

Minimal registry usage:
- Service registration (managed by Windows Service Controller)
- Uninstall information in `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\ThingConnectPulse`

No configuration stored in registry - all settings in files.

## Security Considerations

### File Permissions
- `%ProgramFiles%\ThingConnect.Pulse\`: Read-only for users, Full Control for Administrators
- `%ProgramData%\ThingConnect.Pulse\`: Full Control for Local System, Read for Administrators
- Configuration files: Protect from unauthorized modification
- Database: Encrypt sensitive connection strings if external DB used

### Network Security
- Default binding: `localhost:8080` (local access only) - See [Security Baseline](security.md)
- No authentication in v1 (LAN-only deployment assumed)
- HTTPS available via reverse proxy configuration
- Firewall: No inbound rules required for localhost binding

## Update/Upgrade Process

### In-Place Updates
1. Stop service
2. Backup current configuration and database
3. Replace binaries in `%ProgramFiles%\ThingConnect.Pulse\`
4. Run database migrations if needed
5. Start service
6. Verify operation

### Configuration Migration
- Automatic schema updates via Entity Framework migrations
- Configuration file validation with schema versioning
- Backward compatibility maintained for one major version

## Troubleshooting Paths

### Common Issues
- **Service won't start**: Check Event Log for specific errors
- **Configuration invalid**: Validate against `/docs/config.schema.json`
- **Database locked**: Ensure no other processes accessing SQLite file
- **Port conflicts**: Check if port 8080 is available

### Log Locations
- **Application logs**: `%ProgramData%\ThingConnect.Pulse\logs\pulse-*.log`
- **Windows Event Log**: Application log, source "ThingConnect Pulse"
- **Service logs**: Service Control Manager events

### Support Files
- Configuration schema: `%ProgramFiles%\ThingConnect.Pulse\config.schema.json`
- Database schema: Available via `/api/system/schema` endpoint
- Health check: `http://localhost:8080/health`

## Version Information

This installer specification applies to:
- **ThingConnect Pulse v1.0+**
- **Windows 10 (1809+) and Windows Server 2016+**
- **.NET 8.0 Runtime required**

Last updated: 2024-08-24  
Schema version: 1.0