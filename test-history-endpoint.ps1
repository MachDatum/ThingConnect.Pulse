# Test script for /api/history/endpoint/{id} endpoint

Write-Host "Starting ASP.NET Core application..." -ForegroundColor Green
$process = Start-Process -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory ".\ThingConnect.Pulse.Server" -PassThru -NoNewWindow

# Wait for the application to start
Write-Host "Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 7

# Base URL
$baseUrl = "http://localhost:8080"

Write-Host "`nTesting /api/history/endpoint/{id} endpoint..." -ForegroundColor Cyan

# First, get an endpoint ID from the live status endpoint
Write-Host "`n0. Getting endpoint ID from live status:" -ForegroundColor Yellow
try {
    $liveResponse = Invoke-RestMethod -Uri "$baseUrl/api/status/live?pageSize=1" -Method Get
    if ($liveResponse.items.Count -gt 0) {
        $testEndpointId = $liveResponse.items[0].endpoint.id
        Write-Host "Using endpoint ID: $testEndpointId" -ForegroundColor Green
        Write-Host "Endpoint name: $($liveResponse.items[0].endpoint.name)" -ForegroundColor White
    } else {
        Write-Host "No endpoints found in database. Creating test data..." -ForegroundColor Yellow
        # Use a known GUID for testing
        $testEndpointId = "00000000-0000-0000-0000-000000000001"
    }
}
catch {
    Write-Host "Could not get endpoint from live status, using test GUID" -ForegroundColor Yellow
    $testEndpointId = "00000000-0000-0000-0000-000000000001"
}

# Define test date range (last 24 hours)
$toDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
$fromDate = (Get-Date).AddDays(-1).ToString("yyyy-MM-ddTHH:mm:ssZ")

# Test 1: Valid request with 15m bucket (default)
Write-Host "`n1. Valid request with 15m bucket (default):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/history/endpoint/$testEndpointId?from=$fromDate&to=$toDate" -Method Get
    if ($response -ne $null) {
        Write-Host "SUCCESS: Got history response" -ForegroundColor Green
        Write-Host "  Endpoint: $($response.endpoint.name) ($($response.endpoint.id))" -ForegroundColor White
        Write-Host "  Raw checks: $($response.raw.Count)" -ForegroundColor White
        Write-Host "  15m rollups: $($response.rollup15m.Count)" -ForegroundColor White  
        Write-Host "  Daily rollups: $($response.rollupDaily.Count)" -ForegroundColor White
        Write-Host "  Outages: $($response.outages.Count)" -ForegroundColor White
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 2: Request with raw bucket
Write-Host "`n2. Request with raw bucket:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/history/endpoint/$testEndpointId?from=$fromDate&to=$toDate&bucket=raw" -Method Get
    Write-Host "SUCCESS: Got raw data with $($response.raw.Count) checks" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Request with daily bucket
Write-Host "`n3. Request with daily bucket:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/history/endpoint/$testEndpointId?from=$fromDate&to=$toDate&bucket=daily" -Method Get
    Write-Host "SUCCESS: Got daily data with $($response.rollupDaily.Count) buckets" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Invalid endpoint ID
Write-Host "`n4. Invalid endpoint ID:" -ForegroundColor Yellow
try {
    $badId = "99999999-9999-9999-9999-999999999999"
    $response = Invoke-RestMethod -Uri "$baseUrl/api/history/endpoint/$badId?from=$fromDate&to=$toDate" -Method Get
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "Expected 404 error: Endpoint not found" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Invalid date format
Write-Host "`n5. Invalid date format:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/history/endpoint/$testEndpointId?from=invalid-date&to=$toDate" -Method Get
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Expected 400 error: Invalid date format" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Invalid bucket type
Write-Host "`n6. Invalid bucket type:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/history/endpoint/$testEndpointId?from=$fromDate&to=$toDate&bucket=invalid" -Method Get
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Expected 400 error: Invalid bucket type" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 7: Date range validation (from > to)
Write-Host "`n7. Invalid date range (from > to):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/history/endpoint/$testEndpointId?from=$toDate&to=$fromDate" -Method Get
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Expected 400 error: Invalid date range" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 8: Missing required parameters
Write-Host "`n8. Missing required 'from' parameter:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/history/endpoint/$testEndpointId?to=$toDate" -Method Get
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Expected 400 error: Missing required parameter" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Clean up
Write-Host "`nStopping application..." -ForegroundColor Yellow
Stop-Process -Id $process.Id -Force
Write-Host "Tests completed!" -ForegroundColor Green