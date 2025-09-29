using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services;

public interface IStatusService
{
    Task<List<LiveStatusItemDto>> GetLiveStatusAsync(string? group, string? search);
    Task<List<Data.Group>> GetGroupsCachedAsync();
    void InvalidateGroupsCache();
}

public sealed class StatusService : IStatusService
{
    private readonly PulseDbContext _context;
    private readonly ILogger<StatusService> _logger;
    private readonly IMemoryCache _cache;

    public StatusService(PulseDbContext context, ILogger<StatusService> logger, IMemoryCache cache)
    {
        _context = context;
        _logger = logger;
        _cache = cache;
    }

    public async Task<List<LiveStatusItemDto>> GetLiveStatusAsync(string? group, string? search)
    {
        _logger.LogDebug("Getting live status with filters: group={Group}, search={Search}", group, search);

        // Build base query for enabled endpoints
        IQueryable<Data.Endpoint> query = _context.Endpoints
            .Include(e => e.Group)
            .Where(e => e.Enabled)
            .AsNoTracking()
            .AsQueryable();

        // Apply group filter
        if (!string.IsNullOrWhiteSpace(group))
        {
            query = query.Where(e => e.GroupId == group);
        }

        // Apply search filter (matches name or host)
        if (!string.IsNullOrWhiteSpace(search))
        {
            string searchLower = search.ToLower();
            query = query.Where(e =>
                e.Name.ToLower().Contains(searchLower) ||
                e.Host.ToLower().Contains(searchLower));
        }

        // Get total count for pagination
        int totalCount = await query.CountAsync();

        // Apply pagination
        List<Data.Endpoint> endpoints = await query
        .OrderBy(e => e.GroupId)
        .ThenBy(e => e.Name)
        .ToListAsync();

        // Get live status for each endpoint
        var items = new List<LiveStatusItemDto>();
        var endpointIds = endpoints.Select(e => e.Id).ToList();

        // Get latest checks for all endpoints - optimized query
        var latestChecks = await _context.CheckResultsRaw
            .Where(c => endpointIds.Contains(c.EndpointId))
            .AsNoTracking()
            .GroupBy(c => c.EndpointId)
            .Select(g => new
            {
                EndpointId = g.Key,
                LatestCheck = g.OrderByDescending(c => c.Ts).FirstOrDefault()
            })
            .ToListAsync();

        var latestCheckDict = latestChecks.ToDictionary(x => x.EndpointId, x => x.LatestCheck);

        // Get sparkline data (last 20 checks per endpoint for mini chart)
        Dictionary<Guid, List<SparklinePoint>> sparklineData = await GetSparklineDataAsync(endpointIds);

        foreach (Data.Endpoint? endpoint in endpoints)
        {
            CheckResultRaw? latestCheck = latestCheckDict.ContainsKey(endpoint.Id) 
                ? latestCheckDict[endpoint.Id] 
                : null;

            // 🔹 NEW: Build enhanced status with fallback + flapping + classification
            var statusInfo = await DetermineEnhancedStatusAsync(endpoint, latestCheck);
            
            List<SparklinePoint> sparkline = sparklineData.ContainsKey(endpoint.Id)
                ? sparklineData[endpoint.Id]
                : new List<SparklinePoint>();

            _logger.LogInformation(
                "Endpoint {EndpointName}: EffectiveStatus = {EffectiveStatus}, EffectiveRtt = {EffectiveRtt}, Classification = {Classification}",
                endpoint.Name, statusInfo.CurrentState.EffectiveStatus, statusInfo.CurrentState.EffectiveRtt, statusInfo.CurrentState.Classification);

            items.Add(new LiveStatusItemDto
            {
                Endpoint = MapToEndpointDto(endpoint),
                
                // 🔹 LEGACY: Keep temporarily for backward compatibility
                Status = statusInfo.CurrentState.EffectiveStatus,
                RttMs = statusInfo.CurrentState.EffectiveRtt,
                
                // 🔹 NEW: Rich current state
                CurrentState = statusInfo.CurrentState,
                
                LastChangeTs = endpoint.LastChangeTs.HasValue 
                    ? UnixTimestamp.FromUnixSeconds(endpoint.LastChangeTs.Value) 
                    : DateTimeOffset.Now,
                Sparkline = sparkline
            });
        }

        return items;
    }

