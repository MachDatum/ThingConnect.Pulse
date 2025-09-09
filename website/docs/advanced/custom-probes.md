---
sidebar_position: 2
---

# Custom Probes

Create custom monitoring probes and health checks for specialized use cases.

## Overview

ThingConnect Pulse supports custom probes to extend monitoring capabilities beyond built-in ICMP, TCP, and HTTP checks. Custom probes allow you to:

- Monitor application-specific metrics
- Implement complex business logic validation
- Integrate with proprietary systems
- Create multi-step verification processes
- Perform custom data analysis and alerting

## Probe Types

### Script-Based Probes

Execute custom scripts for monitoring complex scenarios.

#### Shell Script Probe

```yaml
endpoints:
  - name: "Custom Disk Space Check"
    type: "script"
    script:
      interpreter: "bash"
      source: |
        #!/bin/bash
        # Custom disk space monitoring
        
        THRESHOLD=80
        DISK_USAGE=$(df /var/lib/application | awk 'NR==2 {print $5}' | sed 's/%//')
        
        if [ "$DISK_USAGE" -gt "$THRESHOLD" ]; then
          echo "CRITICAL: Disk usage at ${DISK_USAGE}% (threshold: ${THRESHOLD}%)"
          exit 2
        elif [ "$DISK_USAGE" -gt 60 ]; then
          echo "WARNING: Disk usage at ${DISK_USAGE}%"
          exit 1
        else
          echo "OK: Disk usage at ${DISK_USAGE}%"
          exit 0
        fi
      
      timeout: "10s"
      environment:
        PATH: "/usr/local/bin:/usr/bin:/bin"
      
      # Working directory for the script
      workingDirectory: "/opt/monitoring"
```

#### PowerShell Probe (Windows)

```yaml
endpoints:
  - name: "Windows Service Monitor"
    type: "script"
    script:
      interpreter: "powershell"
      source: |
        # Monitor critical Windows services
        $services = @("Spooler", "BITS", "Themes")
        $failed = @()
        
        foreach ($service in $services) {
            $status = Get-Service -Name $service -ErrorAction SilentlyContinue
            if ($status.Status -ne "Running") {
                $failed += $service
            }
        }
        
        if ($failed.Count -gt 0) {
            Write-Output "CRITICAL: Services not running: $($failed -join ', ')"
            exit 2
        } else {
            Write-Output "OK: All critical services running"
            exit 0
        }
      
      timeout: "15s"
      executionPolicy: "RemoteSigned"
```

#### Python Probe

```yaml
endpoints:
  - name: "API Response Analysis"
    type: "script"
    script:
      interpreter: "python3"
      source: |
        import requests
        import json
        import sys
        from datetime import datetime, timedelta
        
        def check_api_health():
            try:
                # Get API metrics
                response = requests.get(
                    'https://api.example.com/metrics',
                    timeout=10,
                    headers={'User-Agent': 'ThingConnect-Pulse'}
                )
                response.raise_for_status()
                
                data = response.json()
                
                # Validate response structure
                required_fields = ['uptime', 'error_rate', 'response_time']
                for field in required_fields:
                    if field not in data:
                        print(f"CRITICAL: Missing field '{field}' in API response")
                        return 2
                
                # Check error rate
                if data['error_rate'] > 0.05:  # 5% error rate
                    print(f"CRITICAL: High error rate: {data['error_rate']:.2%}")
                    return 2
                elif data['error_rate'] > 0.02:  # 2% error rate
                    print(f"WARNING: Elevated error rate: {data['error_rate']:.2%}")
                    return 1
                
                # Check response time
                if data['response_time'] > 2000:  # 2 seconds
                    print(f"WARNING: Slow response time: {data['response_time']}ms")
                    return 1
                
                print(f"OK: API healthy - uptime: {data['uptime']}s, "
                      f"error_rate: {data['error_rate']:.2%}, "
                      f"response_time: {data['response_time']}ms")
                return 0
                
            except requests.exceptions.RequestException as e:
                print(f"CRITICAL: API request failed: {e}")
                return 2
            except json.JSONDecodeError as e:
                print(f"CRITICAL: Invalid JSON response: {e}")
                return 2
            except Exception as e:
                print(f"CRITICAL: Unexpected error: {e}")
                return 2
        
        if __name__ == "__main__":
            sys.exit(check_api_health())
      
      timeout: "30s"
      environment:
        PYTHONPATH: "/usr/local/lib/python3.8/site-packages"
      
      # Install required packages
      dependencies:
        - "requests>=2.25.0"
```

