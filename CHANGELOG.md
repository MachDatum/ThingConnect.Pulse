# Changelog

All notable changes to ThingConnect Pulse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Release management system with GitHub Actions integration
- Automated release notes generation from commit history
- Pull request template with changelog requirement
- Comprehensive release documentation in `/ops/release.md`

### Changed
- Version numbering updated to start at 0.1.0 following SemVer conventions
- Project-wide version synchronization between .NET and Node.js components

## [0.1.0] - 2024-08-25

### Added
- **Core Monitoring Engine**
  - Real-time network availability monitoring with ICMP, TCP, and HTTP probes
  - Outage detection with 2/2 flap damping and state management
  - Background monitoring service with concurrency control (100 max probes)
  - Discovery service for CIDR, wildcard, and hostname expansion

- **Data Layer Foundation**
  - SQLite database with Entity Framework Core integration
  - Configuration version storage with SHA-256 hash-based duplicate detection
  - Settings service with memory caching and watermark tracking
  - Raw data retention with configurable 60-day default

- **REST API v1**
  - Live status endpoint (`GET /api/status/live`) with real-time monitoring data
  - History endpoint (`GET /api/history/endpoint/{id}`) with time-series data
  - Configuration management (`POST /api/config/apply`) with YAML validation
  - Configuration versioning (`GET /api/config/versions`) with history tracking

- **Background Processing**
  - 15-minute rollup jobs with automatic scheduling every 5 minutes
  - Daily rollup aggregation with performance statistics
  - Raw data pruning service with configurable retention policies
  - Watermark-based processing to prevent data gaps

- **React Frontend**
  - Real-time dashboard with live monitoring status display
  - Interactive endpoint detail pages with comprehensive metrics
  - History visualization with date range selection and CSV export
  - Responsive design optimized for desktop, tablet, and mobile devices
  - Chakra UI v3 component library with modern design system

- **Windows Service Integration**
  - Native Windows service hosting with automatic startup
  - Service installation and management scripts
  - Integration with Windows Service Controller
  - Proper service lifecycle management

- **Security & Configuration**
  - Comprehensive security baseline documentation
  - Network binding policy (localhost + LAN, HTTP-only, port 8080)
  - YAML-based configuration with schema validation
  - File system permissions and access control

- **Deployment & Operations**
  - Inno Setup installer for Windows deployment
  - Standardized directory structure under ProgramData
  - Rolling log files with 30-day retention
  - Configuration versioning and rollback capability

### Technical Specifications
- **.NET 8.0** backend with ASP.NET Core and Entity Framework
- **React 19** frontend with TypeScript and Vite build system
- **SQLite** database for local data storage
- **Serilog** structured logging with file and console outputs
- **Windows 10/Server 2016+** compatibility
- **SemVer** versioning with automated release management

### Performance & Reliability
- Concurrent monitoring of hundreds of endpoints
- Sub-second response times for API endpoints
- Memory-efficient monitoring loops with proper resource cleanup
- Robust error handling and recovery mechanisms
- Comprehensive test coverage for critical components

---

## Release Notes Format

This changelog follows the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format with these categories:

- **Added** - New features and capabilities
- **Changed** - Changes in existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Now removed features
- **Fixed** - Bug fixes and corrections
- **Security** - Security improvements and patches

Each entry includes relevant technical details and user impact where appropriate.