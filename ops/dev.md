# ThingConnect Pulse - Development Commands

This document contains local development commands and setup instructions.

## Code Formatting

### Backend (.NET)

```bash
# Format all C# files in the solution
dotnet format

# Format specific project
dotnet format ThingConnect.Pulse.Server

# Check formatting without making changes
dotnet format --verify-no-changes
```

### Frontend (React/TypeScript)

```bash
# Change to frontend directory
cd thingconnect.pulse.client

# Format all TypeScript/JavaScript files
npm run format

# Check formatting without making changes
npx prettier --check .

# Format specific files
npx prettier --write src/App.tsx
```

## Building

### Backend

```bash
# Build the solution
dotnet build

# Build in Release mode
dotnet build -c Release

# Clean and rebuild
dotnet clean && dotnet build
```

### Frontend

```bash
# Change to frontend directory
cd thingconnect.pulse.client

# Install dependencies
npm install

# Development build with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Full Solution

```bash
# Build both backend and frontend
dotnet build

# The backend project includes the frontend build automatically
```

## Testing

### Backend Tests

```bash
# Run all tests
dotnet test

# Run tests with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test project
dotnet test ThingConnect.Pulse.Tests
```

### Frontend Tests

```bash
# Change to frontend directory
cd thingconnect.pulse.client

# Run tests (when available)
npm test

# Run tests with coverage
npm run test:coverage
```

## Code Quality

### Linting

```bash
# Backend - included in dotnet build
dotnet build

# Frontend linting
cd thingconnect.pulse.client
npm run lint

# Fix linting issues automatically
npm run lint -- --fix
```

### Code Analysis

```bash
# Run full code analysis
dotnet build -c Release

# The Directory.Build.props enables analyzers and treats warnings as errors in Release
```

## Running the Application

### Development Mode

```bash
# Run backend with frontend proxy
cd ThingConnect.Pulse.Server
dotnet run

# The application will be available at:
# Backend API: https://localhost:7297
# Frontend: https://localhost:55605 (proxied through backend)
```

### Production Mode

```bash
# Build and run in production mode
dotnet build -c Release
cd ThingConnect.Pulse.Server
dotnet run -c Release --no-build
```

## Database Operations

```bash
# Add new migration (when EF Core is set up)
dotnet ef migrations add MigrationName --project ThingConnect.Pulse.Server

# Update database
dotnet ef database update --project ThingConnect.Pulse.Server

# Drop database
dotnet ef database drop --project ThingConnect.Pulse.Server
```

## Quick Setup for New Developers

1. **Prerequisites:**
   - .NET 8 SDK
   - Node.js 18+ and npm

2. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd ThingConnect.Pulse
   
   # Restore .NET packages
   dotnet restore
   
   # Install frontend dependencies
   cd thingconnect.pulse.client
   npm install
   cd ..
   ```

3. **Verify setup:**
   ```bash
   # Format check
   dotnet format --verify-no-changes
   cd thingconnect.pulse.client && npm run format && cd ..
   
   # Build
   dotnet build
   
   # Run
   cd ThingConnect.Pulse.Server
   dotnet run
   ```

## IDE Configuration

### Visual Studio / VS Code

The `.editorconfig` file will automatically configure:
- Indentation (4 spaces for C#, 2 spaces for TS/JS)
- Line endings (CRLF)
- Encoding (UTF-8)
- Naming conventions

### Recommended Extensions

- **VS Code:**
  - C# Dev Kit
  - Prettier - Code formatter
  - EditorConfig for VS Code
  - ESLint

## Troubleshooting

### Common Issues

1. **Build failures after adding Directory.Build.props:**
   - Check for compiler warnings - they're now treated as errors in Release
   - Fix warnings or add to `NoWarn` property if needed

2. **Frontend formatting issues:**
   - Ensure `.prettierrc.json` exists in frontend directory
   - Run `npm install` to ensure Prettier is available

3. **EditorConfig not working:**
   - Restart your IDE after adding `.editorconfig`
   - Check IDE has EditorConfig support enabled