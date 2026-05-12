using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services;

public interface IHistoryService
{
    Task<HistoryResponseDto?> GetEndpointHistoryAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to, string bucket = "15m");
}

public sealed class HistoryService : IHistoryService
{
    private readonly PulseDbContext _context;
    private readonly ILogger<HistoryService> _logger;

    public HistoryService(PulseDbContext context, ILogger<HistoryService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<HistoryResponseDto?> GetEndpointHistoryAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to, string bucket = "15m")
    {
        _logger.LogDebug("Getting endpoint history: endpointId={EndpointId}, from={From}, to={To}, bucket={Bucket}",
            endpointId, from, to, bucket);

        // Validate date range
        if (from >= to)
        {
            throw new ArgumentException("From date must be earlier than to date");
        }

        // Validate date range isn't too large (max 90 days for raw data, 2 years for rollups)
        TimeSpan maxRange = bucket == "raw" ? TimeSpan.FromDays(90) : TimeSpan.FromDays(730);
        if (to - from > maxRange)
        {
            throw new ArgumentException($"Date range too large for bucket type '{bucket}'. Maximum: {maxRange.TotalDays} days");
        }

        // Get the endpoint
        Data.Endpoint? endpoint = await _context.Endpoints
            .Include(e => e.Group)
            .FirstOrDefaultAsync(e => e.Id == endpointId);

        if (endpoint == null)
        {
            return null;
        }

        var response = new HistoryResponseDto
        {
            Endpoint = MapToEndpointDto(endpoint)
        };

        // Fetch data based on bucket type
        switch (bucket.ToLower())
        {
            case "raw":
                response.Raw = await GetRawDataAsync(endpointId, from, to);
                break;

            case "15m":
                response.Rollup15m = await GetRollup15mDataAsync(endpointId, from, to);
                break;

            case "daily":
                response.RollupDaily = await GetRollupDailyDataAsync(endpointId, from, to);
                break;

            default:
                throw new ArgumentException($"Invalid bucket type: {bucket}. Valid values: raw, 15m, daily");
        }

        // Always include outages for the time range
        response.Outages = await GetOutagesAsync(endpointId, from, to);

        return response;
    }

    private async Task<List<RawCheckDto>> GetRawDataAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        long fromUnix = UnixTimestamp.ToUnixSeconds(from);
        long toUnix = UnixTimestamp.ToUnixSeconds(to);

        return await _context.CheckResultsRaw
            .Where(c => c.EndpointId == endpointId && c.Ts >= fromUnix && c.Ts <= toUnix)
            .AsNoTracking()
            .OrderBy(c => c.Ts)
            .Select(c => new RawCheckDto
            {
                Ts = UnixTimestamp.FromUnixSeconds(c.Ts),
                Status = c.Status == UpDown.up ? "up" : "down",
                RttMs = c.RttMs,
                Error = c.Error
            })
            .ToListAsync();
    }

    private async Task<List<RollupBucketDto>> GetRollup15mDataAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        long fromUnix = UnixTimestamp.ToUnixSeconds(from);
        long toUnix = UnixTimestamp.ToUnixSeconds(to);

        return await _context.Rollups15m
            .Where(r => r.EndpointId == endpointId && r.BucketTs >= fromUnix && r.BucketTs <= toUnix)
            .AsNoTracking()
            .OrderBy(r => r.BucketTs)
            .Select(r => new RollupBucketDto
            {
                BucketTs = UnixTimestamp.FromUnixSeconds(r.BucketTs),
                UpPct = r.UpPct,
                AvgRttMs = r.AvgRttMs,
                DownEvents = r.DownEvents
            })
            .ToListAsync();
    }

    private async Task<List<DailyBucketDto>> GetRollupDailyDataAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        // Convert DateTimeOffset to Unix timestamp at midnight for filtering
        long fromUnix = UnixTimestamp.ToUnixDate(DateOnly.FromDateTime(from.Date));
        long toUnix = UnixTimestamp.ToUnixDate(DateOnly.FromDateTime(to.Date));

        return await _context.RollupsDaily
            .Where(r => r.EndpointId == endpointId && r.BucketDate >= fromUnix && r.BucketDate <= toUnix)
            .AsNoTracking()
            .OrderBy(r => r.BucketDate)
            .Select(r => new DailyBucketDto
            {
                BucketDate = UnixTimestamp.FromUnixDate(r.BucketDate),
                UpPct = r.UpPct,
                AvgRttMs = r.AvgRttMs,
                DownEvents = r.DownEvents
            })
            .ToListAsync();
    }

    private async Task<List<OutageDto>> GetOutagesAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        long fromUnix = UnixTimestamp.ToUnixSeconds(from);
        long toUnix = UnixTimestamp.ToUnixSeconds(to);

        return await _context.Outages
            .Where(o => o.EndpointId == endpointId && o.StartedTs <= toUnix && (o.EndedTs == null || o.EndedTs >= fromUnix))
            .AsNoTracking()
            .OrderBy(o => o.StartedTs)
            .Select(o => new OutageDto
            {
                StartedTs = UnixTimestamp.FromUnixSeconds(o.StartedTs),
                EndedTs = o.EndedTs.HasValue ? UnixTimestamp.FromUnixSeconds(o.EndedTs.Value) : null,
                DurationS = o.DurationSeconds,
                LastError = o.LastError
            })
            .ToListAsync();
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
}
