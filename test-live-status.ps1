# Test script for /api/status/live endpoint

Write-Host "Starting ASP.NET Core application..." -ForegroundColor Green
$process = Start-Process -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory ".\ThingConnect.Pulse.Server" -PassThru -NoNewWindow

# Wait for the application to start
Write-Host "Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 7

# Base URL
$baseUrl = "http://localhost:8080"

Write-Host "`nTesting /api/status/live endpoint..." -ForegroundColor Cyan

# Test 1: Basic request
Write-Host "`n1. Basic request (no parameters):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/status/live" -Method Get
    Write-Host "SUCCESS: Got response with $($response.meta.total) total items" -ForegroundColor Green
    Write-Host "Page: $($response.meta.page), PageSize: $($response.meta.pageSize)" -ForegroundColor White
    
    if ($response.items.Count -gt 0) {
        Write-Host "`nFirst item:" -ForegroundColor White
        $firstItem = $response.items[0]
        Write-Host "  Endpoint: $($firstItem.endpoint.name) ($($firstItem.endpoint.id))"
        Write-Host "  Status: $($firstItem.status)"
        Write-Host "  RTT: $($firstItem.rttMs) ms"
        Write-Host "  Last Change: $($firstItem.lastChangeTs)"
        Write-Host "  Sparkline Points: $($firstItem.sparkline.Count)"
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 2: With pagination
Write-Host "`n2. With pagination (page=1, pageSize=10):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/status/live?page=1&pageSize=10" -Method Get
    Write-Host "SUCCESS: Got $($response.items.Count) items" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: With search
Write-Host "`n3. With search (search='google'):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/status/live?search=google" -Method Get
    Write-Host "SUCCESS: Got $($response.items.Count) items matching 'google'" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: With group filter
Write-Host "`n4. With group filter (group='external'):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/status/live?group=external" -Method Get
    Write-Host "SUCCESS: Got $($response.items.Count) items in group 'external'" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Invalid parameters
Write-Host "`n5. Invalid parameters (page=0):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/status/live?page=0" -Method Get
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    Write-Host "Expected error: $($_.Exception.Message)" -ForegroundColor Green
}

Write-Host "`n6. Invalid parameters (pageSize=1000):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/status/live?pageSize=1000" -Method Get
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    Write-Host "Expected error: $($_.Exception.Message)" -ForegroundColor Green
}

# Clean up
Write-Host "`nStopping application..." -ForegroundColor Yellow
Stop-Process -Id $process.Id -Force
Write-Host "Tests completed!" -ForegroundColor Green