# ThingConnect Pulse - Windows Service Installation Script
# Run as Administrator

param(
    [string]$Action = "install"
)

$ServiceName = "ThingConnectPulseSvc"
$ServiceDisplayName = "ThingConnect Pulse Server"
$ServiceDescription = "Network availability monitoring system for manufacturing sites"

# Directory paths following installer conventions
$ProgramDataRoot = "$env:ProgramData\ThingConnect.Pulse"
$ConfigDir = "$ProgramDataRoot\config"
$VersionsDir = "$ProgramDataRoot\versions"
$LogsDir = "$ProgramDataRoot\logs"
$DataDir = "$ProgramDataRoot\data"

# Get the current script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Determine binary path - check if we're in an installed location or development
$InstalledBinaryPath = Join-Path $ScriptDir "ThingConnect.Pulse.Server.exe"
$DevBinaryPath = Join-Path $ScriptDir "ThingConnect.Pulse.Server\bin\Release\net8.0\ThingConnect.Pulse.Server.exe"
$DevDebugBinaryPath = Join-Path $ScriptDir "ThingConnect.Pulse.Server\bin\Debug\net8.0\ThingConnect.Pulse.Server.exe"

if (Test-Path $InstalledBinaryPath) {
    $BinaryPath = $InstalledBinaryPath
    Write-Host "Using installed binary: $BinaryPath" -ForegroundColor Cyan
} elseif (Test-Path $DevBinaryPath) {
    $BinaryPath = $DevBinaryPath
    Write-Host "Using development Release binary: $BinaryPath" -ForegroundColor Cyan
} elseif (Test-Path $DevDebugBinaryPath) {
    $BinaryPath = $DevDebugBinaryPath
    Write-Host "Using development Debug binary: $BinaryPath" -ForegroundColor Cyan
} else {
    Write-Error "Could not find ThingConnect.Pulse.Server.exe in any expected location"
    Write-Host "Searched locations:" -ForegroundColor Yellow
    Write-Host "  - $InstalledBinaryPath" -ForegroundColor Gray
    Write-Host "  - $DevBinaryPath" -ForegroundColor Gray
    Write-Host "  - $DevDebugBinaryPath" -ForegroundColor Gray
    exit 1
}

# Ensure we have admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script requires Administrator privileges. Please run as Administrator."
    exit 1
}

# Function to create directory structure with proper permissions
function Initialize-DirectoryStructure {
    Write-Host "Creating directory structure..." -ForegroundColor Yellow
    
    $directories = @($ProgramDataRoot, $ConfigDir, $VersionsDir, $LogsDir, $DataDir)
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "  Created: $dir" -ForegroundColor Green
        } else {
            Write-Host "  Exists: $dir" -ForegroundColor Cyan
        }
    }
    
    # Create default config file if it doesn't exist
    $configFile = "$ConfigDir\config.yaml"
    if (-not (Test-Path $configFile)) {
        $defaultConfig = @"
# ThingConnect Pulse Configuration
# This is the main configuration file for network monitoring
# 
# For configuration syntax and examples, see:
# https://github.com/MachDatum/ThingConnect.Pulse/blob/main/docs/config.schema.json

# Example configuration:
# targets:
#   - name: "Router"
#     endpoints:
#       - host: "192.168.1.1"
#         type: "icmp"
#   - name: "Web Services" 
#     endpoints:
#       - host: "www.example.com"
#         type: "http"
#         path: "/health"

# Empty configuration - add your monitoring targets above
targets: []
"@
        Set-Content -Path $configFile -Value $defaultConfig -Encoding UTF8
        Write-Host "  Created default config: $configFile" -ForegroundColor Green
    }
}

