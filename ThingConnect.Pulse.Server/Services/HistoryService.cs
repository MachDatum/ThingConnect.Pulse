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
            Endpoint = CheckResult.MapToEndpointDto(endpoint)
        };

        // Fetch data based on bucket type
        switch (bucket.ToLower())
        {
            case "raw":
                response.Raw = await GetRawDataAsync(endpoint, from, to);
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

        // Always include outages
        response.Outages = await GetOutagesAsync(endpointId, from, to);

        return response;
    }

    private async Task<List<RawCheckDto>> GetRawDataAsync(Data.Endpoint endpoint, DateTimeOffset from, DateTimeOffset to)
    {
        long fromUnix = UnixTimestamp.ToUnixSeconds(from);
        long toUnix = UnixTimestamp.ToUnixSeconds(to);

        var rawData = await _context.CheckResultsRaw
            .Where(c => c.EndpointId == endpoint.Id && c.Ts >= fromUnix && c.Ts <= toUnix)
            .OrderBy(c => c.Ts)
            .ToListAsync();

        // Convert DB rows -> CheckResult -> RawCheckDto
        var checks = rawData
            .Select(c => new CheckResult
            {
                EndpointId = c.EndpointId,
                Timestamp = UnixTimestamp.FromUnixSeconds(c.Ts),
                Status = c.Status,
                RttMs = c.RttMs,
                Error = c.Error,
                FallbackAttempted = (bool)c.FallbackAttempted,
                FallbackStatus = c.FallbackStatus,
                FallbackRttMs = c.FallbackRttMs,
                FallbackError = c.FallbackError,
                Classification = c.Classification
            })
            .ToList();

        return checks
            .Select(c => new RawCheckDto
            {
                Ts = c.Timestamp,
                Classification = c.DetermineClassification(),
                Primary = new PrimaryResultDto
                {
                    Type = endpoint.Type.ToString().ToLower(),
                    Target = endpoint.Host,
                    Status = c.Status.ToString().ToLower(),
                    RttMs = c.RttMs,
                    Error = c.Error
                },
                Fallback = new FallbackResultDto
                {
                    Attempted = c.FallbackAttempted,
                    Type = "icmp",
                    Target = endpoint.Host,
                    Status = c.FallbackStatus?.ToString().ToLower(),
                    RttMs = c.FallbackRttMs,
                    Error = c.FallbackError
                },
                CurrentState = new CurrentStateDto
                {
                    Type = c.FallbackAttempted && c.FallbackStatus != null 
                        ? "icmp"
                        : endpoint.Type.ToString().ToLower(),
                    Target = endpoint.Host,
                    Status = c.GetEffectiveStatus().ToString().ToLower(),
                    RttMs = c.GetEffectiveRtt(),
                    Classification = (int)c.DetermineClassification(),
                }
            })
            .ToList();
    }

    private async Task<List<RollupBucketDto>> GetRollup15mDataAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        long fromUnix = UnixTimestamp.ToUnixSeconds(from);
        long toUnix = UnixTimestamp.ToUnixSeconds(to);

        // SQLite limitation: fetch all data and filter in memory
        var rollupData = await _context.Rollups15m
            .Where(r => r.EndpointId == endpointId)
            .Select(r => new { r.BucketTs, r.UpPct, r.AvgRttMs, r.DownEvents })
            .ToListAsync();

        return rollupData
            .Where(r => r.BucketTs >= fromUnix && r.BucketTs <= toUnix)
            .OrderBy(r => r.BucketTs)
            .Select(r => new RollupBucketDto
            {
                BucketTs = UnixTimestamp.FromUnixSeconds(r.BucketTs),
                UpPct = r.UpPct,
                AvgRttMs = r.AvgRttMs,
                DownEvents = r.DownEvents
            })
            .ToList();
    }

    private async Task<List<DailyBucketDto>> GetRollupDailyDataAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        // Convert DateTimeOffset to Unix timestamp at midnight for filtering
        long fromUnix = UnixTimestamp.ToUnixDate(DateOnly.FromDateTime(from.Date));
        long toUnix = UnixTimestamp.ToUnixDate(DateOnly.FromDateTime(to.Date));

        // SQLite limitation: fetch all data and filter in memory
        var dailyData = await _context.RollupsDaily
            .Where(r => r.EndpointId == endpointId)
            .Select(r => new { r.BucketDate, r.UpPct, r.AvgRttMs, r.DownEvents })
            .ToListAsync();

        return dailyData
            .Where(r => r.BucketDate >= fromUnix && r.BucketDate <= toUnix)
            .OrderBy(r => r.BucketDate)
            .Select(r => new DailyBucketDto
            {
                BucketDate = UnixTimestamp.FromUnixDate(r.BucketDate),
                UpPct = r.UpPct,
                AvgRttMs = r.AvgRttMs,
                DownEvents = r.DownEvents
            })
            .ToList();
    }

    private async Task<List<OutageDto>> GetOutagesAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        long fromUnix = UnixTimestamp.ToUnixSeconds(from);
        long toUnix = UnixTimestamp.ToUnixSeconds(to);

        // SQLite limitation: fetch all data and filter in memory
        var outageData = await _context.Outages
            .Where(o => o.EndpointId == endpointId)
            .Select(o => new { o.StartedTs, o.EndedTs, o.DurationSeconds, o.LastError })
            .ToListAsync();

        return outageData
            .Where(o => o.StartedTs <= toUnix && (o.EndedTs == null || o.EndedTs >= fromUnix))
            .OrderBy(o => o.StartedTs)
            .Select(o => new OutageDto
            {
                StartedTs = UnixTimestamp.FromUnixSeconds(o.StartedTs),
                EndedTs = o.EndedTs.HasValue ? UnixTimestamp.FromUnixSeconds(o.EndedTs.Value) : null,
                DurationS = o.DurationSeconds,
                LastError = o.LastError
            })
            .ToList();
    }
}
