# ThingConnect Pulse - Windows Service Installation Script
# Run as Administrator

param(
    [string]$Action = "install"
)

$ServiceName = "ThingConnectPulse"
$ServiceDisplayName = "ThingConnect Pulse Server"
$ServiceDescription = "Network availability monitoring system for manufacturing sites"

# Get the current script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BinaryPath = Join-Path $ScriptDir "ThingConnect.Pulse.Server\bin\Debug\net8.0\ThingConnect.Pulse.Server.exe"

# Ensure we have admin privileges
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script requires Administrator privileges. Please run as Administrator."
    exit 1
}

switch ($Action.ToLower()) {
    "install" {
        Write-Host "Installing ThingConnect Pulse Windows Service..." -ForegroundColor Green
        
        # Build the application first
        Write-Host "Building application..." -ForegroundColor Yellow
        dotnet build ThingConnect.Pulse.Server --configuration Release
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Build failed!"
            exit 1
        }
        
        # Update binary path for Release build
        $BinaryPath = Join-Path $ScriptDir "ThingConnect.Pulse.Server\bin\Release\net8.0\ThingConnect.Pulse.Server.exe"
        
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
        New-Service -Name $ServiceName -BinaryPathName $BinaryPath -DisplayName $ServiceDisplayName -Description $ServiceDescription -StartupType Manual
        
        Write-Host "Service '$ServiceDisplayName' installed successfully!" -ForegroundColor Green
        Write-Host "Use 'Start-Service $ServiceName' to start the service" -ForegroundColor Cyan
        Write-Host "Logs will be written to: C:\ProgramData\ThingConnect.Pulse\logs\" -ForegroundColor Cyan
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