switch ($Action.ToLower()) {
    "install" {
        Write-Host "Installing ThingConnect Pulse Windows Service..." -ForegroundColor Green
        
        # Create directory structure
        Initialize-DirectoryStructure
        
        # Only build if we're in development mode (not using installed binary)
        if ($BinaryPath -ne $InstalledBinaryPath) {
            Write-Host "Building application..." -ForegroundColor Yellow
            dotnet build ThingConnect.Pulse.Server --configuration Release
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Build failed!"
                exit 1
            }
        } else {
            Write-Host "Using pre-built installed binary" -ForegroundColor Cyan
        }
        
        # Stop service if it exists
        $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        if ($service) {
            Write-Host "Stopping existing service..." -ForegroundColor Yellow
            Stop-Service -Name $ServiceName -Force
            
            Write-Host "Removing existing service..." -ForegroundColor Yellow
            sc.exe delete $ServiceName
            Start-Sleep 2
        }
        
        # Create the service
        Write-Host "Creating service..." -ForegroundColor Yellow
        New-Service -Name $ServiceName -BinaryPathName $BinaryPath -DisplayName $ServiceDisplayName -Description $ServiceDescription -StartupType Automatic
        
        Write-Host "Service '$ServiceDisplayName' installed successfully!" -ForegroundColor Green
        Write-Host "Use 'Start-Service $ServiceName' to start the service" -ForegroundColor Cyan
        Write-Host "Configuration: $ConfigDir\config.yaml" -ForegroundColor Cyan
        Write-Host "Database: $DataDir\pulse.db" -ForegroundColor Cyan
        Write-Host "Logs: $LogsDir\" -ForegroundColor Cyan
        Write-Host "Web interface: http://localhost:8090" -ForegroundColor Cyan
    }
    
    "uninstall" {
        Write-Host "Uninstalling ThingConnect Pulse Windows Service..." -ForegroundColor Red
        
        $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        if ($service) {
            Write-Host "Stopping service..." -ForegroundColor Yellow
            Stop-Service -Name $ServiceName -Force
            
            Write-Host "Removing service..." -ForegroundColor Yellow
            sc.exe delete $ServiceName
            
            Write-Host "Service '$ServiceDisplayName' uninstalled successfully!" -ForegroundColor Green
        } else {
            Write-Host "Service '$ServiceName' not found." -ForegroundColor Yellow
        }
        
        # Ask about data cleanup
        Write-Host ""
        Write-Host "Data cleanup options:" -ForegroundColor Yellow
        Write-Host "The following directories contain application data:"
        Write-Host "  Config: $ConfigDir" 
        Write-Host "  Database: $DataDir"
        Write-Host "  Logs: $LogsDir"
        Write-Host "  Versions: $VersionsDir"
        Write-Host ""
        Write-Host "Would you like to remove application data? (y/N)" -ForegroundColor Yellow -NoNewline
        $response = Read-Host " "
        
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host "Removing application data..." -ForegroundColor Yellow
            if (Test-Path $ProgramDataRoot) {
                Remove-Item -Path $ProgramDataRoot -Recurse -Force
                Write-Host "Application data removed." -ForegroundColor Green
            }
        } else {
            Write-Host "Application data preserved." -ForegroundColor Cyan
            Write-Host "To manually remove later: Remove-Item '$ProgramDataRoot' -Recurse -Force" -ForegroundColor Gray
        }
    }
    
    "start" {
        Write-Host "Starting ThingConnect Pulse Service..." -ForegroundColor Green
        Start-Service -Name $ServiceName
        Write-Host "Service started successfully!" -ForegroundColor Green
    }
    
    "stop" {
        Write-Host "Stopping ThingConnect Pulse Service..." -ForegroundColor Red
        Stop-Service -Name $ServiceName
        Write-Host "Service stopped successfully!" -ForegroundColor Green
    }
    
    "status" {
        $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
        if ($service) {
            Write-Host "Service Status: $($service.Status)" -ForegroundColor Cyan
            Write-Host "Startup Type: $($service.StartType)" -ForegroundColor Cyan
        } else {
            Write-Host "Service '$ServiceName' not installed." -ForegroundColor Yellow
        }
    }
    
    default {
        Write-Host "Usage: .\install-service.ps1 [install|uninstall|start|stop|status]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Cyan
        Write-Host "  install   - Build and install the Windows Service" -ForegroundColor White
        Write-Host "  uninstall - Remove the Windows Service" -ForegroundColor White
        Write-Host "  start     - Start the service" -ForegroundColor White
        Write-Host "  stop      - Stop the service" -ForegroundColor White
        Write-Host "  status    - Show service status" -ForegroundColor White
    }
}