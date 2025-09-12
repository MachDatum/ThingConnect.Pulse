# Suggested Development Commands

## Backend Development (ASP.NET Core)
```bash
# Navigate to backend project
cd ThingConnect.Pulse.Server

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the backend server
dotnet run
# Backend API: http://localhost:8080

# Run tests
dotnet test

# Format code
dotnet format

# Entity Framework commands (if needed)
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

## Frontend Development (React)
```bash
# Navigate to frontend project
cd thingconnect.pulse.client

# Install dependencies
npm install

# Run development server
npm run dev
# Frontend: https://localhost:55610 (or similar port)

# Build for production
npm run build

# Run tests
npm test

# Format code (if configured)
npm run format
```

## Full Project Commands
```bash
# Install all dependencies (from root)
dotnet restore
cd thingconnect.pulse.client && npm install && cd ..

# Build entire project
dotnet build

# Run both backend and frontend (requires two terminals)
# Terminal 1:
cd ThingConnect.Pulse.Server && dotnet run

# Terminal 2:
cd thingconnect.pulse.client && npm run dev
```

## Windows Service Commands
```bash
# Install as Windows service (development)
.\install-service.ps1 install

# Manage service
.\install-service.ps1 start
.\install-service.ps1 stop
.\install-service.ps1 status

# Uninstall service  
.\install-service.ps1 uninstall
```

## Build and Installer
```bash
# Build installer (includes build and packaging)
.\build-installer.ps1

# Build installer without rebuilding (faster for testing)
.\build-installer.ps1 -SkipBuild

# Open installer directory after build
.\build-installer.ps1 -OpenInstaller
```

## Git Commands (Windows)
```bash
# Standard git operations work normally
git status
git add .
git commit -m "message"
git push

# GitHub CLI for issues/PRs
gh issue list
gh pr create
```

## System Utilities (Windows)
- **List files**: `dir` or `ls` (if using PowerShell Core)
- **Change directory**: `cd`
- **Find files**: Use PowerShell `Get-ChildItem -Recurse -Name "pattern"`
- **Search text**: `findstr` or PowerShell `Select-String`