# Test script for POST /api/config/apply endpoint

Write-Host "Starting ASP.NET Core application..." -ForegroundColor Green
$process = Start-Process -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory ".\ThingConnect.Pulse.Server" -PassThru -NoNewWindow

# Wait for the application to start
Write-Host "Waiting for application to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 7

# Base URL
$baseUrl = "http://localhost:8080"

Write-Host "`nTesting POST /api/config/apply endpoint..." -ForegroundColor Cyan

# Test 1: Valid YAML configuration
Write-Host "`n1. Valid YAML configuration:" -ForegroundColor Yellow
try {
    $yamlContent = Get-Content -Path ".\sample-config.yaml" -Raw
    $response = Invoke-RestMethod -Uri "$baseUrl/api/config/apply" -Method Post -Body $yamlContent -ContentType "text/plain"
    
    if ($response -ne $null) {
        Write-Host "SUCCESS: Configuration applied" -ForegroundColor Green
        Write-Host "  Config Version ID: $($response.configVersionId)" -ForegroundColor White
        Write-Host "  Added: $($response.added)" -ForegroundColor White
        Write-Host "  Updated: $($response.updated)" -ForegroundColor White
        Write-Host "  Removed: $($response.removed)" -ForegroundColor White
        Write-Host "  Warnings: $($response.warnings.Count)" -ForegroundColor White
        if ($response.warnings.Count -gt 0) {
            foreach ($warning in $response.warnings) {
                Write-Host "    - $warning" -ForegroundColor Yellow
            }
        }
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}

# Test 2: Apply same configuration again (should detect duplicate)
Write-Host "`n2. Apply same configuration again (duplicate detection):" -ForegroundColor Yellow
try {
    $yamlContent = Get-Content -Path ".\sample-config.yaml" -Raw
    $response = Invoke-RestMethod -Uri "$baseUrl/api/config/apply" -Method Post -Body $yamlContent -ContentType "text/plain"
    
    if ($response -ne $null) {
        Write-Host "SUCCESS: Duplicate detected" -ForegroundColor Green
        Write-Host "  Config Version ID: $($response.configVersionId)" -ForegroundColor White
        Write-Host "  Added: $($response.added) (should be 0)" -ForegroundColor White
        Write-Host "  Updated: $($response.updated) (should be 0)" -ForegroundColor White
        Write-Host "  Removed: $($response.removed) (should be 0)" -ForegroundColor White
        Write-Host "  Warnings: $($response.warnings.Count)" -ForegroundColor White
        foreach ($warning in $response.warnings) {
            Write-Host "    - $warning" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Empty YAML content
Write-Host "`n3. Empty YAML content:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/config/apply" -Method Post -Body "" -ContentType "text/plain"
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Expected 400 error: Empty YAML content" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Malformed YAML
Write-Host "`n4. Malformed YAML:" -ForegroundColor Yellow
try {
    $malformedYaml = @"
version: 1
defaults:
  interval_seconds: 30
  - invalid_yaml_structure
groups:
  - id: "test"
    name: "Test
    missing_quote: true
targets: [
"@
    $response = Invoke-RestMethod -Uri "$baseUrl/api/config/apply" -Method Post -Body $malformedYaml -ContentType "text/plain"
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "Expected 400 error: Malformed YAML" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Invalid content type (should still work with PlainTextInputFormatter)
Write-Host "`n5. Valid YAML with different content type:" -ForegroundColor Yellow
try {
    $yamlContent = @"
version: 1
defaults:
  interval_seconds: 10
  timeout_ms: 1000
  retries: 1
groups:
  - id: "simple-test"
    name: "Simple Test Group"
targets:
  - name: "Localhost Ping"
    host: "127.0.0.1"
    group: "simple-test"
    type: "icmp"
"@
    $response = Invoke-RestMethod -Uri "$baseUrl/api/config/apply" -Method Post -Body $yamlContent -ContentType "application/x-yaml"
    Write-Host "SUCCESS: Configuration applied with different content type" -ForegroundColor Green
    Write-Host "  Added: $($response.added)" -ForegroundColor White
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Configuration with actor and note headers
Write-Host "`n6. Configuration with actor and note headers:" -ForegroundColor Yellow
try {
    $yamlContent = @"
version: 1
defaults:
  interval_seconds: 15
  timeout_ms: 1500
  retries: 1
groups:
  - id: "header-test"
    name: "Header Test Group"
targets:
  - name: "Header Test Target"
    host: "127.0.0.1"
    group: "header-test"
    type: "icmp"
"@
    $headers = @{
        'Content-Type' = 'text/plain'
        'X-Actor' = 'test-user'
        'X-Note' = 'Testing actor and note headers'
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/api/config/apply" -Method Post -Body $yamlContent -Headers $headers
    Write-Host "SUCCESS: Configuration applied with headers" -ForegroundColor Green
    Write-Host "  Config Version ID: $($response.configVersionId)" -ForegroundColor White
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get configuration versions list
Write-Host "`n7. Get configuration versions:" -ForegroundColor Yellow
try {
    $versions = Invoke-RestMethod -Uri "$baseUrl/api/config/versions" -Method Get
    Write-Host "SUCCESS: Retrieved $($versions.Count) configuration versions" -ForegroundColor Green
    foreach ($version in $versions | Select-Object -First 3) {
        Write-Host "  - ID: $($version.id), Applied: $($version.appliedTs), Actor: $($version.actor)" -ForegroundColor White
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Get specific configuration version content
Write-Host "`n8. Get specific configuration version content:" -ForegroundColor Yellow
try {
    $versions = Invoke-RestMethod -Uri "$baseUrl/api/config/versions" -Method Get
    if ($versions.Count -gt 0) {
        $firstVersionId = $versions[0].id
        $content = Invoke-RestMethod -Uri "$baseUrl/api/config/versions/$firstVersionId" -Method Get
        Write-Host "SUCCESS: Retrieved configuration content" -ForegroundColor Green
        Write-Host "  Content length: $($content.Length) characters" -ForegroundColor White
        Write-Host "  First line: $($content -split "`n" | Select-Object -First 1)" -ForegroundColor White
    } else {
        Write-Host "No versions available to test" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 9: Get non-existent configuration version
Write-Host "`n9. Get non-existent configuration version:" -ForegroundColor Yellow
try {
    $badVersionId = "nonexistent-version-id"
    $response = Invoke-RestMethod -Uri "$baseUrl/api/config/versions/$badVersionId" -Method Get
    Write-Host "Unexpected success" -ForegroundColor Yellow
}
catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "Expected 404 error: Version not found" -ForegroundColor Green
    } else {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Clean up
Write-Host "`nStopping application..." -ForegroundColor Yellow
Stop-Process -Id $process.Id -Force
Write-Host "Tests completed!" -ForegroundColor Green