using System.Net.NetworkInformation;
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
        var items = new List<LiveStatusItemDto>();
        var endpointIds = endpoints.Select(e => e.Id).ToList();

        // Fetch recent checks for all endpoints (last 5 minutes)
        long cutoffTime = UnixTimestamp.Subtract(UnixTimestamp.Now(), TimeSpan.FromMinutes(5));
        var recentChecks = await _context.CheckResultsRaw
            .Where(c => endpointIds.Contains(c.EndpointId) && c.Ts >= cutoffTime)
            .AsNoTracking()
            .Select(c => new CheckResult
            {
                EndpointId = c.EndpointId,
                Timestamp = UnixTimestamp.FromUnixSeconds(c.Ts),
                Status = c.Status,
                RttMs = c.RttMs,
                FallbackAttempted = c.FallbackStatus.HasValue,
                FallbackStatus = c.FallbackStatus,
                FallbackRttMs = c.FallbackRttMs,
                Classification = c.Classification,
            })
            .ToListAsync();

        var checksGrouped = recentChecks.GroupBy(c => c.EndpointId).ToDictionary(g => g.Key, g => g.ToList());

        Dictionary<Guid, List<SparklinePoint>> sparklineData = await GetSparklineDataAsync(endpointIds);

        foreach (Data.Endpoint? endpoint in endpoints)
        {
            var recent = checksGrouped.ContainsKey(endpoint.Id) ? checksGrouped[endpoint.Id] : new List<CheckResult>();
            StatusType status = recent.Any()
                ? recent.Last().DetermineStatusType(recent, TimeSpan.FromSeconds(endpoint.IntervalSeconds * 2))
                : StatusType.Down;

            List<SparklinePoint> sparkline = sparklineData.ContainsKey(endpoint.Id)
            ? sparklineData[endpoint.Id]
            : new List<SparklinePoint>();

            _logger.LogInformation(
                "Endpoint {EndpointName}: Status = {Status}, LastRttMs = {RttMs}, LastChangeTs = {LastChangeTs}",
                endpoint.Name, status, endpoint.LastRttMs, endpoint.LastChangeTs);

            items.Add(new LiveStatusItemDto
            {
                Endpoint = CheckResult.MapToEndpointDto(endpoint),
                CurrentState = new CurrentStateDto
                {
                    Type = recent.Any() && recent.Last().FallbackAttempted ? "icmp" : endpoint.Type.ToString().ToLower(),
                    Target = endpoint.Host,
                    Status = status.ToString().ToLower(),
                    RttMs = recent.Any() ? recent.Last().GetEffectiveRtt() : null,
                    Classification = recent.Any() ? (int)recent.Last().DetermineClassification() : 0
                },
                LastChangeTs = endpoint.LastChangeTs.HasValue
          ? UnixTimestamp.FromUnixSeconds(endpoint.LastChangeTs.Value)
          : DateTimeOffset.Now,
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
            .Select(c => new CheckResult
            {
                EndpointId = c.EndpointId,
                Timestamp = UnixTimestamp.FromUnixSeconds(c.Ts),
                Status = c.Status,
                FallbackAttempted = c.FallbackStatus.HasValue,
                FallbackStatus = c.FallbackStatus,
                Classification = c.Classification,
            })
            .ToListAsync();

        var groupedChecks = recentChecks
            .GroupBy(c => c.EndpointId)
            .ToDictionary(g => g.Key, g => g
                .OrderByDescending(c => c.Timestamp)
                .Take(20)
                .OrderBy(c => c.Timestamp) // chronological order for sparkline
                .ToList()
            );

        foreach (var kvp in groupedChecks)
        {
            var points = kvp.Value
                .Select(c => new SparklinePoint
                {
                    Ts = c.Timestamp,
                    S = c.GetEffectiveStatus() == UpDown.up ? "u" : "d" // 🔹 use effective status
                })
                .ToList();

            sparklineData[kvp.Key] = points;
        }

        return sparklineData;
    }

}
