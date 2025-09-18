using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services;

public interface IStatusService
{
    Task<List<LiveStatusItemDto>> GetLiveStatusAsync(string? group, string? search);
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

        // Get latest checks for all endpoints - optimized query using window functions in SQLite
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
            StatusType status = DetermineStatus(endpoint, latestCheckDict);
            List<SparklinePoint> sparkline = sparklineData.ContainsKey(endpoint.Id)
                ? sparklineData[endpoint.Id]
                : new List<SparklinePoint>();

            _logger.LogInformation(
                "Endpoint {EndpointName}: Status = {Status}, LastRttMs = {RttMs}, LastChangeTs = {LastChangeTs}",
                endpoint.Name, status, endpoint.LastRttMs, endpoint.LastChangeTs);

            items.Add(new LiveStatusItemDto
            {
                Endpoint = MapToEndpointDto(endpoint),
                Status = status.ToString().ToLower(),
                RttMs = endpoint.LastRttMs,
                LastChangeTs = endpoint.LastChangeTs.HasValue ? UnixTimestamp.FromUnixSeconds(endpoint.LastChangeTs.Value) : DateTimeOffset.Now,
                Sparkline = sparkline
            });
        }

        return items;
    }

    /// <summary>
    /// Gets all groups with caching for better performance.
    /// </summary>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
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

        // Get last 20 checks for each endpoint - optimized with time filter in query
        long cutoffTime = UnixTimestamp.Subtract(UnixTimestamp.Now(), TimeSpan.FromHours(2));
        var recentChecks = await _context.CheckResultsRaw
            .Where(c => endpointIds.Contains(c.EndpointId) && c.Ts >= cutoffTime)
            .AsNoTracking()
            .Select(c => new { c.EndpointId, c.Ts, c.Status })
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
                .Select(c => new SparklinePoint
                {
                    Ts = UnixTimestamp.FromUnixSeconds(c.Ts),
                    S = c.Status == UpDown.up ? "u" : "d"
                })
                .ToList();

            sparklineData[group.Key] = points;
        }

        return sparklineData;
    }

    private StatusType DetermineStatus(Data.Endpoint endpoint, Dictionary<Guid, CheckResultRaw?> latestChecks)
    {
        // Check if we have recent check data
        if (!latestChecks.TryGetValue(endpoint.Id, out CheckResultRaw? latestCheck) || latestCheck == null)
        {
            return StatusType.Down; // No data means down
        }

        // Check if the latest check is recent enough (within 2x interval)
        var expectedInterval = TimeSpan.FromSeconds(endpoint.IntervalSeconds * 2);
        if (UnixTimestamp.Now() - latestCheck.Ts > (long)expectedInterval.TotalSeconds)
        {
            return StatusType.Down; // Stale data means down
        }

        // Check for flapping (multiple state changes in short period)
        // This is simplified - in production you'd want more sophisticated flap detection
        if (IsFlapping(endpoint.Id).Result)
        {
            return StatusType.Flapping;
        }

        return latestCheck.Status == UpDown.up ? StatusType.Up : StatusType.Down;
    }

    private async Task<bool> IsFlapping(Guid endpointId)
    {
        // Simple flap detection: check if there were > 3 state changes in last 5 minutes
        long cutoffTime = UnixTimestamp.Subtract(UnixTimestamp.Now(), TimeSpan.FromMinutes(5));
        var checks = await _context.CheckResultsRaw
            .Where(c => c.EndpointId == endpointId && c.Ts >= cutoffTime)
            .AsNoTracking()
            .Select(c => new { c.Ts, c.Status })
            .ToListAsync();

        var recentChecks = checks
            .OrderBy(c => c.Ts)
            .Select(c => c.Status)
            .ToList();

        if (recentChecks.Count < 4)
        {
            return false;
        }

        int stateChanges = 0;
        for (int i = 1; i < recentChecks.Count; i++)
        {
            if (recentChecks[i] != recentChecks[i - 1])
            {
                stateChanges++;
            }
        }

        return stateChanges > 3;
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