    // 🔹 NEW: Enhanced status determination with all logic combined
    private async Task<(CurrentStateDto CurrentState, StatusType LegacyStatus)> DetermineEnhancedStatusAsync(Data.Endpoint endpoint, CheckResultRaw? latestCheck)
    {
        // Handle no data case
        if (latestCheck == null)
        {
            return (new CurrentStateDto
            {
                EffectiveStatus = "down",
                EffectiveRtt = null,
                Classification = (int)OutageClassification.Unknown,
                HostReachable = false,
                LastCheck = DateTimeOffset.UtcNow
            }, StatusType.Down);
        }

        // Check if data is stale (older than 2x interval)
        var expectedInterval = TimeSpan.FromSeconds(endpoint.IntervalSeconds * 2);
        bool isStale = UnixTimestamp.Now() - latestCheck.Ts > (long)expectedInterval.TotalSeconds;
 
        if (isStale)
        {
            return (new CurrentStateDto
            {
                EffectiveStatus = "down",
                EffectiveRtt = null,
                Classification = (int)OutageClassification.Unknown,
                HostReachable = false,
                LastCheck = UnixTimestamp.FromUnixSeconds(latestCheck.Ts)
            }, StatusType.Down);
        }

        // 🔹 PRIORITY 1: Check for flapping (using your existing logic)
        bool isFlapping = await IsFlappingAsync(endpoint.Id);

        if (isFlapping)
        {
            return (new CurrentStateDto
            {
                EffectiveStatus = "flapping",
                EffectiveRtt = CalculateEffectiveRtt(latestCheck),
                Classification = (int)OutageClassification.Intermittent,
                HostReachable = latestCheck.FallbackStatus == UpDown.up,
                LastCheck = UnixTimestamp.FromUnixSeconds(latestCheck.Ts)
            }, StatusType.Flapping);
        }

        // 🔹 PRIORITY 2: Normal status logic with fallback awareness
        string effectiveStatus = DetermineEffectiveStatus(latestCheck);
        StatusType legacyStatus = latestCheck.Status == UpDown.up ? StatusType.Up : StatusType.Down;
        
        // Override legacy status if we show as "up" due to fallback
        if (effectiveStatus == "up" && latestCheck.Status == UpDown.down)
        {
            legacyStatus = StatusType.Up; // Show as UP in legacy field too
        }

        return (new CurrentStateDto
        {
            EffectiveStatus = effectiveStatus,
            EffectiveRtt = CalculateEffectiveRtt(latestCheck),
            Classification = DetermineClassification(latestCheck),
            HostReachable = latestCheck.FallbackStatus == UpDown.up,
            LastCheck = UnixTimestamp.FromUnixSeconds(latestCheck.Ts)
        }, legacyStatus);
    }

    // 🔹 NEW: Determine effective status with fallback logic
    private string DetermineEffectiveStatus(CheckResultRaw check)
    {
        // If primary failed but fallback succeeded → show as UP (service issue, host reachable)
        if (check.Status == UpDown.down && check.FallbackStatus == UpDown.up)
        {
            return "up";  // Host is reachable, it's a service issue
        }
        
        // Otherwise use primary status
        return check.Status.ToString().ToLower();
    }

    // 🔹 NEW: Smart classification logic
    private int DetermineClassification(CheckResultRaw check)
    {
        // Use database classification if available
        if (check.Classification.HasValue)
        {
            return (int)check.Classification.Value;
        }

        // Fallback to simple classification logic
        if (check.Status == UpDown.up)
        {
            return (int)OutageClassification.None; // Healthy
        }
        
        if (check.Status == UpDown.down && check.FallbackStatus == UpDown.up)
        {
            return (int)OutageClassification.Service; // Service down, host up
        }
        
        if (check.Status == UpDown.down && check.FallbackStatus == UpDown.down)
        {
            return (int)OutageClassification.Network; // Both down = network issue
        }

        return (int)OutageClassification.Unknown;
    }

    // 🔹 NEW: Calculate effective RTT (priority-based)
    private double? CalculateEffectiveRtt(CheckResultRaw check)
    {
        // Priority 1: Primary probe RTT (if successful)
        if (check.Status == UpDown.up && check.RttMs.HasValue)
        {
            return check.RttMs.Value;
        }
        
        // Priority 2: Fallback RTT (if primary failed but fallback succeeded)
        if (check.Status == UpDown.down && 
            check.FallbackStatus == UpDown.up && 
            check.FallbackRttMs.HasValue)
        {
            return check.FallbackRttMs.Value;
        }
        
        // Priority 3: Both failed or no RTT available
        return null;
    }