### Database Probes

Monitor database health and performance with custom queries.

#### PostgreSQL Probe

```yaml
endpoints:
  - name: "Database Performance Monitor"
    type: "database"
    database:
      driver: "postgresql"
      connectionString: "postgresql://monitor:${DB_PASSWORD}@localhost:5432/production"
      
      # Health check query
      healthQuery: |
        WITH metrics AS (
          SELECT
            (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
            (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle in transaction') as idle_in_transaction,
            (SELECT extract(epoch from max(now() - query_start)) FROM pg_stat_activity WHERE state = 'active') as longest_running_query
        )
        SELECT
          CASE 
            WHEN active_connections > 80 THEN 'CRITICAL'
            WHEN active_connections > 60 THEN 'WARNING'
            WHEN idle_in_transaction > 5 THEN 'WARNING'
            WHEN longest_running_query > 300 THEN 'WARNING'
            ELSE 'OK'
          END as status,
          json_build_object(
            'active_connections', active_connections,
            'idle_in_transaction', idle_in_transaction,
            'longest_running_query', longest_running_query
          ) as metrics
        FROM metrics;
      
      # Connection pool settings
      pool:
        maxConnections: 5
        idleTimeout: "5m"
        connectionLifetime: "1h"
      
      # Query timeout
      queryTimeout: "30s"
```

#### MongoDB Probe

```yaml
endpoints:
  - name: "MongoDB Cluster Health"
    type: "script"
    script:
      interpreter: "node"
      source: |
        const { MongoClient } = require('mongodb');
        
        async function checkMongoDB() {
          const client = new MongoClient(process.env.MONGO_URL);
          
          try {
            await client.connect();
            const admin = client.db().admin();
            
            // Check replica set status
            const replStatus = await admin.command({ replSetGetStatus: 1 });
            
            let healthyMembers = 0;
            let totalMembers = replStatus.members.length;
            
            for (const member of replStatus.members) {
              if (member.health === 1) {
                healthyMembers++;
              }
            }
            
            if (healthyMembers < totalMembers / 2 + 1) {
              console.log(`CRITICAL: Only ${healthyMembers}/${totalMembers} replica members healthy`);
              process.exit(2);
            } else if (healthyMembers < totalMembers) {
              console.log(`WARNING: ${healthyMembers}/${totalMembers} replica members healthy`);
              process.exit(1);
            }
            
            // Check database stats
            const dbStats = await client.db('production').stats();
            const dataSize = dbStats.dataSize / (1024 * 1024 * 1024); // GB
            
            console.log(`OK: All ${totalMembers} members healthy, data size: ${dataSize.toFixed(2)}GB`);
            process.exit(0);
            
          } catch (error) {
            console.log(`CRITICAL: MongoDB check failed: ${error.message}`);
            process.exit(2);
          } finally {
            await client.close();
          }
        }
        
        checkMongoDB();
      
      timeout: "20s"
      environment:
        MONGO_URL: "${MONGO_CONNECTION_STRING}"
      
      dependencies:
        - "mongodb@4.0.0"
```

### Application-Specific Probes

Monitor business logic and application-specific metrics.

#### E-commerce Order Processing

