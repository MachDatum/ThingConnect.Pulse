# ThingConnect Pulse - Installer Build Script
# Builds and packages the application using Inno Setup

param(
    [string]$Configuration = "Release",
    [string]$InnoSetupPath = "",
    [switch]$SkipBuild = $false,
    [switch]$OpenInstaller = $false
)

$ErrorActionPreference = "Stop"

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Join-Path $ScriptDir "ThingConnect.Pulse.Server"
$PublishDir = Join-Path $ScriptDir "publish"
$InstallerDir = Join-Path $ScriptDir "installer"
$SetupScript = Join-Path $ScriptDir "setup.iss"

Write-Host "=== ThingConnect Pulse Installer Build ===" -ForegroundColor Yellow
Write-Host "Configuration: $Configuration" -ForegroundColor Cyan
Write-Host "Project: $ProjectDir" -ForegroundColor Cyan
Write-Host "Output: $InstallerDir" -ForegroundColor Cyan

# Verify prerequisites
Write-Host "=== Checking Prerequisites ===" -ForegroundColor Yellow

# Check if .NET is available
if (-not (Get-Command "dotnet" -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] .NET CLI not found. Please install .NET 8.0 SDK." -ForegroundColor Red
    exit 1
}

Write-Host "[OK] .NET CLI found" -ForegroundColor Green

# Find Inno Setup compiler
if ([string]::IsNullOrEmpty($InnoSetupPath)) {
    # Common Inno Setup installation paths
    $CommonPaths = @(
        "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
        "${env:ProgramFiles}\Inno Setup 6\ISCC.exe",
        "${env:ProgramFiles(x86)}\Inno Setup 5\ISCC.exe",
        "${env:ProgramFiles}\Inno Setup 5\ISCC.exe"
    )
    
    foreach ($Path in $CommonPaths) {
        if (Test-Path $Path) {
            $InnoSetupPath = $Path
            break
        }
    }
}

if ([string]::IsNullOrEmpty($InnoSetupPath) -or -not (Test-Path $InnoSetupPath)) {
    Write-Host "[ERROR] Inno Setup Compiler (ISCC.exe) not found." -ForegroundColor Red
    Write-Host "Please install Inno Setup from: https://jrsoftware.org/isdl.php" -ForegroundColor Cyan
    Write-Host "Or specify the path using -InnoSetupPath parameter" -ForegroundColor Cyan
    exit 1
}

Write-Host "[OK] Inno Setup found at: $InnoSetupPath" -ForegroundColor Green

# Verify setup script exists
if (-not (Test-Path $SetupScript)) {
    Write-Host "[ERROR] Setup script not found: $SetupScript" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Setup script found" -ForegroundColor Green

# Build and publish the application
if (-not $SkipBuild) {
    Write-Host "=== Building Application ===" -ForegroundColor Yellow
    
    # Clean previous publish
    if (Test-Path $PublishDir) {
        Remove-Item -Path $PublishDir -Recurse -Force
        Write-Host "Cleaned previous publish directory" -ForegroundColor Cyan
    }
    
    # Restore packages
    Write-Host "Restoring packages..." -ForegroundColor Cyan
    dotnet restore $ProjectDir
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Package restore failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Packages restored" -ForegroundColor Green
    
    # Publish application
    Write-Host "Publishing application..." -ForegroundColor Cyan
    $PublishArgs = @(
        "publish", $ProjectDir,
        "-c", $Configuration,
        "-o", $PublishDir,
        "--self-contained", "true",
        "--runtime", "win-x64",
        "/p:PublishSingleFile=true"
    )
    
    & dotnet @PublishArgs
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Application publish failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Application published to: $PublishDir" -ForegroundColor Green
} else {
    Write-Host "=== Skipping Build (using existing publish) ===" -ForegroundColor Yellow
    if (-not (Test-Path $PublishDir)) {
        Write-Host "[ERROR] Publish directory not found: $PublishDir" -ForegroundColor Red
        Write-Host "Run without -SkipBuild to build the application first" -ForegroundColor Cyan
        exit 1
    }
}

# Verify required files exist
$RequiredFiles = @(
    "ThingConnect.Pulse.Server.exe",
    "appsettings.json",
    "appsettings.Development.json"
)

foreach ($File in $RequiredFiles) {
    $FilePath = Join-Path $PublishDir $File
    if (-not (Test-Path $FilePath)) {
        Write-Host "[ERROR] Required file missing: $File" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[OK] All required files present" -ForegroundColor Green

# Create installer directory
if (-not (Test-Path $InstallerDir)) {
    New-Item -ItemType Directory -Path $InstallerDir | Out-Null
    Write-Host "Created installer directory" -ForegroundColor Cyan
}

# Build installer with Inno Setup
Write-Host "=== Building Installer ===" -ForegroundColor Yellow

Write-Host "Compiling installer..." -ForegroundColor Cyan
$InnoArgs = @(
    "/Q",  # Quiet mode
    $SetupScript
)

& $InnoSetupPath @InnoArgs
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Installer compilation failed" -ForegroundColor Red
    exit 1
}

# Find the generated installer
$InstallerPattern = Join-Path $InstallerDir "ThingConnect.Pulse.Setup*.exe"
$GeneratedInstaller = Get-ChildItem -Path $InstallerPattern -ErrorAction SilentlyContinue | Select-Object -First 1

if (-not $GeneratedInstaller) {
    Write-Host "[ERROR] Installer not found in: $InstallerDir" -ForegroundColor Red
    exit 1
}

$InstallerSize = [math]::Round($GeneratedInstaller.Length / 1MB, 2)
Write-Host "[OK] Installer created: $($GeneratedInstaller.Name) - Size: $InstallerSize MB" -ForegroundColor Green

# Display summary
Write-Host "=== Build Complete ===" -ForegroundColor Yellow
Write-Host "Installer: $($GeneratedInstaller.FullName)" -ForegroundColor Cyan
Write-Host "Size: $InstallerSize MB" -ForegroundColor Cyan

if ($OpenInstaller) {
    Write-Host "Opening installer directory..." -ForegroundColor Cyan
    Invoke-Item $InstallerDir
}

Write-Host "[SUCCESS] Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To install ThingConnect Pulse:" -ForegroundColor Cyan
Write-Host "1. Run the installer as Administrator" -ForegroundColor White
Write-Host "2. Follow the installation wizard" -ForegroundColor White
Write-Host "3. Access the web interface at http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "The installer will:" -ForegroundColor Cyan
Write-Host "- Install binaries to Program Files\ThingConnect.Pulse" -ForegroundColor White
Write-Host "- Create data directories in ProgramData\ThingConnect.Pulse" -ForegroundColor White
Write-Host "- Register and start the ThingConnectPulseSvc Windows service" -ForegroundColor White
Write-Host "- Create Start Menu shortcuts" -ForegroundColor White