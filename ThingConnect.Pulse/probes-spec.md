# ThingConnect Pulse - Probes & Monitoring Specification

This document defines the complete probe model, timeout semantics, flap damping, and outage detection logic for ThingConnect Pulse v1.

## Probe Types

### ICMP Ping Probes

**Purpose**: Test network layer connectivity and measure round-trip latency.

**Implementation**: Uses .NET `System.Net.NetworkInformation.Ping`

**Parameters**:
- **Host**: Target hostname or IP address
- **Timeout**: Maximum wait time in milliseconds (default: 1500ms)
- **No retries**: Single ping attempt per check cycle

**Success Criteria**: `PingReply.Status == IPStatus.Success`

**RTT Measurement**: `PingReply.RoundtripTime` (milliseconds)

**Failure Modes**:
- Timeout exceeded
- Destination unreachable
- Host not found
- Network interface error

### TCP Connection Probes

**Purpose**: Verify TCP service availability and connection establishment time.

**Implementation**: Uses .NET `System.Net.Sockets.TcpClient`

**Parameters**:
- **Host**: Target hostname or IP address  
- **Port**: TCP port number (required)
- **Timeout**: Maximum connection time in milliseconds (default: 1500ms)

**Success Criteria**: TCP three-way handshake completes successfully

**RTT Measurement**: Connection establishment time (milliseconds)

**Failure Modes**:
- Connection timeout
- Connection refused (port closed)
- Host unreachable
- Network error

### HTTP/HTTPS Probes

**Purpose**: Test web service availability, response codes, and optional content validation.

**Implementation**: Uses .NET `HttpClient` with custom configuration

**Parameters**:
- **Host**: Target hostname or IP address
- **Port**: Port number (defaults: 80 for HTTP, 443 for HTTPS)
- **Path**: Optional URL path (default: "/")
- **Expected Text**: Optional response content validation
- **Timeout**: Maximum request time in milliseconds (default: 1500ms)

**URL Construction**:
```
{scheme}://{host}[:{port}][/{path}]

Where:
- scheme = "https" if port == 443, otherwise "http"
- port omitted if 80 (HTTP) or 443 (HTTPS)
- path prefixed with "/" if not present
```

**Success Criteria**:
1. HTTP response status code 2xx (200-299)
2. If `expected_text` specified: case-insensitive substring match in response body

**RTT Measurement**: Total HTTP request/response time (milliseconds)

**Failure Modes**:
- Request timeout
- HTTP error status (4xx, 5xx)
- Expected text not found in response
- SSL/TLS handshake failure (HTTPS)
- DNS resolution failure

## Timeout & Retry Semantics

### Default Values

From `config.schema.json` defaults:
- **Interval**: 10 seconds between checks
- **Timeout**: 1500ms per probe attempt
- **Retries**: 1 retry attempt

### Timeout Behavior

**Per-Probe Timeout**: Each probe type implements strict timeout enforcement:
- **ICMP**: Native `Ping.SendPingAsync(timeout)` 
- **TCP**: `Task.WhenAny(connectTask, timeoutTask)` pattern
- **HTTP**: `CancellationTokenSource(timeoutMs)` with linked cancellation

**No Global Timeout**: Individual probe timeouts are not aggregated

### Retry Logic

**Current Implementation**: No automatic retries implemented in v1
- Configuration supports `retries` parameter but not used
- Each check cycle performs single probe attempt
- Failures immediately recorded and processed by outage detection

**Future Enhancement**: Retry logic could be added to probe methods before recording final result

## Flap Damping & State Transitions

### 2/2 Threshold Model

ThingConnect Pulse uses **2/2 flap damping** to prevent spurious state changes:

- **DOWN Transition**: 2 consecutive failures required
- **UP Transition**: 2 consecutive successes required

### State Machine

```
    [Unknown]
       |
   first check
       |
       v
    [UP/DOWN] ←→ monitoring continues
       |           |
   2 failures   2 successes  
       |           |
       v           v
    [DOWN] ←←←←→ [UP]
```

### In-Memory State Tracking

Each endpoint maintains `MonitorState` object:

```csharp
public sealed class MonitorState
{
    public UpDown? LastPublicStatus { get; set; }    // Last reported status
    public int FailStreak { get; set; }              // Consecutive failures
    public int SuccessStreak { get; set; }           // Consecutive successes  
    public DateTimeOffset? LastChangeTs { get; set; } // Last state change
    public long? OpenOutageId { get; set; }          // Current outage ID
}
```

### Transition Logic

**DOWN Transition** (`ShouldTransitionToDown()`):
- Current status ≠ DOWN
- Fail streak ≥ 2
- Creates new `Outage` record
- Sets `OpenOutageId`

**UP Transition** (`ShouldTransitionToUp()`):
- Current status ≠ UP  
- Success streak ≥ 2
- Closes open `Outage` record
- Clears `OpenOutageId`

## Outage Detection & Persistence

### Outage Records

When endpoint transitions to DOWN:

```csharp
public sealed class Outage
{
    public long Id { get; set; }
    public Guid EndpointId { get; set; }
    public DateTimeOffset StartTs { get; set; }    // First failure timestamp
    public DateTimeOffset? EndTs { get; set; }     // Recovery timestamp (null = ongoing)
    public string? StartError { get; set; }        // Error that triggered outage
    public string? EndError { get; set; }          // Last error before recovery
    public double DurationSeconds { get; set; }    // Computed field
}
```

### Outage Lifecycle

