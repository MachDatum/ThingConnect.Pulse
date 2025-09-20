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
        var windowStartUnix = windowStart.ToUnixTimeSeconds();

        // --- Fetch recent raw checks ---
        var rawChecks = await _context.CheckResultsRaw
            .Where(c => c.EndpointId == id && c.Ts >= windowStartUnix)
            .OrderByDescending(c => c.Ts)
            .Take(RecentFetchLimit)
            .ToListAsync();

        var recent = rawChecks
            .Select(c => new RawCheckDto
            {
                Ts = ConvertToDateTimeOffset(c.Ts),
                Status = c.Status.ToString().ToLower(),
                RttMs = c.RttMs,
                Error = c.Error
            })
            .ToList();
        // --- Fetch outages within window ---
        var outages = await _context.Outages
            .Where(o => o.EndpointId == id &&
                        o.StartedTs <= DateTimeOffset.UtcNow.ToUnixTimeSeconds() &&
                        (o.EndedTs == null || o.EndedTs >= windowStartUnix))
            .OrderByDescending(o => o.StartedTs)
            .Select(o => new OutageDto
            {
                StartedTs = ConvertToDateTimeOffset(o.StartedTs),
                EndedTs = o.EndedTs != null ? ConvertToDateTimeOffset(o.EndedTs) : null,
                DurationS = NormalizeDurationToInt(o.DurationSeconds),
                LastError = o.LastError
            })
            .ToListAsync();

        // --- Map endpoint DTO ---
        var endpointDto = MapToEndpointDto(endpoint);

        return new EndpointDetailDto
        {
            Endpoint = endpointDto,
            Recent = recent,
            Outages = outages
        };
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