```yaml
endpoints:
  - name: "Order Processing Pipeline"
    type: "script"
    script:
      interpreter: "python3"
      source: |
        import requests
        import json
        from datetime import datetime, timedelta
        
        def check_order_processing():
            base_url = "https://api.ecommerce.com"
            api_key = os.environ.get('API_KEY')
            
            headers = {
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            }
            
            try:
                # Check recent order processing
                since = datetime.now() - timedelta(minutes=10)
                response = requests.get(
                    f'{base_url}/orders',
                    params={
                        'status': 'processing',
                        'since': since.isoformat(),
                        'limit': 100
                    },
                    headers=headers,
                    timeout=15
                )
                response.raise_for_status()
                
                orders = response.json()
                
                # Check for stuck orders
                stuck_orders = 0
                for order in orders:
                    created = datetime.fromisoformat(order['created_at'])
                    if (datetime.now() - created).total_seconds() > 1800:  # 30 minutes
                        stuck_orders += 1
                
                if stuck_orders > 5:
                    print(f"CRITICAL: {stuck_orders} orders stuck in processing > 30 minutes")
                    return 2
                elif stuck_orders > 0:
                    print(f"WARNING: {stuck_orders} orders stuck in processing")
                    return 1
                
                # Check processing rate
                total_orders = len(orders)
                if total_orders > 50:  # High volume warning
                    print(f"WARNING: High order volume: {total_orders} orders in processing")
                    return 1
                
                print(f"OK: Order processing healthy - {total_orders} orders in pipeline")
                return 0
                
            except Exception as e:
                print(f"CRITICAL: Order processing check failed: {e}")
                return 2
        
        import os
        import sys
        sys.exit(check_order_processing())
      
      interval: 120  # Every 2 minutes
      timeout: "30s"
      environment:
        API_KEY: "${ECOMMERCE_API_KEY}"
```

#### Queue Depth Monitoring

```yaml
endpoints:
  - name: "Message Queue Health"
    type: "script"
    script:
      interpreter: "python3"
      source: |
        import redis
        import json
        
        def check_redis_queues():
            try:
                r = redis.Redis(
                    host='redis.example.com',
                    port=6379,
                    password=os.environ.get('REDIS_PASSWORD'),
                    decode_responses=True
                )
                
                # Define critical queues with thresholds
                queues = {
                    'high_priority_orders': {'warning': 10, 'critical': 50},
                    'email_notifications': {'warning': 100, 'critical': 500},
                    'image_processing': {'warning': 20, 'critical': 100},
                    'report_generation': {'warning': 5, 'critical': 20}
                }
                
                issues = []
                warnings = []
                
                for queue_name, thresholds in queues.items():
                    length = r.llen(queue_name)
                    
                    if length >= thresholds['critical']:
                        issues.append(f"{queue_name}: {length} items")
                    elif length >= thresholds['warning']:
                        warnings.append(f"{queue_name}: {length} items")
                
                if issues:
                    print(f"CRITICAL: Queue overload - {', '.join(issues)}")
                    return 2
                elif warnings:
                    print(f"WARNING: High queue depth - {', '.join(warnings)}")
                    return 1
                else:
                    total_items = sum(r.llen(q) for q in queues.keys())
                    print(f"OK: All queues healthy - {total_items} total items")
                    return 0
                    
            except Exception as e:
                print(f"CRITICAL: Redis queue check failed: {e}")
                return 2
        
        import os
        import sys
        sys.exit(check_redis_queues())
      
      timeout: "15s"
      environment:
        REDIS_PASSWORD: "${REDIS_PASSWORD}"
      
      dependencies:
        - "redis>=3.5.0"
```

## Multi-Step Probes

Create complex monitoring workflows with multiple validation steps.

### End-to-End User Journey

