# Documentation

Technical specifications and API documentation for ThingConnect Pulse.

## Contents

- **[openapi.yaml](./openapi.yaml)** - Complete REST API specification (frozen)
- **[config.schema.json](./config.schema.json)** - YAML configuration JSON Schema
- **[data-model.cs](./data-model.cs)** - Entity Framework Core entity definitions
- **[rollup-spec.md](./rollup-spec.md)** - Data aggregation algorithm specifications

## API Documentation

The OpenAPI specification defines all REST endpoints:
- `GET /api/status/live` - Current status of all monitored endpoints
- `GET /api/endpoints/{id}` - Detailed endpoint information
- `GET /api/history/endpoint/{id}` - Historical status data
- `POST /api/config/apply` - ✅ Apply new monitoring configuration
- `GET /api/config/versions` - ✅ List all configuration versions
- `GET /api/config/versions/{id}` - ✅ Download specific configuration version

**Monitoring Engine**: Operational with real-time probe execution, outage detection, and database persistence.

## Configuration Format

The system uses YAML configuration files with JSON Schema validation:
- Target endpoint definitions (host, CIDR, wildcard)
- Monitoring group organization
- Probe type defaults (ICMP, TCP, HTTP)
- Timing and retry settings

## Data Model

Entity Framework Core entities define the database structure:
- Groups, Endpoints, CheckResults (raw and aggregated)
- Configuration versioning with SHA-256 hash-based duplicate detection
- Settings store with watermark tracking for rollup jobs
- Rollup tables for performance optimization

## Implementation Status

### Completed ✅
- **Data Layer**: EF Core entities, migrations, SQLite configuration
- **Configuration Management**: Apply, versions, download endpoints with full testing
- **Settings Service**: Key-value store with memory caching and watermark methods
- **Monitoring Engine**: Complete probe services (ICMP, TCP, HTTP) with outage detection
- **Background Processing**: Continuous endpoint monitoring with concurrency control
- **State Management**: Flap damping and per-endpoint state tracking with database persistence

### Specifications
All specifications are **frozen** for v1 development. Changes require architectural review.