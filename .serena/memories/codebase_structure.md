# ThingConnect Pulse - Codebase Structure

## Root Directory Structure
```
ThingConnect.Pulse/
├── ThingConnect.Pulse.Server/          # ASP.NET Core backend
├── thingconnect.pulse.client/          # React frontend  
├── docs/                              # Technical specifications
├── ops/                               # Development operations
├── installer/                         # Windows service installer
├── brand/                             # Branding and design assets
├── marketing/                         # Marketing materials
├── website/                           # Project website
├── ref/                              # Reference materials
├── flow/                             # Process flows
├── ui/                               # UI mockups/designs
├── publish/                          # Build outputs
├── ThingConnect.Pulse.sln            # Visual Studio solution
├── Directory.Build.props             # Solution-wide build properties
├── README.md                         # Main project documentation
├── CLAUDE.md                         # AI development context
└── sample-config.yaml               # Example configuration
```

## Backend Structure (ThingConnect.Pulse.Server/)
```
ThingConnect.Pulse.Server/
├── Controllers/                      # API controllers
│   ├── AuthController.cs
│   ├── ConfigurationController.cs
│   ├── HistoryController.cs
│   ├── StatusController.cs
│   └── UserManagementController.cs
├── Data/                            # Entity Framework context
├── Services/                        # Business logic services
│   ├── Monitoring/                  # Monitoring engine services
│   ├── Rollup/                      # Data aggregation services
│   └── Prune/                       # Data cleanup services
├── Models/                          # Data models and DTOs
├── Infrastructure/                  # Cross-cutting concerns
├── Helpers/                         # Utility classes
├── Migrations/                      # EF Core migrations
├── Properties/                      # Assembly info
├── Program.cs                       # Application entry point
├── appsettings.json                # Production configuration
├── appsettings.Development.json    # Development configuration
└── ThingConnect.Pulse.Server.csproj # Project file
```

## Frontend Structure (thingconnect.pulse.client/)
```
thingconnect.pulse.client/
├── src/
│   ├── api/                         # API client functions
│   ├── components/                  # Reusable UI components
│   ├── features/                    # Feature-specific components
│   ├── hooks/                       # Custom React hooks
│   ├── pages/                       # Page components
│   ├── providers/                   # Context providers
│   ├── router/                      # Routing configuration
│   ├── theme/                       # Chakra UI theme
│   ├── types/                       # TypeScript definitions
│   ├── utils/                       # Utility functions
│   ├── icons/                       # Custom icon components
│   ├── assets/                      # Static assets
│   ├── App.tsx                      # Root component
│   └── main.tsx                     # Application entry point
├── public/                          # Static public assets
├── dist/                           # Build output
├── node_modules/                   # NPM dependencies
├── package.json                    # NPM configuration
├── package-lock.json              # Dependency lock file
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
├── eslint.config.js               # ESLint configuration
└── thingconnect.pulse.client.esproj # MSBuild project file
```

## Documentation Structure (docs/)
```
docs/
├── openapi.yaml                    # API specification (frozen)
├── openapi-frozen.yaml            # Backup of frozen API spec
├── config.schema.json             # YAML configuration schema
├── data-model.cs                   # EF Core entity definitions
├── rollup-spec.md                 # Data aggregation algorithms
├── assumptions.md                  # Project assumptions
├── erd-diagram.md                  # Database design
├── installer-spec.md              # Windows installer requirements
├── logging-spec.md                # Logging configuration
├── probes-spec.md                 # Network probe specifications
├── security.md                    # Security considerations
├── nfr.md                         # Non-functional requirements
├── scope-v1.md                    # Version 1 scope definition
├── roadmap.md                     # Product roadmap
└── ops/                           # Operations documentation
    ├── dev.md                     # Development commands
    ├── dev-backend.md             # Backend setup
    └── dev-frontend.md            # Frontend setup
```

## Key Configuration Files

### Solution Level
- **Directory.Build.props**: Solution-wide MSBuild properties
- **ThingConnect.Pulse.sln**: Visual Studio solution file
- **.editorconfig**: Code formatting rules (if exists)
- **.gitignore**: Git ignore patterns

### Backend Configuration
- **appsettings.json**: Production configuration
- **appsettings.Development.json**: Development overrides
- **ThingConnect.Pulse.Server.csproj**: Project dependencies and settings

### Frontend Configuration
- **package.json**: NPM dependencies and scripts
- **tsconfig.json**: TypeScript compiler settings
- **vite.config.ts**: Build tool configuration
- **eslint.config.js**: Linting rules
- **thingconnect.pulse.client.esproj**: MSBuild integration

## Data Storage Locations

### Development
- **Database**: Local SQLite file in project directory
- **Logs**: Console output and file logs in /logs directory
- **Config**: test-config.yaml and sample-config.yaml in root

### Production (Windows Service)
- **Database**: `C:\ProgramData\ThingConnect.Pulse\pulse.db`
- **Configuration**: `C:\ProgramData\ThingConnect.Pulse\config.yaml`
- **Logs**: `C:\ProgramData\ThingConnect.Pulse\logs\`
- **Installation**: `C:\Program Files\ThingConnect.Pulse\`

## Important Entry Points

### Application Startup
- **Backend**: ThingConnect.Pulse.Server/Program.cs
- **Frontend**: thingconnect.pulse.client/src/main.tsx

### API Controllers
- **Authentication**: Controllers/AuthController.cs
- **Configuration**: Controllers/ConfigurationController.cs
- **Monitoring Data**: Controllers/StatusController.cs and HistoryController.cs
- **User Management**: Controllers/UserManagementController.cs

### Services
- **Configuration Management**: Services/ConfigurationService.cs
- **Monitoring Engine**: Services/Monitoring/
- **Data Aggregation**: Services/Rollup/
- **Status Tracking**: Services/StatusService.cs

### Frontend Routes
- **Router Configuration**: src/router/
- **Main Pages**: src/pages/
- **Feature Components**: src/features/

## Build Outputs
- **Backend**: bin/ and obj/ directories
- **Frontend**: dist/ directory
- **Installer**: publish/ directory
- **Solution**: Published applications and installers