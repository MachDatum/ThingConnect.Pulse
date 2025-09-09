---
sidebar_position: 1
---

# YAML Configuration

Advanced YAML configuration reference for ThingConnect Pulse monitoring endpoints.

## Configuration File Structure

ThingConnect Pulse uses YAML-based configuration for defining monitoring endpoints and system settings.

### Basic Structure

```yaml
# ThingConnect Pulse Configuration v1.0
apiVersion: "v1"
kind: "PulseConfiguration"
metadata:
  name: "production-monitoring"
  description: "Production environment monitoring configuration"
  version: "1.2.3"
  created: "2024-01-15T10:00:00Z"
  lastModified: "2024-01-15T14:30:00Z"
  labels:
    environment: "production"
    site: "manufacturing-floor-1"

# Global settings
settings:
  monitoring:
    defaultInterval: 30
    defaultTimeout: 5
    defaultRetryCount: 3
    maxConcurrentChecks: 100
  
  data:
    retention:
      rawData: "60d"
      rollupData: "1y"
      logData: "30d"
    compression: true
    
  notifications:
    enabled: true
    defaultChannels: ["email", "webhook"]

# Endpoint groups for organization
groups:
  - id: "network-core"
    name: "Core Network Infrastructure"
    description: "Critical network devices and routers"
    priority: "critical"
    tags: ["network", "core", "critical"]
    
  - id: "servers-web"
    name: "Web Servers"
    description: "Frontend web server cluster"
    priority: "high"
    parent: "servers"
    tags: ["web", "frontend"]

# Monitoring endpoints
endpoints:
  # Network device monitoring
  - id: "router-primary"
    name: "Primary Gateway Router"
    address: "192.168.1.1"
    type: "icmp"
    group: "network-core"
    
    # Override default settings
    interval: 15
    timeout: 3
    retryCount: 5
    
    # Tags for filtering and organization
    tags: ["gateway", "primary", "critical"]
    
    # Custom properties
    properties:
      location: "Rack A1"
      vendor: "Cisco"
      model: "ISR 4431"
      serialNumber: "ABC123456"
    
    # Maintenance windows
    maintenance:
      - name: "Weekly Maintenance"
        schedule: "0 2 * * SUN"  # Every Sunday at 2 AM
        duration: "PT2H"         # 2 hours
      - name: "Monthly Firmware Update"
        schedule: "0 3 1 * *"    # First of month at 3 AM
        duration: "PT4H"         # 4 hours
    
    # Alert configuration
    alerts:
      - trigger: "status_change"
        channels: ["email", "slack", "pagerduty"]
        threshold: 2  # Alert after 2 consecutive failures
      - trigger: "performance_degradation"
        metric: "response_time"
        operator: ">"
        value: 100    # Alert if response time > 100ms
        duration: "5m" # For 5 consecutive minutes
    
  # TCP service monitoring
  - id: "web-server-01"
    name: "Web Server 01"
    address: "192.168.1.100"
    type: "tcp"
    port: 80
    group: "servers-web"
    
    # Advanced TCP options
    tcp:
      connectionTimeout: 10
      sendData: "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n"
      expectResponse: "HTTP/1.1 200"
      closeConnection: true
    
    # Health check endpoint
    healthCheck:
      enabled: true
      path: "/health"
      method: "GET"
      expectedStatus: 200
      expectedContent: "OK"
    
    # Load balancer integration
    loadBalancer:
      enabled: true
      weight: 100
      maxConnections: 1000
      healthCheckInterval: 10

  # HTTP/HTTPS monitoring with advanced options
  - id: "api-server"
    name: "API Server"
    address: "https://api.example.com"
    type: "https"
    port: 443
    group: "servers-web"
    
    # HTTP-specific configuration
    http:
      method: "POST"
      path: "/api/v1/health"
      headers:
        Authorization: "Bearer ${API_TOKEN}"
        Content-Type: "application/json"
        User-Agent: "ThingConnect-Pulse/1.0"
      
      body: |
        {
          "source": "monitoring",
          "timestamp": "${TIMESTAMP}"
        }
      
      # Response validation
      validation:
        statusCodes: [200, 201]
        contentType: "application/json"
        responseTime: 2000  # Max 2 seconds
        contentMatches:
          - pattern: '"status":\s*"healthy"'
            type: "regex"
          - pattern: "uptime"
            type: "contains"
        
        # JSON response validation
        jsonSchema:
          type: "object"
          required: ["status", "uptime", "version"]
          properties:
            status:
              type: "string"
              enum: ["healthy", "degraded"]
            uptime:
              type: "number"
              minimum: 0
      
      # SSL/TLS configuration
      tls:
        verifySSL: true
        minVersion: "1.2"
        cipherSuites: ["TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"]
        certificateCheck:
          enabled: true
          warnDays: 30    # Warn when cert expires in 30 days
          errorDays: 7    # Error when cert expires in 7 days
    
    # Rate limiting for API endpoints
    rateLimiting:
      enabled: true
      requestsPerMinute: 60
      burstLimit: 10
    
    # Circuit breaker pattern
    circuitBreaker:
      enabled: true
      failureThreshold: 5      # Open after 5 failures
      recoveryTimeout: "30s"   # Try again after 30 seconds
      successThreshold: 3      # Close after 3 successes

  # Database monitoring
  - id: "database-primary"
    name: "Primary Database"
    address: "192.168.1.200"
    type: "tcp"
    port: 5432
    group: "databases"
    
    # Database-specific monitoring
    database:
      type: "postgresql"
      connectionString: "postgresql://monitor:${DB_PASSWORD}@192.168.1.200:5432/monitoring"
      
      # Custom SQL health check
      healthQuery: |
        SELECT 
          'healthy' as status,
          extract(epoch from now()) as timestamp,
          (SELECT count(*) FROM pg_stat_activity) as connections
      
      # Performance metrics
      metrics:
        - name: "connection_count"
          query: "SELECT count(*) FROM pg_stat_activity"
          threshold: 80
        - name: "slow_queries"
          query: "SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AND now() - query_start > interval '30 seconds'"
          threshold: 5
    
    # Connection pooling
    connectionPool:
      minConnections: 2
      maxConnections: 10
      idleTimeout: "5m"
      lifetime: "1h"

# Alert channels configuration
alertChannels:
  - id: "email"
    type: "email"
    config:
      smtpServer: "smtp.company.com"
      port: 587
      username: "monitoring@company.com"
      password: "${SMTP_PASSWORD}"
      from: "monitoring@company.com"
      to: ["admin@company.com", "ops@company.com"]
      
      # Email templating
      templates:
        subject: "[PULSE] {{.Endpoint.Name}} is {{.Status}}"
        body: |
          Endpoint: {{.Endpoint.Name}}
          Address: {{.Endpoint.Address}}
          Status: {{.Status}}
          Time: {{.Timestamp}}
          
          {{if .PreviousStatus}}
          Previous Status: {{.PreviousStatus}}
          {{end}}
          
          {{if .ResponseTime}}
          Response Time: {{.ResponseTime}}ms
          {{end}}
          
          Dashboard: {{.DashboardURL}}

  - id: "slack"
    type: "webhook"
    config:
      url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
      method: "POST"
      headers:
        Content-Type: "application/json"
      
      # Slack message formatting
      body: |
        {
          "text": "{{if eq .Status \"offline\"}}🔴{{else}}🟢{{end}} *{{.Endpoint.Name}}* is {{.Status}}",
          "attachments": [
            {
              "color": "{{if eq .Status \"offline\"}}danger{{else}}good{{end}}",
              "fields": [
                {
                  "title": "Address",
                  "value": "{{.Endpoint.Address}}",
                  "short": true
                },
                {
                  "title": "Response Time",
                  "value": "{{.ResponseTime}}ms",
                  "short": true
                },
                {
                  "title": "Timestamp",
                  "value": "{{.Timestamp}}",
                  "short": false
                }
              ]
            }
          ]
        }

# Custom monitors for complex scenarios
customMonitors:
  - id: "complex-service-check"
    name: "Multi-step Service Validation"
    type: "custom"
    script: |
      #!/bin/bash
      # Multi-step health check script
      
      # Step 1: Check HTTP endpoint
      response=$(curl -s -o /dev/null -w "%{http_code}" https://api.example.com/health)
      if [ "$response" != "200" ]; then
        echo "CRITICAL: API health check failed (HTTP $response)"
        exit 2
      fi
      
      # Step 2: Check database connectivity
      pg_isready -h 192.168.1.200 -p 5432 -U monitor > /dev/null
      if [ $? -ne 0 ]; then
        echo "CRITICAL: Database connectivity failed"
        exit 2
      fi
      
      # Step 3: Check Redis cache
      redis-cli -h 192.168.1.201 ping > /dev/null
      if [ $? -ne 0 ]; then
        echo "WARNING: Redis cache unavailable"
        exit 1
      fi
      
      echo "OK: All services healthy"
      exit 0
    
    # Script execution configuration
    execution:
      timeout: "30s"
      environment:
        PATH: "/usr/local/bin:/usr/bin:/bin"
        DB_PASSWORD: "${DB_PASSWORD}"
      
    # Output parsing
    parsing:
      successCodes: [0]
      warningCodes: [1]
      criticalCodes: [2]
      
    interval: 60  # Run every minute
    retryCount: 2

# Template definitions for reusable configurations
templates:
  - id: "standard-web-server"
    name: "Standard Web Server Monitoring"
    description: "Template for typical web server monitoring"
    
    # Template parameters
    parameters:
      - name: "server_address"
        type: "string"
        required: true
        description: "Server IP address or hostname"
      - name: "server_port"
        type: "integer"
        default: 80
        description: "HTTP port number"
      - name: "health_path"
        type: "string"
        default: "/health"
        description: "Health check endpoint path"
    
    # Template endpoint definition
    endpoint:
      name: "Web Server - {{.server_address}}"
      address: "{{.server_address}}"
      type: "http"
      port: "{{.server_port}}"
      
      http:
        path: "{{.health_path}}"
        method: "GET"
        validation:
          statusCodes: [200]
          responseTime: 5000
      
      alerts:
        - trigger: "status_change"
          channels: ["email"]

# Environment variable definitions
variables:
  - name: "API_TOKEN"
    description: "API authentication token"
    source: "environment"
    required: true
  
  - name: "DB_PASSWORD"
    description: "Database monitoring password"
    source: "file"
    path: "/etc/pulse/secrets/db-password"
    required: true
  
  - name: "SMTP_PASSWORD"
    description: "SMTP server password"
    source: "vault"
    vaultPath: "secret/pulse/smtp"
    vaultKey: "password"
    required: true
  
  - name: "TIMESTAMP"
    description: "Current timestamp"
    source: "function"
    function: "now()"

# Conditional configurations based on environment
conditions:
  - name: "production"
    condition: "{{.Environment}} == 'production'"
    config:
      settings:
        monitoring:
          defaultInterval: 30
      
  - name: "development"
    condition: "{{.Environment}} == 'development'"
    config:
      settings:
        monitoring:
          defaultInterval: 60
        notifications:
          enabled: false
```

