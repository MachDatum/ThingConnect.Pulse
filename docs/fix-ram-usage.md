# Fix: High RAM Usage (~70% on Windows Service)

## Root Causes

### 1. Thundering herd in MonitoringBackgroundService ✅ Fixed
**File:** `ThingConnect.Pulse.Server/Services/Monitoring/MonitoringBackgroundService.cs`

Every 15 seconds the refresh loop restarted **all** endpoint timers with `dueTime: TimeSpan.Zero`, firing every probe simultaneously regardless of configured intervals. With 200 concurrent probes, this caused bursts of 200 EF Core DbContext instances + tasks every 15 seconds.

**Fix applied:** Timers are now only restarted when the interval changes. Existing timers run undisturbed on their own schedule.

---

### 2. MaxConcurrentProbes too high ✅ Fixed
**File:** `ThingConnect.Pulse.Server/appsettings.json`

`MaxConcurrentProbes` was set to 200. Each concurrent probe creates a DbContext (~50–100KB each) plus async task overhead.

**Fix applied:** Lowered to 100.

---

### 3. EF Core SQL debug logging ✅ Fixed
**File:** `ThingConnect.Pulse.Server/appsettings.json`

`"Microsoft.EntityFrameworkCore.Database.Command": "Debug"` was logging every SQL query. With hundreds of probes per minute, Serilog's internal buffer accumulated thousands of log strings per minute.

**Fix applied:** Removed the debug override, leaving EF Core at `Warning`.

---

### 4. RollupService loads entire check_results_raw table every 5 minutes ❌ Not fixed yet
**File:** `ThingConnect.Pulse.Server/Services/Rollup/RollupService.cs` — Lines 38, 103

```csharp
// PROBLEM: loads every row in the table into memory
List<CheckResultRaw> allChecks = await _context.CheckResultsRaw.ToListAsync(cancellationToken);
var rawChecks = allChecks.Where(c => c.Ts > fromTs && c.Ts <= toTs)...
```

The comment says "SQLite has issues with DateTimeOffset comparisons" but `Ts` is stored as a `long` unix timestamp — EF Core pushes `long` comparisons to SQL without issue. With 60-day retention at moderate probe frequency this is potentially millions of rows loaded every 5 minutes.

**Fix needed:**
```csharp
List<CheckResultRaw> rawChecks = await _context.CheckResultsRaw
    .Where(c => c.Ts > fromTs && c.Ts <= toTs)
    .AsNoTracking()
    .OrderBy(c => c.EndpointId).ThenBy(c => c.Ts)
    .ToListAsync(cancellationToken);
```
Apply the same change to both `ProcessRollup15mAsync` (line 38) and `ProcessRollupDailyAsync` (line 103).

---

### 5. HistoryService loads all rows for an endpoint then filters in memory ❌ Not fixed yet
**File:** `ThingConnect.Pulse.Server/Services/HistoryService.cs` — Lines 88, 112, 137, 161

All four query methods (`GetRawDataAsync`, `GetRollup15mDataAsync`, `GetRollupDailyDataAsync`, `GetOutagesAsync`) follow the same pattern:

```csharp
// PROBLEM: loads all rows for the endpoint, filters by time in C#
var data = await _context.CheckResultsRaw
    .Where(c => c.EndpointId == endpointId)
    .ToListAsync();
return data.Where(c => c.Ts >= fromUnix && c.Ts <= toUnix)...
```

**Fix needed:** Push the time filter into SQL and add `AsNoTracking()`:
```csharp
return await _context.CheckResultsRaw
    .Where(c => c.EndpointId == endpointId && c.Ts >= fromUnix && c.Ts <= toUnix)
    .AsNoTracking()
    .OrderBy(c => c.Ts)
    .Select(c => new RawCheckDto { ... })
    .ToListAsync();
```
Apply to all four methods — same pattern, just add the timestamp condition into the existing `.Where()`.

---

## Priority

| # | Issue | Impact | Status |
|---|-------|--------|--------|
| 1 | Thundering herd (timer restart) | High | ✅ Fixed |
| 2 | MaxConcurrentProbes = 200 | Medium | ✅ Fixed |
| 3 | EF Core debug logging | Medium | ✅ Fixed |
| 4 | RollupService full table scan | **Critical** | ❌ Pending |
| 5 | HistoryService full scan per request | High | ❌ Pending |

Issues 4 and 5 are the remaining work. Issue 4 in particular is likely the dominant long-term cause — a periodic full table load every 5 minutes will grow worse as data accumulates.
