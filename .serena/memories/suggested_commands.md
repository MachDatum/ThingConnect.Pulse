# ThingConnect Pulse - Suggested Development Commands

## Quick Development Setup
```bash
# Clone and setup
git clone https://github.com/MachDatum/ThingConnect.Pulse.git
cd ThingConnect.Pulse

# Backend setup
dotnet restore
dotnet build

# Frontend setup
cd thingconnect.pulse.client
npm install
cd ..
```

## Running the Application

### Development Mode
```bash
# Run backend with frontend proxy (from ThingConnect.Pulse.Server/)
cd ThingConnect.Pulse.Server
dotnet run
# Backend API: https://localhost:7297
# Frontend: https://localhost:55605 (proxied)
```

### Frontend Development (separate terminal)
```bash
cd thingconnect.pulse.client
npm run dev
# Frontend dev server: https://localhost:5173
```

## Building

### Backend
```bash
# Build solution
dotnet build

# Build for Release
dotnet build -c Release

# Clean and rebuild
dotnet clean && dotnet build
```

### Frontend
```bash
cd thingconnect.pulse.client

# Development build with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Code Quality & Formatting

### Backend (.NET)
```bash
# Format all C# files
dotnet format

# Check formatting without changes
dotnet format --verify-no-changes

# Build with full analysis (Release treats warnings as errors)
dotnet build -c Release
```

### Frontend
```bash
cd thingconnect.pulse.client

# Lint TypeScript files
npm run lint

# Fix linting issues automatically  
npm run lint -- --fix

# Format all files
npm run format

# Check formatting without changes
npx prettier --check .
```

## Testing

### Backend
```bash
# Run all tests (when implemented)
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test project
dotnet test ThingConnect.Pulse.Tests
```

### Frontend
```bash
cd thingconnect.pulse.client

# Run tests (when available)
npm test

# Run tests with coverage
npm run test:coverage
```

## Database Operations
```bash
# Add new migration
dotnet ef migrations add MigrationName --project ThingConnect.Pulse.Server

# Update database
dotnet ef database update --project ThingConnect.Pulse.Server

# Drop database
dotnet ef database drop --project ThingConnect.Pulse.Server
```

## Windows-Specific Commands

### Service Management
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

### Installer Build
```bash
# Build Windows installer
.\build-installer.ps1

# Build without rebuilding (faster)
.\build-installer.ps1 -SkipBuild

# Open installer directory
.\build-installer.ps1 -OpenInstaller
```

### Windows System Commands
```bash
# List files (Windows equivalent of ls)
dir
# or
Get-ChildItem  # PowerShell

# Find process using port
netstat -ano | findstr :8080

# Kill process
taskkill /PID <process-id> /F

# Create directory
mkdir "C:\ProgramData\ThingConnect.Pulse"

# Check network interfaces
Get-NetAdapter  # PowerShell
ipconfig /all   # Command Prompt
```

## Git Operations
```bash
# Check status
git status

# Common workflow
git add .
git commit -m "description"
git push

# Create feature branch
git checkout -b feature/feature-name

# GitHub CLI operations
gh issue list
gh pr create
gh pr status
```

## Task Completion Commands
When a coding task is completed, ALWAYS run these commands to ensure code quality:

### Backend
```bash
# Format and build
dotnet format
dotnet build -c Release
```

### Frontend  
```bash
cd thingconnect.pulse.client
npm run lint
npm run format
npm run build
```

### Full Verification
```bash
# From project root
dotnet format --verify-no-changes
dotnet build -c Release
cd thingconnect.pulse.client && npm run lint && npm run format && npm run build
```

## Development Data Setup
```bash
# Create minimal config for testing
mkdir "C:\ProgramData\ThingConnect.Pulse"
echo "targets: []" > "C:\ProgramData\ThingConnect.Pulse\config.yaml"
```

## Common URLs
- **Backend API**: http://localhost:8080 (dev) or https://localhost:7297 (dev)
- **Swagger UI**: http://localhost:8080/swagger
- **Frontend**: https://localhost:55605 (proxied) or https://localhost:5173 (dev)
- **GitHub**: https://github.com/MachDatum/ThingConnect.Pulse.git