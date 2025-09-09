# ThingConnect Pulse - Technology Stack

## Backend (.NET)
- **Framework**: ASP.NET Core 8.0
- **Database**: Entity Framework Core with SQLite
- **Authentication**: ASP.NET Core Identity with cookie authentication
- **Logging**: Serilog with structured logging
- **API**: RESTful API with Swagger/OpenAPI documentation
- **Hosting**: Windows Service support
- **Configuration**: JSON + YAML (YamlDotNet)

### Key Dependencies
- Microsoft.AspNetCore.Identity.EntityFrameworkCore 8.0.0
- Microsoft.EntityFrameworkCore.Sqlite 8.0.0
- Microsoft.Extensions.Hosting.WindowsServices 9.0.8
- Serilog.AspNetCore 9.0.0
- YamlDotNet 16.3.0
- NJsonSchema 11.4.0

## Frontend (React)
- **Framework**: React 19.1.1
- **Language**: TypeScript 5.8.3
- **Build Tool**: Vite 7.1.2
- **UI Library**: Chakra UI v3.24.2
- **State Management**: TanStack React Query 5.84.2
- **HTTP Client**: Axios 1.11.0
- **Routing**: React Router DOM 7.8.1
- **Forms**: React Hook Form with Zod validation

### Key Dependencies
- @chakra-ui/react 3.24.2
- @tanstack/react-query 5.84.2
- react 19.1.1
- react-dom 19.1.1
- typescript 5.8.3
- vite 7.1.2
- axios 1.11.0
- zod 4.0.17

## Development Tools
- **Code Quality**: StyleCop.Analyzers + .NET Analyzers for backend
- **Linting**: ESLint 9.33.0 with TypeScript support for frontend
- **Formatting**: Prettier 3.6.2 for frontend, dotnet format for backend
- **Pre-commit**: Husky 9.1.7 with lint-staged 16.1.4
- **Testing**: NUnit planned for backend, no frontend testing setup yet

## Platform
- **Target OS**: Windows (primary), cross-platform .NET support
- **Database**: SQLite (file-based, local storage)
- **Deployment**: Windows Service with Inno Setup installer
- **Configuration**: YAML files with JSON Schema validation