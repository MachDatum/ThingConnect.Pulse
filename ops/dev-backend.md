# ThingConnect Pulse - Backend Development Setup

Zero-to-first-run backend setup on Windows. Target: **≤15 minutes** from clone to running API.

## Prerequisites

### Required Software

1. **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)**
   ```bash
   # Verify installation
   dotnet --version
   # Should show: 8.0.x
   ```

2. **Git** (if not already installed)
   ```bash
   # Verify installation
   git --version
   ```

### Recommended Tools

- **Visual Studio 2022** (Community/Professional) with ASP.NET workload
- **VS Code** with C# Dev Kit extension
- **Windows Terminal** or **PowerShell**

## Quick Start (5-10 minutes)

### 1. Clone & Setup

```bash
# Clone repository
git clone https://github.com/MachDatum/ThingConnect.Pulse.git
cd ThingConnect.Pulse

# Restore packages
dotnet restore
```

### 2. Create Data Directory

```bash
# Create application data directory
mkdir "C:\ProgramData\ThingConnect.Pulse"

# Create minimal config file (optional for first run)
echo "# Minimal config for first run" > "C:\ProgramData\ThingConnect.Pulse\config.yaml"
```

### 3. Run Backend

```bash
# Navigate to backend project
cd ThingConnect.Pulse.Server

# Run in development mode
dotnet run

# Expected output:
# info: Microsoft.Hosting.Lifetime[14]
#       Now listening on: http://localhost:8080
# info: Microsoft.Hosting.Lifetime[0]
#       Application started. Press Ctrl+C to shut down.
```

### 4. Verify Running

Open browser to:
- **API**: http://localhost:8080/swagger - Swagger UI
- **Health Check**: http://localhost:8080/health (if implemented)
- **Static Files**: http://localhost:8080 - Frontend proxy

## Detailed Setup

### Configuration Files

The backend uses these configuration files:

#### `appsettings.json` (Production)
- Base configuration shared across environments
- Connection string to SQLite database
- Default application settings

#### `appsettings.Development.json` (Development)
- Development-specific overrides
- Enhanced logging (including EF Core SQL)
- HTTP-only Kestrel endpoint on port 8080
- Development database path

### Database Setup

ThingConnect Pulse uses **SQLite** for simplicity:

```bash
# Database location
C:\ProgramData\ThingConnect.Pulse\pulse.db

# Auto-created on first run (when EF Core is implemented)
# No manual database setup required
```

### Configuration File

Sample minimal `config.yaml`:

```yaml
# C:\ProgramData\ThingConnect.Pulse\config.yaml
targets:
  - host: "8.8.8.8"
    name: "Google DNS"
  - host: "1.1.1.1" 
    name: "Cloudflare DNS"

defaults:
  probe_type: "icmp"
  interval_seconds: 60
```

## Development Workflow

### Building

```bash
# Build solution
dotnet build

# Build specific project
dotnet build ThingConnect.Pulse.Server

# Build for Release
dotnet build -c Release
```

### Running

```bash
# Run with hot reload
dotnet watch run

# Run specific configuration
dotnet run --configuration Release

# Run with custom port
dotnet run --urls="http://localhost:9000"
```

### Testing

```bash
# Run all tests (when implemented)
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Database Operations (Future)

```bash
# When EF Core is implemented:

# Add migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Reset database
dotnet ef database drop --force
dotnet ef database update
```

## Environment Variables (Alternative Configuration)

Instead of editing `appsettings.json`, you can use environment variables:

```bash
# PowerShell
$env:ConnectionStrings__DefaultConnection = "Data Source=C:\ProgramData\ThingConnect.Pulse\pulse.db"
$env:Pulse__ConfigPath = "C:\ProgramData\ThingConnect.Pulse\config.yaml"
$env:ASPNETCORE_URLS = "http://localhost:8080"

