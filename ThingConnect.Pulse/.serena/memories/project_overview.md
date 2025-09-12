# ThingConnect Pulse - Project Overview

## Purpose
ThingConnect Pulse is a free, on-premises availability monitoring system for manufacturing IT/OT networks over IPv4/IPv6. It provides YAML-configured monitoring with live dashboard, historical rollups, and CSV export. Designed for plant IT/OT admins, production supervisors, and maintenance engineers who need reliable network device monitoring with zero external dependencies.

## Key Features
- **Lightweight**: 5-minute setup with single Windows Service installer
- **Local-first**: No cloud dependencies, all data stays on-premises  
- **Readable config**: Simple YAML configuration with explicit Apply workflow
- **Real-time Monitoring**: ICMP ping, TCP port, and HTTP/HTTPS checks
- **Data Aggregation**: 15-minute and daily rollups with 60-day retention for raw data
- **Alerting**: Status change detection with flap damping (2/2 thresholds)
- **User Management**: Role-based authentication with admin/user roles

## Technology Stack
- **Backend**: ASP.NET Core 8.0, Entity Framework Core, SQLite
- **Frontend**: React 19, TypeScript, Vite, Chakra UI
- **Monitoring**: ICMP, TCP, HTTP probes with concurrent execution and flap damping
- **Data**: 15-minute and daily rollups, 60-day retention
- **Deployment**: Windows Service with Inno Setup installer
- **Authentication**: ASP.NET Core Identity with cookie authentication
- **Logging**: Serilog with structured logging