## Advanced Configuration Features

### Variable Substitution

ThingConnect Pulse supports variable substitution in configuration files:

#### Environment Variables
```yaml
endpoints:
  - name: "API Server"
    address: "${API_SERVER_URL}"
    http:
      headers:
        Authorization: "Bearer ${API_TOKEN}"
```

#### File-based Variables
```yaml
variables:
  - name: "DB_PASSWORD"
    source: "file"
    path: "/etc/pulse/secrets/db-password"

endpoints:
  - name: "Database"
    database:
      connectionString: "postgresql://user:${DB_PASSWORD}@localhost/db"
```

#### Vault Integration
```yaml
variables:
  - name: "SECRET_KEY"
    source: "vault"
    vaultAddress: "https://vault.company.com"
    vaultPath: "secret/pulse/api"
    vaultKey: "secret_key"
```

### Configuration Inheritance

#### Template Usage
```yaml
# Define template
templates:
  - id: "web-server-template"
    endpoint:
      type: "http"
      interval: 30
      http:
        method: "GET"
        validation:
          statusCodes: [200, 201]

# Use template
endpoints:
  - template: "web-server-template"
    name: "Web Server 1"
    address: "192.168.1.100"
    # Inherits all template properties
  
  - template: "web-server-template"
    name: "Web Server 2"
    address: "192.168.1.101"
    interval: 60  # Override template value
```

