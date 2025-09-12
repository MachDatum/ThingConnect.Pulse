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

    // Rest of the existing implementation remains the same...

    private EndpointDto MapToEndpointDto(Data.Endpoint endpoint)
    {
        return new EndpointDto
        {
            Id = endpoint.Id,
            Name = endpoint.Name,
            Group = new GroupDto
            {
                Id = endpoint.Group.Id.ToString(), // Convert Guid to string
                Name = endpoint.Group.Name,
                ParentId = endpoint.Group.ParentId?.ToString(), // Optional parent ID
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

    // Existing enums and other methods remain unchanged
}