    // 🔹 KEEP: Your existing flapping logic (enhanced)
    private async Task<bool> IsFlappingAsync(Guid endpointId)
    {
        // Enhanced: Use your existing 5-minute window with fallback consideration
        long cutoffTime = UnixTimestamp.Subtract(UnixTimestamp.Now(), TimeSpan.FromMinutes(5));
        var checks = await _context.CheckResultsRaw
            .Where(c => c.EndpointId == endpointId && c.Ts >= cutoffTime)
            .AsNoTracking()
            .Select(c => new { c.Ts, c.Status, c.FallbackStatus })
            .OrderBy(c => c.Ts)
            .ToListAsync();

        if (checks.Count < 4)
        {
            return false;
        }

        // 🔹 ENHANCED: Consider effective status for flapping (not just primary)
        var effectiveStatuses = checks.Select(c => {
            // Apply same logic: if primary down but fallback up = effective up
            if (c.Status == UpDown.down && c.FallbackStatus == UpDown.up)
                return UpDown.up;
            return c.Status;
        }).ToList();

        int stateChanges = 0;
        for (int i = 1; i < effectiveStatuses.Count; i++)
        {
            if (effectiveStatuses[i] != effectiveStatuses[i - 1])
            {
                stateChanges++;
            }
        }

        return stateChanges > 3;
    }

    /// <summary>
    /// Gets all groups with caching for better performance.
    /// </summary>
    public async Task<List<Data.Group>> GetGroupsCachedAsync()
    {
        const string cacheKey = "all_groups";

        if (_cache.TryGetValue(cacheKey, out List<Data.Group>? cachedGroups) && cachedGroups != null)
        {
            return cachedGroups;
        }

        List<Group> groups = await _context.Groups
            .AsNoTracking()
            .OrderBy(g => g.Name)
            .ToListAsync();

        // Cache for 5 minutes since groups don't change frequently
        _cache.Set(cacheKey, groups, TimeSpan.FromMinutes(5));

        _logger.LogDebug("Cached {Count} groups", groups.Count);
        return groups;
    }

    /// <summary>
    /// Invalidates the groups cache - call when groups are modified.
    /// </summary>
    public void InvalidateGroupsCache()
    {
        _cache.Remove("all_groups");
        _logger.LogDebug("Invalidated groups cache");
    }

    private async Task<Dictionary<Guid, List<SparklinePoint>>> GetSparklineDataAsync(List<Guid> endpointIds)
    {
        var sparklineData = new Dictionary<Guid, List<SparklinePoint>>();

        if (!endpointIds.Any())
        {
            return sparklineData;
        }

        // Get last 20 checks for each endpoint - optimized with time filter
        long cutoffTime = UnixTimestamp.Subtract(UnixTimestamp.Now(), TimeSpan.FromHours(2));
        var recentChecks = await _context.CheckResultsRaw
            .Where(c => endpointIds.Contains(c.EndpointId) && c.Ts >= cutoffTime)
            .AsNoTracking()
            .Select(c => new { c.EndpointId, c.Ts, c.Status, c.FallbackStatus })
            .ToListAsync();

        recentChecks = recentChecks
            .OrderBy(c => c.EndpointId)
            .ThenByDescending(c => c.Ts)
            .ToList();

        var groupedChecks = recentChecks.GroupBy(c => c.EndpointId);

        foreach (var group in groupedChecks)
        {
            var points = group
                .Take(20) // Maximum 20 points for sparkline
                .OrderBy(c => c.Ts) // Order chronologically for display
                .Select(c => {
                    // 🔹 ENHANCED: Sparkline shows effective status
                    var effectiveStatus = (c.Status == UpDown.down && c.FallbackStatus == UpDown.up) 
                        ? UpDown.up : c.Status;

                    return new SparklinePoint
                    {
                        Ts = UnixTimestamp.FromUnixSeconds(c.Ts),
                        S = effectiveStatus == UpDown.up ? "u" : "d"
                    };
                })
                .ToList();

            sparklineData[group.Key] = points;
        }

        return sparklineData;
    }

    private EndpointDto MapToEndpointDto(Data.Endpoint endpoint)
    {
        return new EndpointDto
        {
            Id = endpoint.Id,
            Name = endpoint.Name,
            Group = new GroupDto
            {
                Id = endpoint.Group.Id,
                Name = endpoint.Group.Name,
                ParentId = endpoint.Group.ParentId,
                Color = endpoint.Group.Color
            },
            Type = endpoint.Type.ToString().ToLower(),
            Host = endpoint.Host,
            Port = endpoint.Port,
            HttpPath = endpoint.HttpPath,
            HttpMatch = endpoint.HttpMatch,
            IntervalSeconds = endpoint.IntervalSeconds,
            TimeoutMs = endpoint.TimeoutMs,
            Retries = endpoint.Retries,
            Enabled = endpoint.Enabled
        };
    }

    private enum StatusType
    {
        Up,
        Down,
        Flapping
    }
}