```yaml
endpoints:
  - name: "E2E User Registration Flow"
    type: "multi-step"
    steps:
      - name: "Load Registration Page"
        type: "http"
        method: "GET"
        url: "https://app.example.com/register"
        validation:
          statusCode: 200
          responseTime: 2000
          contentContains: ["Sign Up", "Create Account"]
        extractors:
          - name: "csrf_token"
            type: "regex"
            pattern: 'name="csrf_token" value="([^"]+)"'
      
      - name: "Submit Registration"
        type: "http"
        method: "POST"
        url: "https://app.example.com/api/register"
        headers:
          Content-Type: "application/json"
          X-CSRF-Token: "{{.csrf_token}}"
        body: |
          {
            "username": "test_user_{{.timestamp}}",
            "email": "test{{.timestamp}}@example.com",
            "password": "TestPassword123!"
          }
        validation:
          statusCode: 201
          jsonPath:
            - path: "$.success"
              value: true
            - path: "$.user.id"
              exists: true
        extractors:
          - name: "user_id"
            type: "jsonpath"
            path: "$.user.id"
      
      - name: "Verify User Created"
        type: "database"
        query: |
          SELECT id, username, email, created_at
          FROM users 
          WHERE id = {{.user_id}} 
          AND created_at > NOW() - INTERVAL '1 minute'
        validation:
          rowCount: 1
          columns:
            - name: "username"
              matches: "test_user_.*"
      
      - name: "Send Welcome Email"
        type: "script"
        script:
          interpreter: "python3"
          source: |
            import time
            import imaplib
            import email
            
            # Check if welcome email was sent
            mail = imaplib.IMAP4_SSL('imap.example.com')
            mail.login('test@example.com', os.environ['EMAIL_PASSWORD'])
            mail.select('inbox')
            
            # Search for welcome email
            search_criteria = f'(SUBJECT "Welcome" TO "test{os.environ["timestamp"]}@example.com")'
            result, data = mail.search(None, search_criteria)
            
            if data[0]:
                print("OK: Welcome email found")
                sys.exit(0)
            else:
                print("WARNING: Welcome email not found")
                sys.exit(1)
          
          timeout: "30s"
          environment:
            EMAIL_PASSWORD: "${TEST_EMAIL_PASSWORD}"
    
    # Overall step configuration
    timeout: "60s"
    stopOnFailure: true
    retryCount: 2
    
    # Clean up after test
    cleanup:
      - name: "Delete Test User"
        type: "database"
        query: "DELETE FROM users WHERE username LIKE 'test_user_%'"
```

## Custom Metrics and Data Collection

### Performance Metrics Collection

```yaml
endpoints:
  - name: "Application Performance Metrics"
    type: "script"
    script:
      interpreter: "python3"
      source: |
        import psutil
        import requests
        import json
        from datetime import datetime
        
        def collect_metrics():
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'system': {
                    'cpu_percent': psutil.cpu_percent(interval=1),
                    'memory_percent': psutil.virtual_memory().percent,
                    'disk_usage': psutil.disk_usage('/').percent
                },
                'application': {}
            }
            
            try:
                # Get application metrics
                app_response = requests.get(
                    'http://localhost:8080/metrics',
                    timeout=5
                )
                app_metrics = app_response.json()
                metrics['application'] = app_metrics
                
                # Determine health status
                status = 'OK'
                issues = []
                
                if metrics['system']['cpu_percent'] > 80:
                    issues.append(f"High CPU: {metrics['system']['cpu_percent']:.1f}%")
                    status = 'WARNING'
                
                if metrics['system']['memory_percent'] > 85:
                    issues.append(f"High Memory: {metrics['system']['memory_percent']:.1f}%")
                    status = 'WARNING'
                
                if app_metrics.get('error_rate', 0) > 0.05:
                    issues.append(f"High Error Rate: {app_metrics['error_rate']:.2%}")
                    status = 'CRITICAL'
                
                # Output structured data for processing
                result = {
                    'status': status,
                    'message': '; '.join(issues) if issues else 'All metrics normal',
                    'metrics': metrics
                }
                
                print(json.dumps(result))
                return 0 if status == 'OK' else (1 if status == 'WARNING' else 2)
                
            except Exception as e:
                error_result = {
                    'status': 'CRITICAL',
                    'message': f'Metrics collection failed: {e}',
                    'metrics': {'system': metrics['system']}
                }
                print(json.dumps(error_result))
                return 2
        
        import sys
        sys.exit(collect_metrics())
      
      timeout: "30s"
      dependencies:
        - "psutil>=5.7.0"
        - "requests>=2.25.0"
    
    # Process structured output
    dataExtraction:
      enabled: true
      format: "json"
      metrics:
        - name: "cpu_usage"
          path: "$.metrics.system.cpu_percent"
          type: "gauge"
        - name: "memory_usage"  
          path: "$.metrics.system.memory_percent"
          type: "gauge"
        - name: "error_rate"
          path: "$.metrics.application.error_rate"
          type: "gauge"
```

