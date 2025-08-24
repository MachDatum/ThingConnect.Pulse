# Test script for rollup functionality (Issue #27)

Write-Host "Starting ASP.NET Core application..." -ForegroundColor Green
$process = Start-Process -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory ".\ThingConnect.Pulse.Server" -PassThru -NoNewWindow

# Wait for the application to start
Write-Host "Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Base URL
$baseUrl = "http://localhost:8080"

Write-Host "`nTesting rollup functionality..." -ForegroundColor Cyan

# Test 1: Trigger 15-minute rollup
Write-Host "`n1. Triggering 15-minute rollup processing:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/test/rollup/process-15m" -Method Post
    Write-Host "SUCCESS: $($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 2: Trigger daily rollup
Write-Host "`n2. Triggering daily rollup processing:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/test/rollup/process-daily" -Method Post
    Write-Host "SUCCESS: $($response.message)" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 3: Check if rollup data was created
Write-Host "`n3. Checking if rollup data was generated (via live status):" -ForegroundColor Yellow
try {
    Start-Sleep -Seconds 2  # Give some time for rollups to process
    $response = Invoke-RestMethod -Uri "$baseUrl/api/status/live?pageSize=5" -Method Get
    Write-Host "SUCCESS: Got live status with $($response.meta.total) total endpoints" -ForegroundColor Green
    
    if ($response.items.Count -gt 0) {
        $firstItem = $response.items[0]
        Write-Host "Sample endpoint: $($firstItem.endpoint.name)" -ForegroundColor White
        Write-Host "  Status: $($firstItem.status)" -ForegroundColor White
        Write-Host "  Sparkline points: $($firstItem.sparkline.Count)" -ForegroundColor White
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Check application logs for rollup messages
Write-Host "`n4. Checking for rollup background service activity:" -ForegroundColor Yellow
Write-Host "Look for log messages like:" -ForegroundColor White
Write-Host "  - 'RollupBackgroundService starting'" -ForegroundColor Gray
Write-Host "  - 'Starting 15-minute rollup processing'" -ForegroundColor Gray
Write-Host "  - 'Completed 15m rollup processing'" -ForegroundColor Gray

Start-Sleep -Seconds 5

# Clean up
Write-Host "`nStopping application..." -ForegroundColor Yellow
Stop-Process -Id $process.Id -Force
Write-Host "Rollup tests completed!" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Check database for Rollup15m and RollupDaily records" -ForegroundColor White
Write-Host "2. Verify watermark settings are updated" -ForegroundColor White
Write-Host "3. Monitor background service runs every 5 minutes" -ForegroundColor White