---
sidebar_position: 1
---

# Installation

Learn how to install and deploy ThingConnect Pulse in your manufacturing environment.

## System Requirements

- **Operating System**: Windows Server 2019 or later (Windows 10 for development)
- **Runtime**: .NET 8.0 Runtime
- **Memory**: Minimum 2GB RAM, recommended 4GB+
- **Storage**: Minimum 10GB free space for application and data
- **Network**: Outbound internet access for updates (optional)

## Installation Options

### Option 1: Windows Service Installation (Recommended)

The recommended deployment method for production environments.

1. **Download the installer** from the ThingConnect Pulse releases page
2. **Run the installer** as Administrator
3. **Configure service settings** during installation
4. **Start the service** from Windows Services

### Option 2: Manual Installation

For development or custom deployment scenarios.

1. **Extract** the application package to your desired location
2. **Configure** the application settings
3. **Install** as a Windows Service manually
4. **Start** the monitoring service

## Initial Configuration

After installation, ThingConnect Pulse requires initial configuration:

1. **Service Configuration**: Set up the monitoring service
2. **Database Setup**: Initialize the SQLite database
3. **Admin Account**: Create your first administrator account
4. **Network Configuration**: Configure firewall and network access

## Verification

To verify your installation:

1. **Check Service Status**: Ensure the ThingConnect Pulse service is running
2. **Test Web Interface**: Access the web interface at `http://localhost:8080`
3. **Review Logs**: Check application logs for any errors

## Next Steps

Once installed, proceed to [Initial Setup](initial-setup) to configure your first monitoring endpoints.

## Troubleshooting

Common installation issues and solutions:

- **Service won't start**: Check Windows Event Logs
- **Web interface not accessible**: Verify firewall settings
- **Database errors**: Ensure sufficient disk space and permissions