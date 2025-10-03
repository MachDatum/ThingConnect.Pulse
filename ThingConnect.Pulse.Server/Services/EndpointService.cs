using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services;

public interface IEndpointService
{
    Task<EndpointDetailDto?> GetEndpointDetailAsync(Guid id, int windowMinutes = 60);
}

public sealed class EndpointService : IEndpointService
{
    private readonly PulseDbContext _context;
    private const int RecentFetchLimit = 2000;

    public EndpointService(PulseDbContext context)
    {
        _context = context;
    }

    public async Task<EndpointDetailDto?> GetEndpointDetailAsync(Guid id, int windowMinutes = 60)
    {
        // Load endpoint with group
        var endpoint = await _context.Endpoints
            .Include(e => e.Group)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (endpoint == null) return null;

        var windowStart = DateTimeOffset.UtcNow.AddMinutes(-windowMinutes);

        // --- Fetch recent raw checks ---
        var rawChecks = await _context.CheckResultsRaw
            .Where(c => c.EndpointId == id)
            .OrderByDescending(c => c.Ts)
            .Take(RecentFetchLimit)
            .ToListAsync();

        // Map to CheckResult objects for easier processing
        var checks = rawChecks
            .Select(c => new CheckResult
            {
                EndpointId = c.EndpointId,
                Timestamp = ConvertToDateTimeOffset(c.Ts),
                Status = c.Status,
                RttMs = c.RttMs,
                Error = c.Error,
                FallbackAttempted = (bool)c.FallbackAttempted,
                FallbackStatus = c.FallbackStatus,
                FallbackRttMs = c.FallbackRttMs,
                FallbackError = c.FallbackError,
                Classification = c.Classification
            }).ToList();

        var recentForEndpoint = checks
            .Where(x => x.Timestamp >= windowStart)
            .OrderBy(x => x.Timestamp)
            .ToList();

        // --- Map RawCheckDto including EffectiveState ---
        var recent = checks
            .Where(c => c.Timestamp >= windowStart)
            .OrderByDescending(c => c.Timestamp)
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
                    Type = c.FallbackAttempted && c.FallbackStatus != null ? "icmp" : endpoint.Type.ToString().ToLower(),
                    Target = endpoint.Host,
                    Status = c.DetermineStatusType(recentForEndpoint, TimeSpan.FromSeconds(endpoint.IntervalSeconds * 2)).ToString().ToLower(),
                    RttMs = c.GetEffectiveRtt(),
                    Classification = (int)c.DetermineClassification(),
                }
            })
            .ToList();

        // --- Fetch outages within window ---
        var outageRaw = await _context.Outages
            .Where(o => o.EndpointId == id)
            .ToListAsync();

        var outages = outageRaw
            .Where(o =>
            {
                var started = ConvertToDateTimeOffset(o.StartedTs);
                var ended = o.EndedTs != null ? ConvertToDateTimeOffset(o.EndedTs) : (DateTimeOffset?)null;
                return started <= DateTimeOffset.UtcNow && (ended == null || ended >= windowStart);
            })
            .OrderByDescending(o => ConvertToDateTimeOffset(o.StartedTs))
            .Select(o => new OutageDto
            {
                StartedTs = ConvertToDateTimeOffset(o.StartedTs),
                EndedTs = o.EndedTs != null ? ConvertToDateTimeOffset(o.EndedTs) : null,
                DurationS = NormalizeDurationToInt(o.DurationSeconds),
                LastError = o.LastError
            })
            .ToList();

        // --- Map endpoint DTO ---
        var endpointDto = CheckResult.MapToEndpointDto(endpoint);

        return new EndpointDetailDto
        {
            Endpoint = endpointDto,
            Recent = recent,
            Outages = outages
        };
    }

    // --- Helper to convert timestamp to DateTimeOffset ---
    private static DateTimeOffset ConvertToDateTimeOffset<T>(T value)
    {
        if (value is DateTimeOffset dto) return dto;
        if (value is DateTime dt) return new DateTimeOffset(dt.Kind == DateTimeKind.Utc ? dt : dt.ToUniversalTime());
        if (value is long l) return DateTimeOffset.FromUnixTimeSeconds(l);
        if (value is int i) return DateTimeOffset.FromUnixTimeSeconds(i);

        var s = value?.ToString();
        if (!string.IsNullOrEmpty(s) && DateTimeOffset.TryParse(s, out var parsed)) return parsed;

        throw new InvalidOperationException($"Unsupported timestamp type: {value?.GetType().FullName ?? "null"}");
    }

    // --- Helper to normalize duration to int seconds ---
    private static int? NormalizeDurationToInt(object? value)
    {
        if (value == null) return null;

        return value switch
        {
            int i => i,
            long l => (int)l,
            TimeSpan t => (int)t.TotalSeconds,
            double d => (int)Math.Round(d),
            float f => (int)Math.Round(f),
            _ => int.TryParse(value.ToString(), out var v) ? v : null
        };
    }
}