## Integration with External Systems

### Kubernetes Health Check

```yaml
endpoints:
  - name: "Kubernetes Cluster Health"
    type: "script"
    script:
      interpreter: "bash"
      source: |
        #!/bin/bash
        # Check Kubernetes cluster health
        
        KUBECONFIG="/etc/kubernetes/admin.conf"
        NAMESPACE="production"
        
        # Check cluster nodes
        NODE_COUNT=$(kubectl get nodes --no-headers | wc -l)
        READY_NODES=$(kubectl get nodes --no-headers | grep -c " Ready ")
        
        if [ "$READY_NODES" -lt "$NODE_COUNT" ]; then
          echo "WARNING: Only $READY_NODES/$NODE_COUNT nodes ready"
          exit 1
        fi
        
        # Check critical pods
        CRITICAL_DEPLOYMENTS=("frontend" "backend" "database")
        
        for deployment in "${CRITICAL_DEPLOYMENTS[@]}"; do
          DESIRED=$(kubectl get deployment $deployment -n $NAMESPACE -o jsonpath='{.spec.replicas}')
          AVAILABLE=$(kubectl get deployment $deployment -n $NAMESPACE -o jsonpath='{.status.availableReplicas}')
          
          if [ -z "$AVAILABLE" ] || [ "$AVAILABLE" -lt "$DESIRED" ]; then
            echo "CRITICAL: Deployment $deployment has $AVAILABLE/$DESIRED replicas available"
            exit 2
          fi
        done
        
        # Check persistent volumes
        PV_ISSUES=$(kubectl get pv | grep -v "Bound\|Available" | wc -l)
        if [ "$PV_ISSUES" -gt 0 ]; then
          echo "WARNING: $PV_ISSUES persistent volumes have issues"
          exit 1
        fi
        
        echo "OK: Cluster healthy - $NODE_COUNT nodes, all deployments ready"
        exit 0
      
      timeout: "45s"
      environment:
        KUBECONFIG: "/etc/kubernetes/admin.conf"
```

### Docker Swarm Monitoring

```yaml
endpoints:
  - name: "Docker Swarm Health"
    type: "script"
    script:
      interpreter: "python3"
      source: |
        import docker
        import json
        
        def check_swarm():
            try:
                client = docker.from_env()
                
                # Check swarm status
                swarm_attrs = client.swarm.attrs
                if not swarm_attrs:
                    print("CRITICAL: Not part of a Docker swarm")
                    return 2
                
                # Check nodes
                nodes = client.nodes.list()
                manager_count = sum(1 for node in nodes if node.attrs['Spec']['Role'] == 'manager')
                worker_count = len(nodes) - manager_count
                
                unavailable_nodes = [
                    node.attrs['Description']['Hostname'] 
                    for node in nodes 
                    if node.attrs['Status']['State'] != 'ready'
                ]
                
                if unavailable_nodes:
                    print(f"WARNING: Nodes unavailable: {', '.join(unavailable_nodes)}")
                    return 1
                
                # Check services
                services = client.services.list()
                degraded_services = []
                
                for service in services:
                    tasks = service.tasks()
                    running_tasks = sum(1 for task in tasks if task['Status']['State'] == 'running')
                    desired_replicas = service.attrs['Spec'].get('Replicated', {}).get('Replicas', 1)
                    
                    if running_tasks < desired_replicas:
                        degraded_services.append(f"{service.name} ({running_tasks}/{desired_replicas})")
                
                if degraded_services:
                    print(f"CRITICAL: Services degraded: {', '.join(degraded_services)}")
                    return 2
                
                print(f"OK: Swarm healthy - {manager_count} managers, {worker_count} workers, {len(services)} services")
                return 0
                
            except Exception as e:
                print(f"CRITICAL: Swarm check failed: {e}")
                return 2
        
        import sys
        sys.exit(check_swarm())
      
      timeout: "30s"
      dependencies:
        - "docker>=5.0.0"
```

