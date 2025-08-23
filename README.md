# ThingConnect Pulse

Network availability monitoring system for manufacturing sites.

## Quick Start

### Prerequisites
- .NET 8 SDK
- Node.js 18+

### Development Setup

```bash
# Clone repository
git clone https://github.com/MachDatum/ThingConnect.Pulse.git
cd ThingConnect.Pulse

# Backend setup
dotnet restore
dotnet build

# Frontend setup  
cd thingconnect.pulse.client
npm install
cd ..

# Run application
cd ThingConnect.Pulse.Server
dotnet run
# Backend: http://localhost:8080
# Frontend: http://localhost:8080 (proxied)
```

## Project Structure

- **[ThingConnect.Pulse.Server/](./ThingConnect.Pulse.Server/)** - ASP.NET Core backend API
- **[thingconnect.pulse.client/](./thingconnect.pulse.client/)** - React frontend application
- **[docs/](./docs/)** - Technical specifications and API documentation
- **[ops/](./ops/)** - Development and deployment operations
- **[installer/](./installer/)** - Windows service installer scripts
- **[brand/](./brand/)** - Branding assets and design resources

## Documentation

- **[Product Overview](./ONE_PAGER.MD)** - Complete project specification
- **[Development Plan](./DEVELOPMENT_PLAN.md)** - Implementation roadmap and parallel work streams
- **[API Documentation](./docs/openapi.yaml)** - REST API specification
- **[Configuration Schema](./docs/config.schema.json)** - YAML configuration format
- **[Data Model](./docs/data-model.cs)** - Entity Framework Core entities
- **[Rollup Algorithms](./docs/rollup-spec.md)** - Data aggregation specifications

## API Endpoints

The server provides REST API endpoints for configuration management:

```bash
# Apply YAML configuration
POST /api/config/apply
Content-Type: text/plain
[YAML configuration content]

# List all configuration versions
GET /api/config/versions

# Download specific configuration version
GET /api/config/versions/{id}
```

## Development

- **[Backend Setup](./ops/dev-backend.md)** - Zero-to-first-run backend development
- **[General Commands](./ops/dev.md)** - Code formatting, testing, and build commands

## Issues & Project Management

- **[GitHub Issues](https://github.com/MachDatum/ThingConnect.Pulse/issues)** - Active development tracking
- **[Project Board](https://github.com/MachDatum/ThingConnect.Pulse/projects)** - Sprint planning and progress

### Issue Labels
- `priority:P1` - Critical path items
- `priority:P2` - Important features  
- `priority:P3` - Nice to have
- `area:*` - Component areas (api, ui, infra, etc.)
- `type:*` - Issue types (feature, bug, ops, docs)

## Technology Stack

- **Backend**: ASP.NET Core 8.0, Entity Framework Core, SQLite
- **Frontend**: React 19, TypeScript, Vite, Chakra UI
- **Monitoring**: ICMP, TCP, HTTP probes with flap damping
- **Data**: 15-minute and daily rollups, 60-day retention
- **Deployment**: Windows Service with Inno Setup installer

## Features

### v1.0 Scope
- **Network Monitoring**: ICMP ping, TCP connect, HTTP status checks
- **Configuration**: YAML-based with JSON Schema validation and version tracking
- **Data Storage**: SQLite with automatic rollups and retention
- **Web Interface**: Real-time status dashboard and historical views
- **Configuration Management**: Apply, list, and download configuration versions
- **Alerting**: Status change detection with flap damping
- **Deployment**: Single Windows service installer

### Monitoring Capabilities
- **Device Discovery**: CIDR range and wildcard expansion
- **Probe Types**: ICMP, TCP port checks, HTTP/HTTPS requests
- **Status Logic**: 2 failures → DOWN, 2 successes → UP
- **Data Retention**: Raw data (60 days), rollups (indefinite)
- **Performance**: 100 concurrent probes, 5s timeout, 2 retries

## Getting Help

- Check **[Issues](https://github.com/MachDatum/ThingConnect.Pulse/issues)** for known problems
- Review **[ops/dev-backend.md](./ops/dev-backend.md)** for troubleshooting
- See **[CLAUDE.md](./CLAUDE.md)** for AI development context

## License

Copyright © ThingConnect