#### Group Inheritance
```yaml
groups:
  - id: "web-servers"
    defaults:
      interval: 60
      timeout: 10
      retryCount: 3
      alerts:
        - trigger: "status_change"
          channels: ["email"]

endpoints:
  - name: "Web Server 1"
    address: "192.168.1.100"
    group: "web-servers"
    # Inherits group defaults
```

### Conditional Configuration

#### Environment-based Configuration
```yaml
conditions:
  - name: "production-settings"
    condition: "{{.Environment}} == 'production'"
    apply:
      settings:
        monitoring:
          defaultInterval: 30
        notifications:
          enabled: true
  
  - name: "development-settings"
    condition: "{{.Environment}} != 'production'"
    apply:
      settings:
        monitoring:
          defaultInterval: 120
        notifications:
          enabled: false
```

#### Time-based Configuration
```yaml
conditions:
  - name: "business-hours"
    condition: "{{now.Hour}} >= 8 && {{now.Hour}} < 18"
    apply:
      endpoints:
        - name: "Business System"
          interval: 30
  
  - name: "after-hours"
    condition: "{{now.Hour}} < 8 || {{now.Hour}} >= 18"
    apply:
      endpoints:
        - name: "Business System"
          interval: 300
```

### Advanced Monitoring Types

#### Multi-step HTTP Checks
```yaml
endpoints:
  - name: "E-commerce Flow"
    type: "http-sequence"
    steps:
      - name: "Login"
        method: "POST"
        path: "/api/login"
        body: '{"username": "test", "password": "test123"}'
        extractors:
          - name: "auth_token"
            type: "json"
            path: "$.token"
      
      - name: "Get Products"
        method: "GET"
        path: "/api/products"
        headers:
          Authorization: "Bearer {{.auth_token}}"
        validation:
          statusCodes: [200]
          jsonSchema:
            type: "array"
            minItems: 1
      
      - name: "Add to Cart"
        method: "POST"
        path: "/api/cart"
        headers:
          Authorization: "Bearer {{.auth_token}}"
        body: '{"productId": 1, "quantity": 1}'
```

