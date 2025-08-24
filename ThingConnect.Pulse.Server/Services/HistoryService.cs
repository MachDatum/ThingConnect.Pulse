using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
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
        var maxRange = bucket == "raw" ? TimeSpan.FromDays(90) : TimeSpan.FromDays(730);
        if (to - from > maxRange)
        {
            throw new ArgumentException($"Date range too large for bucket type '{bucket}'. Maximum: {maxRange.TotalDays} days");
        }

        // Get the endpoint
        var endpoint = await _context.Endpoints
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
        // SQLite limitation: fetch all data and filter in memory
        var rawData = await _context.CheckResultsRaw
            .Where(c => c.EndpointId == endpointId)
            .Select(c => new { c.Ts, c.Status, c.RttMs, c.Error })
            .ToListAsync();

        return rawData
            .Where(c => c.Ts >= from && c.Ts <= to)
            .OrderBy(c => c.Ts)
            .Select(c => new RawCheckDto
            {
                Ts = c.Ts,
                Status = c.Status == UpDown.up ? "up" : "down",
                RttMs = c.RttMs,
                Error = c.Error
            })
            .ToList();
    }

    private async Task<List<RollupBucketDto>> GetRollup15mDataAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        // SQLite limitation: fetch all data and filter in memory
        var rollupData = await _context.Rollups15m
            .Where(r => r.EndpointId == endpointId)
            .Select(r => new { r.BucketTs, r.UpPct, r.AvgRttMs, r.DownEvents })
            .ToListAsync();

        return rollupData
            .Where(r => r.BucketTs >= from && r.BucketTs <= to)
            .OrderBy(r => r.BucketTs)
            .Select(r => new RollupBucketDto
            {
                BucketTs = r.BucketTs,
                UpPct = r.UpPct,
                AvgRttMs = r.AvgRttMs,
                DownEvents = r.DownEvents
            })
            .ToList();
    }

    private async Task<List<DailyBucketDto>> GetRollupDailyDataAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        // Convert DateTimeOffset to DateOnly for filtering
        var fromDate = DateOnly.FromDateTime(from.Date);
        var toDate = DateOnly.FromDateTime(to.Date);

        // SQLite limitation: fetch all data and filter in memory
        var dailyData = await _context.RollupsDaily
            .Where(r => r.EndpointId == endpointId)
            .Select(r => new { r.BucketDate, r.UpPct, r.AvgRttMs, r.DownEvents })
            .ToListAsync();

        return dailyData
            .Where(r => r.BucketDate >= fromDate && r.BucketDate <= toDate)
            .OrderBy(r => r.BucketDate)
            .Select(r => new DailyBucketDto
            {
                BucketDate = r.BucketDate,
                UpPct = r.UpPct,
                AvgRttMs = r.AvgRttMs,
                DownEvents = r.DownEvents
            })
            .ToList();
    }

    private async Task<List<OutageDto>> GetOutagesAsync(Guid endpointId, DateTimeOffset from, DateTimeOffset to)
    {
        // SQLite limitation: fetch all data and filter in memory
        var outageData = await _context.Outages
            .Where(o => o.EndpointId == endpointId)
            .Select(o => new { o.StartedTs, o.EndedTs, o.DurationSeconds, o.LastError })
            .ToListAsync();

        return outageData
            .Where(o => o.StartedTs <= to && (o.EndedTs == null || o.EndedTs >= from))
            .OrderBy(o => o.StartedTs)
            .Select(o => new OutageDto
            {
                StartedTs = o.StartedTs,
                EndedTs = o.EndedTs,
                DurationS = o.DurationSeconds,
                LastError = o.LastError
            })
            .ToList();
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