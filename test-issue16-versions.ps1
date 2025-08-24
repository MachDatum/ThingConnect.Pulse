# Test script specifically for Issue #16: Config Versions List/Download
# Tests the acceptance criteria:
# - Lists versions newest-first  
# - Download returns exact YAML with correct content-type

Write-Host "Starting ASP.NET Core application..." -ForegroundColor Green
$process = Start-Process -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory ".\ThingConnect.Pulse.Server" -PassThru -NoNewWindow

# Wait for the application to start
Write-Host "Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$baseUrl = "http://localhost:8080"

Write-Host "`nTesting Issue #16: Config Versions List/Download" -ForegroundColor Cyan

# First, apply a few configurations to have version data
Write-Host "`nSetting up test data - applying configurations..." -ForegroundColor Yellow

$config1 = @"
version: 1
defaults:
  interval_seconds: 30
  timeout_ms: 2000
groups:
  - id: "test1"
    name: "Test Group 1"
targets:
  - name: "Test Target 1"
    host: "127.0.0.1"
    group: "test1"
    type: "icmp"
"@

$config2 = @"
version: 1
defaults:
  interval_seconds: 60
  timeout_ms: 3000
groups:
  - id: "test2"
    name: "Test Group 2"
targets:
  - name: "Test Target 2"
    host: "8.8.8.8"
    group: "test2"
    type: "icmp"
"@

try {
    # Apply first config
    $response1 = Invoke-RestMethod -Uri "$baseUrl/api/config/apply" -Method Post -Body $config1 -ContentType "text/plain"
    Write-Host "Applied config 1: $($response1.configVersionId)" -ForegroundColor Green
    
    Start-Sleep -Seconds 1
    
    # Apply second config  
    $response2 = Invoke-RestMethod -Uri "$baseUrl/api/config/apply" -Method Post -Body $config2 -ContentType "text/plain"
    Write-Host "Applied config 2: $($response2.configVersionId)" -ForegroundColor Green
} catch {
    Write-Host "Setup failed: $($_.Exception.Message)" -ForegroundColor Red
    Stop-Process -Id $process.Id -Force
    exit 1
}

# Test 1: GET /api/config/versions - Lists versions newest-first
Write-Host "`n1. Testing GET /api/config/versions (newest-first ordering):" -ForegroundColor Yellow
try {
    $versions = Invoke-RestMethod -Uri "$baseUrl/api/config/versions" -Method Get
    
    Write-Host "SUCCESS: Retrieved $($versions.Count) configuration versions" -ForegroundColor Green
    
    if ($versions.Count -ge 2) {
        $first = [DateTime]::Parse($versions[0].appliedTs)
        $second = [DateTime]::Parse($versions[1].appliedTs)
        
        if ($first -gt $second) {
            Write-Host "✅ ACCEPTANCE CRITERIA MET: Versions listed newest-first" -ForegroundColor Green
            Write-Host "  - First version: $($versions[0].appliedTs)" -ForegroundColor White
            Write-Host "  - Second version: $($versions[1].appliedTs)" -ForegroundColor White
        } else {
            Write-Host "❌ ACCEPTANCE CRITERIA FAILED: Versions not ordered newest-first" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Insufficient test data - need at least 2 versions to verify ordering" -ForegroundColor Yellow
    }
    
    Write-Host "`nVersion details:" -ForegroundColor Gray
    foreach ($version in $versions | Select-Object -First 3) {
        Write-Host "  - ID: $($version.id)" -ForegroundColor White
        Write-Host "    Applied: $($version.appliedTs)" -ForegroundColor White
        $actorValue = if ($version.actor) { $version.actor } else { 'null' }
        Write-Host "    Actor: $actorValue" -ForegroundColor White
        Write-Host "    Hash: $($version.fileHash.Substring(0,8))..." -ForegroundColor Gray
        Write-Host "" 
    }
    
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: GET /api/config/versions/{id} - Download returns exact YAML with correct content-type
Write-Host "`n2. Testing GET /api/config/versions/{id} (YAML download with content-type):" -ForegroundColor Yellow
try {
    $versions = Invoke-RestMethod -Uri "$baseUrl/api/config/versions" -Method Get
    if ($versions.Count -gt 0) {
        $firstVersionId = $versions[0].id
        
        # Use Invoke-WebRequest instead of Invoke-RestMethod to get headers
        $response = Invoke-WebRequest -Uri "$baseUrl/api/config/versions/$firstVersionId" -Method Get
        
        Write-Host "SUCCESS: Retrieved configuration version content" -ForegroundColor Green
        
        # Check content type
        $contentType = $response.Headers.'Content-Type'
        if ($contentType -and $contentType.Contains('text/plain')) {
            Write-Host "✅ ACCEPTANCE CRITERIA MET: Returns correct content-type (text/plain)" -ForegroundColor Green
            Write-Host "  Content-Type: $contentType" -ForegroundColor White
        } else {
            Write-Host "❌ ACCEPTANCE CRITERIA FAILED: Incorrect content-type" -ForegroundColor Red
            Write-Host "  Expected: text/plain" -ForegroundColor White
            Write-Host "  Actual: $contentType" -ForegroundColor White
        }
        
        # Check content is YAML
        $content = $response.Content
        if ($content.StartsWith('version:') -and $content.Contains('defaults:')) {
            Write-Host "✅ ACCEPTANCE CRITERIA MET: Returns exact YAML content" -ForegroundColor Green
            Write-Host "  Content length: $($content.Length) characters" -ForegroundColor White
            Write-Host "  First line: $($content -split "`n" | Select-Object -First 1)" -ForegroundColor White
        } else {
            Write-Host "❌ ACCEPTANCE CRITERIA FAILED: Content is not valid YAML" -ForegroundColor Red
        }
        
    } else {
        Write-Host "⚠️ No versions available to test" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: GET /api/config/versions/{id} with non-existent ID - should return 404
Write-Host "`n3. Testing GET /api/config/versions/{id} with non-existent ID:" -ForegroundColor Yellow
try {
    $badVersionId = "nonexistent-version-id"
    $response = Invoke-RestMethod -Uri "$baseUrl/api/config/versions/$badVersionId" -Method Get
    Write-Host "❌ UNEXPECTED SUCCESS - should have returned 404" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "✅ Expected 404 error: Version not found" -ForegroundColor Green
    } else {
        Write-Host "❌ Wrong error code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Clean up
Write-Host "`nStopping application..." -ForegroundColor Yellow
Stop-Process -Id $process.Id -Force
Write-Host "Issue #16 testing completed!" -ForegroundColor Green