## Best Practices for Custom Probes

### Error Handling and Logging

```python
import logging
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def robust_probe():
    try:
        # Main probe logic
        result = perform_check()
        
        if result['status'] == 'critical':
            logger.error(f"Critical issue detected: {result['message']}")
            print(f"CRITICAL: {result['message']}")
            return 2
        elif result['status'] == 'warning':
            logger.warning(f"Warning condition: {result['message']}")
            print(f"WARNING: {result['message']}")
            return 1
        else:
            logger.info(f"Check passed: {result['message']}")
            print(f"OK: {result['message']}")
            return 0
            
    except Exception as e:
        logger.exception("Probe execution failed")
        print(f"CRITICAL: Probe failed with exception: {e}")
        return 2

def perform_check():
    # Implement your check logic here
    return {'status': 'ok', 'message': 'All systems operational'}

if __name__ == "__main__":
    sys.exit(robust_probe())
```

### Configuration Management

```yaml
# Use configuration files for complex probes
endpoints:
  - name: "Configurable Service Monitor"
    type: "script"
    script:
      interpreter: "python3"
      source: |
        import json
        import os
        
        # Load configuration
        config_path = os.environ.get('PROBE_CONFIG', '/etc/pulse/probe-config.json')
        with open(config_path) as f:
            config = json.load(f)
        
        # Use configuration in probe logic
        for service in config['services']:
            check_service(service['name'], service['endpoint'], service['thresholds'])
      
      environment:
        PROBE_CONFIG: "/etc/pulse/service-monitor-config.json"
```

### Performance Optimization

```yaml
# Optimize probe execution
endpoints:
  - name: "Optimized Batch Check"
    type: "script"
    script:
      source: |
        import asyncio
        import aiohttp
        
        async def check_endpoints(endpoints):
            async with aiohttp.ClientSession() as session:
                tasks = [check_single_endpoint(session, ep) for ep in endpoints]
                results = await asyncio.gather(*tasks, return_exceptions=True)
                return results
        
        # Batch check multiple endpoints efficiently
        endpoints_to_check = [
            'http://service1.local/health',
            'http://service2.local/health', 
            'http://service3.local/health'
        ]
        
        results = asyncio.run(check_endpoints(endpoints_to_check))
      
      dependencies:
        - "aiohttp>=3.7.0"
```

### Security Considerations

```yaml
endpoints:
  - name: "Secure API Check"
    type: "script"
    script:
      source: |
        import os
        import requests
        from cryptography.fernet import Fernet
        
        # Use encrypted secrets
        def decrypt_secret(encrypted_secret):
            key = os.environ['ENCRYPTION_KEY'].encode()
            f = Fernet(key)
            return f.decrypt(encrypted_secret.encode()).decode()
        
        # Secure API call
        api_token = decrypt_secret(os.environ['ENCRYPTED_API_TOKEN'])
        response = requests.get(
            'https://secure-api.example.com/status',
            headers={'Authorization': f'Bearer {api_token}'},
            verify=True,  # Always verify SSL
            timeout=10
        )
      
      environment:
        ENCRYPTION_KEY: "${PROBE_ENCRYPTION_KEY}"
        ENCRYPTED_API_TOKEN: "${ENCRYPTED_API_TOKEN}"
      
      dependencies:
        - "cryptography>=3.4.0"
```