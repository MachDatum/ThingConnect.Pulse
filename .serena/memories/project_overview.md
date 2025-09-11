# ThingConnect Pulse - Project Overview

## Purpose
ThingConnect Pulse is a free, on-premises network availability monitoring system designed for manufacturing sites. It provides YAML-configured monitoring with live dashboard, historical rollups, and CSV export. The system is designed for plant IT/OT admins, production supervisors, and maintenance engineers who need reliable network device monitoring with zero external dependencies.

## Key Features
- **Local-first**: No cloud dependencies, all data stays on-premises
- **Lightweight**: 5-minute setup with single Windows Service installer
- **Readable config**: Simple YAML configuration with explicit Apply workflow
- **Network Monitoring**: ICMP ping, TCP connect, HTTP status checks with concurrent execution
- **Data Storage**: SQLite with automatic 15-minute/daily rollups
- **Web Interface**: Real-time status dashboard with live data integration
- **Configuration Management**: Apply, list, and download configuration versions
- **Alerting**: Status change detection with flap damping (2/2 thresholds)
- **Outage Tracking**: Automatic outage detection with start/end timestamps

## Project Structure
- **ThingConnect.Pulse.Server/** - ASP.NET Core backend API
- **thingconnect.pulse.client/** - React frontend application  
- **docs//** - Technical specifications and API documentation
- **ops//** - Development and deployment operations
- **installer//** - Windows service installer scripts
- **brand//** - Branding assets and design resources

## Architecture
- **Backend**: ASP.NET Core 8.0 with Entity Framework Core and SQLite
- **Frontend**: React 19 with TypeScript, Vite, and Chakra UI v3
- **Deployment**: Windows Service with professional Inno Setup installer
- **Database**: SQLite stored in ProgramData/ThingConnect.Pulse
- **Configuration**: YAML files with JSON Schema validation

## Current Status
- Basic ASP.NET Core server scaffolding exists
- React frontend has default template  
- Cookie-based authentication system implemented
- Configuration management endpoints implemented
- Monitoring engine operational with background probing
- Database integration complete
- Ready for feature implementation based on GitHub issues