#### Script-based Monitoring
```yaml
endpoints:
  - name: "Custom Business Logic Check"
    type: "script"
    script:
      language: "python"
      source: |
        import requests
        import json
        
        # Custom business logic validation
        response = requests.get('https://api.example.com/business-metrics')
        data = response.json()
        
        # Check business rules
        if data['revenue'] < data['target']:
            print('WARNING: Revenue below target')
            exit(1)
        
        if data['error_rate'] > 0.01:
            print('CRITICAL: High error rate')
            exit(2)
        
        print('OK: Business metrics healthy')
        exit(0)
      
      timeout: "30s"
      environment:
        PYTHONPATH: "/usr/local/lib/python3.8/site-packages"
```

### Performance Optimization

#### Connection Pooling
```yaml
settings:
  connectionPools:
    http:
      maxIdleConns: 100
      maxIdleConnsPerHost: 10
      idleConnTimeout: "90s"
      
    database:
      maxOpenConns: 25
      maxIdleConns: 5
      connMaxLifetime: "1h"
```

#### Batching and Parallelization
```yaml
settings:
  monitoring:
    batchSize: 50           # Process endpoints in batches
    maxConcurrentChecks: 100 # Maximum parallel checks
    checkInterval: 1000      # Milliseconds between batch starts
    
  # Optimize for high-frequency monitoring
  optimization:
    keepAliveEnabled: true
    compressionEnabled: true
    cacheDNSLookups: true
    dnsLookupTimeout: "5s"
```

## Configuration Validation

### Schema Validation

ThingConnect Pulse validates configuration against a JSON schema:

```yaml
# Enable strict validation
validation:
  strict: true
  validateOnLoad: true
  validateOnSave: true
  
  # Custom validation rules
  customRules:
    - name: "unique-endpoint-names"
      description: "Endpoint names must be unique"
      rule: "len(endpoints.*.name) == len(unique(endpoints.*.name))"
    
    - name: "reasonable-intervals"
      description: "Intervals should be reasonable"
      rule: "all(endpoints, interval >= 10 && interval <= 3600)"
```

### Best Practices

#### Naming Conventions
```yaml
# Use consistent naming patterns
endpoints:
  - name: "prod-web-01"      # Environment-Service-Instance
  - name: "prod-db-primary"  # Environment-Service-Role
  - name: "prod-api-gateway" # Environment-Service-Function

groups:
  - name: "production-web-tier"
  - name: "production-data-tier"
  - name: "production-network-tier"
```

#### Documentation
```yaml
# Document your configuration
metadata:
  documentation:
    purpose: "Production manufacturing site monitoring"
    maintainer: "ops-team@company.com"
    lastReview: "2024-01-15"
    nextReview: "2024-04-15"
    
    # Reference external documentation
    references:
      - name: "Network Diagram"
        url: "https://wiki.company.com/network-diagram"
      - name: "Runbook"
        url: "https://wiki.company.com/pulse-runbook"

# Comment complex configurations
endpoints:
  # Primary gateway router - critical for all site connectivity
  # Maintenance window: Sundays 2-4 AM
  # Escalation: Network team (primary), Operations (secondary)
  - name: "gateway-router-01"
    address: "192.168.1.1"
    # ... configuration
```

#### Modular Configuration
```yaml
# Split large configurations into modules
imports:
  - "network-endpoints.yaml"
  - "server-endpoints.yaml"
  - "application-endpoints.yaml"
  - "alert-channels.yaml"

# Or use directory-based organization
includeDirectory: "/etc/pulse/conf.d/"
```