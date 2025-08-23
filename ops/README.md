# Operations

Development and deployment operations documentation.

## Contents

- **[dev.md](./dev.md)** - General development commands (build, format, test)
- **[dev-backend.md](./dev-backend.md)** - Zero-to-first-run backend setup guide

## Development Workflow

### Quick Commands

```bash
# Format all code
dotnet format && cd thingconnect.pulse.client && npm run format && cd ..

# Build everything
dotnet build

# Run application
cd ThingConnect.Pulse.Server && dotnet run
```

### Setup Guides

- **Backend**: Follow [dev-backend.md](./dev-backend.md) for detailed setup
- **Frontend**: Integrated with backend development workflow
- **Full Stack**: Both backend and frontend run together via dotnet run

## Future Operations

This directory will expand to include:
- CI/CD pipeline configurations
- Deployment scripts and automation
- Monitoring and logging setup
- Performance testing and optimization guides
- Production operations runbooks