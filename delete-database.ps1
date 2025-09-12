# Delete ThingConnect Pulse Database
# This script removes the database files from the ProgramData directory

$DatabasePath = "C:\ProgramData\ThingConnect.Pulse\data"

Write-Host "Checking for database at: $DatabasePath" -ForegroundColor Yellow

if (Test-Path $DatabasePath) {
    try {
        Remove-Item -Path $DatabasePath -Recurse -Force
        Write-Host "Database deleted successfully!" -ForegroundColor Green
    }
    catch {
        Write-Host "Error deleting database: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "Database directory not found at: $DatabasePath" -ForegroundColor Yellow
}

Write-Host "Operation completed." -ForegroundColor Cyan