# ThingConnect Pulse - Code Style & Conventions

## General Principles
- Follow GitHub issues in /issues/ and /pulse_env_issues/ folders
- Implement one issue at a time, complete with tests before moving on
- Always use Chakra UI MCP tools when working with UI components
- NEVER create files unless absolutely necessary for achieving goals
- ALWAYS prefer editing existing files to creating new ones

## Backend (.NET) Style
- **Language**: C# with nullable reference types enabled
- **Framework**: ASP.NET Core 8.0 with latest language features
- **Analyzers**: StyleCop.Analyzers + Microsoft.CodeAnalysis.NetAnalyzers enabled
- **Code Analysis**: EnforceCodeStyleInBuild=true, treat warnings as errors in Release
- **Namespaces**: Use file-scoped namespaces
- **Indentation**: 4 spaces (configured in .editorconfig)
- **Line Endings**: CRLF (Windows standard)
- **Encoding**: UTF-8

### Naming Conventions
- **Classes**: PascalCase (e.g., `ConfigurationService`)
- **Methods**: PascalCase (e.g., `GetConfigurationAsync`)
- **Properties**: PascalCase (e.g., `ConnectionString`)
- **Fields**: camelCase with underscore prefix (e.g., `_logger`)
- **Constants**: UPPER_CASE (e.g., `DEFAULT_TIMEOUT`)
- **Interfaces**: PascalCase with 'I' prefix (e.g., `IConfigurationService`)

### Architecture Patterns
- **Dependency Injection**: Constructor injection throughout
- **Services**: Scoped services for business logic
- **Controllers**: Thin controllers, delegate to services
- **Authentication**: Cookie-based with ASP.NET Core Identity
- **Logging**: Structured logging with Serilog
- **Configuration**: YAML + JSON configuration files

## Frontend (React/TypeScript) Style
- **Language**: TypeScript with strict type checking
- **Framework**: React 19 with functional components and hooks
- **Build**: Vite with SWC for fast compilation
- **Linting**: ESLint 9.33.0 with TypeScript, React, and Prettier rules
- **Formatting**: Prettier 3.6.2 with 2-space indentation
- **Import Order**: External libraries first, then internal modules
- **File Extensions**: .tsx for React components, .ts for utilities

### Component Conventions
- **Components**: PascalCase files and component names
- **Hooks**: camelCase starting with 'use' (e.g., `useConfiguration`)
- **Props**: TypeScript interfaces with 'Props' suffix
- **State**: useState and React Query for server state
- **Styling**: Chakra UI components and theme system
- **Icons**: Lucide React icons preferred

### Directory Structure
- **components/**: Reusable UI components
- **features/**: Feature-specific components and logic
- **hooks/**: Custom React hooks
- **api/**: API client functions
- **types/**: TypeScript type definitions
- **utils/**: Utility functions

## Quality Standards
- **Backend**: All warnings treated as errors in Release builds
- **Frontend**: ESLint errors must be fixed, no console.warn/error in production
- **Testing**: NUnit for backend testing (when implemented)
- **Pre-commit**: Husky hooks run linting and formatting checks
- **Build**: Both projects must build without warnings/errors

## Documentation Standards
- **API**: OpenAPI/Swagger documentation required
- **Code**: XML documentation for public APIs in C#
- **README**: Keep project README.md updated with setup instructions
- **Issues**: Follow GitHub issue templates and confidence scoring