1. **Outage Start**: 
   - 2nd consecutive failure triggers `TransitionToDownAsync()`
   - Creates `Outage` record with `StartTs` = first failure time
   - Records `StartError` from triggering check

2. **Outage End**:
   - 2nd consecutive success triggers `TransitionToUpAsync()`
   - Updates `Outage.EndTs` = recovery timestamp  
   - Calculates `DurationSeconds`
   - Records `EndError` from last failure

3. **Ongoing Outages**:
   - `EndTs = null` indicates active outage
   - Continue recording individual failures in `CheckResultRaw`

## Concurrency & Performance

### Background Monitoring

**Service**: `MonitoringBackgroundService` manages all endpoint monitoring

**Concurrency Control**: 
- Semaphore-based limiting: max 100 concurrent probes (configurable)
- Per-endpoint timers based on `IntervalSeconds`
- Independent scheduling prevents cascade delays

**Configuration**:
```json
{
  "Monitoring": {
    "MaxConcurrentProbes": 20
  }
}
```

### Probe Execution Flow

1. Timer triggers for endpoint
2. Acquire semaphore slot (blocks if at limit)
3. Execute probe via `IProbeService`
4. Process result via `IOutageDetectionService`
5. Persist `CheckResultRaw` and update `Endpoint.LastStatus`
6. Release semaphore slot
7. Schedule next check based on `IntervalSeconds`

## Error Handling & Edge Cases

### Probe-Level Errors

**Exception Handling**: All probe methods use try/catch with structured error messages:

```csharp
catch (Exception ex)
{
    return CheckResult.Failure(endpointId, timestamp, $"Ping error: {ex.Message}");
}
```

**Error Categorization**:
- **Network**: "Destination unreachable", "Connection refused"  
- **Timeout**: "Connection timeout", "Request timeout"
- **Protocol**: "HTTP 500 Internal Server Error", "SSL handshake failed"
- **System**: "No network interface", "Out of memory"

### State Machine Edge Cases

**First Check**: New endpoints start with `LastPublicStatus = null`
- First result immediately sets public status (no damping)
- Subsequent changes require 2/2 threshold

**Service Restart**: In-memory `MonitorState` objects are rebuilt from database:
- `LastPublicStatus` from `Endpoint.LastStatus`  
- Streak counters reset to 0 (conservative approach)
- Ongoing outages preserved via `Outage` table queries

**Rapid Flapping**: 2/2 damping prevents oscillation:
- UP→FAIL→SUCCESS→UP: No state change (fail streak = 1)
- DOWN→SUCCESS→FAIL→DOWN: No state change (success streak = 1)

### Configuration Edge Cases

**Invalid Timeouts**: 
- Minimum: 100ms (enforced by JSON schema)
- Maximum: No limit (could cause resource issues)
- Recommendation: 1000-5000ms for production

**Invalid Intervals**:
- Minimum: 1 second (enforced by JSON schema)
- Too frequent: May overwhelm target systems
- Recommendation: 10-300 seconds based on criticality

**Port Defaults**:
- TCP probes: Port required, no default
- HTTP probes: 80 for HTTP, 443 for HTTPS auto-detection

## Performance Budgets

### Target Latencies

**In-Memory Operations**:
- State transitions: < 1ms
- Streak calculations: < 1ms

**Database Operations**:
- CheckResult insert: < 10ms
- Outage create/update: < 20ms  
- Endpoint status update: < 10ms

**Probe Operations**:
- ICMP ping: < timeout + 100ms
- TCP connect: < timeout + 100ms  
- HTTP request: < timeout + 500ms

### Memory Usage

**Per Endpoint**: ~200 bytes for `MonitorState` object
**1000 Endpoints**: ~200KB total in-memory state
**10000 Endpoints**: ~2MB total in-memory state

### Database Growth

**Raw Checks**: ~100 bytes per check record
**Daily Volume** (1000 endpoints, 10s intervals): ~8.6M records, ~860MB
**Retention**: 60 days default = ~51GB for 1000 endpoints

## Testing & Validation

### Unit Test Coverage

**Probe Services**:
- Success/failure scenarios for each probe type
- Timeout behavior validation  
- Error message formatting
- RTT measurement accuracy

**Outage Detection**:
- State machine transitions
- 2/2 threshold validation
- Flap damping effectiveness
- Edge case handling

**Background Service**:
- Concurrency limiting
- Timer scheduling
- Service lifecycle

### Integration Testing

**End-to-End Flows**:
- New endpoint → first check → status published
- Healthy endpoint → 2 failures → DOWN transition → outage created
- Down endpoint → 2 successes → UP transition → outage closed

**Performance Testing**:
- 1000 endpoints with 10s intervals
- Concurrency limits under load
- Database performance at scale

## Configuration Examples

### High-Frequency Critical Service
```yaml
targets:
  - name: "Production API"
    type: http
    host: "api.company.com"
    port: 443
    path: "/health"
    expect_text: "OK"
    interval_seconds: 5      # Every 5 seconds
    timeout_ms: 2000         # 2 second timeout
```

### Network Infrastructure Monitoring  
```yaml
targets:
  - name: "Core Router"
    type: icmp
    host: "192.168.1.1" 
    interval_seconds: 30     # Every 30 seconds
    timeout_ms: 1000         # 1 second timeout
```

### Database Service Check
```yaml
targets:
  - name: "SQL Server"
    type: tcp
    host: "db.company.com"
    port: 1433
    interval_seconds: 60     # Every minute  
    timeout_ms: 5000         # 5 second timeout
```

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-25  
**Next Review**: 2025-11-25  
**Owner**: ThingConnect Development Team