# Command Prompt
set ConnectionStrings__DefaultConnection=Data Source=C:\ProgramData\ThingConnect.Pulse\pulse.db
set Pulse__ConfigPath=C:\ProgramData\ThingConnect.Pulse\config.yaml
set ASPNETCORE_URLS=http://localhost:8080
```

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```
Error: Unable to start Kestrel. Address already in use: http://localhost:8080
```

**Solution:**
```bash
# Find process using port
netstat -ano | findstr :8080

# Kill process (replace PID)
taskkill /PID <process-id> /F

# Or use different port
dotnet run --urls="http://localhost:9000"
```

#### 2. Database Access Issues
```
Error: SQLite Error 14: 'unable to open database file'
```

**Solutions:**
- Ensure `C:\ProgramData\ThingConnect.Pulse\` directory exists
- Check folder permissions (should be writable by current user)
- Verify database path in connection string

#### 3. Configuration File Not Found
```
Warning: Configuration file not found: C:\ProgramData\ThingConnect.Pulse\config.yaml
```

**Solution:**
```bash
# Create directory
mkdir "C:\ProgramData\ThingConnect.Pulse"

# Create minimal config
echo "targets: []" > "C:\ProgramData\ThingConnect.Pulse\config.yaml"
```

### Network & Firewall Issues

#### Windows Firewall
When developing network monitoring features:

```bash
# Check if ICMP is blocked
ping 8.8.8.8

# If blocked, enable ICMP in Windows Firewall:
# 1. Windows Security > Firewall & network protection
# 2. Advanced settings > Inbound Rules
# 3. Enable "File and Printer Sharing (Echo Request - ICMPv4-In)"
```

#### Administrator Privileges
Some network operations may require elevated privileges:

```bash
# Run as administrator (if needed for raw sockets/ICMP)
# Right-click terminal > "Run as administrator"
dotnet run
```

#### Network Interface Selection
```bash
# List network interfaces (PowerShell)
Get-NetAdapter

# Check IP configuration
ipconfig /all
```

### Performance Issues

#### Build Performance
```bash
# Disable analysis in Debug builds (faster compilation)
dotnet build -p:RunAnalyzersDuringBuild=false

# Skip frontend build during backend development
dotnet build --no-dependencies ThingConnect.Pulse.Server
```

#### Runtime Performance
```bash
# Enable garbage collection logs
$env:COMPlus_gcServer = 1
dotnet run
```

### Logging Issues

#### Enable Verbose Logging
Edit `appsettings.Development.json`:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

#### View Structured Logs
```bash
# Install Serilog (optional, for better logging)
dotnet add package Serilog.AspNetCore
dotnet add package Serilog.Sinks.Console
```

## IDE Configuration

### Visual Studio 2022
1. Open `ThingConnect.Pulse.sln`
2. Set `ThingConnect.Pulse.Server` as startup project
3. Press F5 to run with debugging

### VS Code
1. Open project folder
2. Install C# Dev Kit extension
3. Use `Ctrl+F5` to run without debugging
4. Use `F5` to run with debugging

### Configuration
- IntelliSense should work automatically with .editorconfig
- Code formatting available with `dotnet format`
- Build errors shown in Problems panel

## Next Steps

After successful backend setup:

1. **Verify API**: Check Swagger UI at http://localhost:8080/swagger
2. **Check Logs**: Monitor console output for any warnings
3. **Frontend Setup**: Follow `/ops/dev.md` for full-stack development
4. **Database**: Implement EF Core models (Issue #10)

## Performance Targets

- **Cold start**: < 5 seconds
- **Hot reload**: < 2 seconds
- **Build time**: < 30 seconds (backend only)
- **Memory usage**: < 50MB (minimal load)

## Security Notes

- **Development only**: HTTP on localhost:8080
- **No authentication**: v1 has no auth (localhost + LAN only)
- **Database**: SQLite file-based, no network exposure
- **Firewall**: May need ICMP/ping permissions for monitoring

---

**Need Help?**
- Check the main `/ops/dev.md` for general commands
- Review GitHub issues for current development status
- Check application logs in console output