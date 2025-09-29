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

        var recent = rawChecks
             .Where(c => ConvertToDateTimeOffset(c.Ts) >= windowStart)
             .OrderByDescending(c => ConvertToDateTimeOffset(c.Ts))
             .Select(c => new CheckResultStructuredDto
             {
                 Ts = ConvertToDateTimeOffset(c.Ts),
                 Classification = (int)(c.Classification ?? OutageClassification.Unknown),
                 Primary = new ProbeResultDto
                 {
                     Type = endpoint.Type.ToString().ToLower(),
                     Target = endpoint.Type == ProbeType.http
                         ? $"{endpoint.Host}{endpoint.HttpPath ?? ""}"
                         : endpoint.Type == ProbeType.tcp
                             ? $"{endpoint.Host}:{endpoint.Port ?? 80}"
                             : endpoint.Host, // For ICMP
                     Status = c.Status.ToString().ToLower(),
                     RttMs = c.RttMs,
                     Error = c.Error
                 },
                 Fallback = new FallbackResultDto
                 {
                     Attempted = c.FallbackAttempted ?? false,
                     Type = c.FallbackAttempted == true ? "icmp" : null,
                     Target = c.FallbackAttempted == true ? endpoint.Host : null,
                     Status = c.FallbackStatus?.ToString().ToLower(),
                     RttMs = c.FallbackRttMs,
                     Error = c.FallbackError
                 }
             })
             .ToList();

        // 🔹 ENHANCED: Proper current state calculation with flapping detection
        var currentState = await BuildCurrentStateAsync(recent, endpoint.Id, endpoint.IntervalSeconds);

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
                LastError = o.LastError,
                Classification = o.Classification
            })
            .ToList();

        // --- Map endpoint DTO ---
        var endpointDto = MapToEndpointDto(endpoint);

        return new EndpointDetailDto
        {
            Endpoint = endpointDto,
            CurrentState = currentState,
            Recent = recent,
            Outages = outages
        };
    }

    // 🔹 NEW: Enhanced current state builder with flapping detection
    private async Task<CurrentStateDto> BuildCurrentStateAsync(
        List<CheckResultStructuredDto> recent, 
        Guid endpointId, 
        int intervalSeconds)
    {
        var lastCheck = recent.FirstOrDefault();
        
        // Handle no data case
        if (lastCheck == null)
        {
            return new CurrentStateDto
            {
                EffectiveStatus = "down",
                EffectiveRtt = null,
                Classification = (int)OutageClassification.Unknown,
                HostReachable = false,
                LastCheck = DateTimeOffset.UtcNow
            };
        }

        // Check if data is stale (older than 2x interval)
        var expectedInterval = TimeSpan.FromSeconds(intervalSeconds * 2);
        bool isStale = DateTimeOffset.UtcNow - lastCheck.Ts > expectedInterval;
        
        if (isStale)
        {
            return new CurrentStateDto
            {
                EffectiveStatus = "down",
                EffectiveRtt = null,
                Classification = (int)OutageClassification.Unknown,
                HostReachable = false,
                LastCheck = lastCheck.Ts
            };
        }

        // 🔹 PRIORITY 1: Check for flapping using recent data
        bool isFlapping = await IsFlappingAsync(endpointId, recent);
        
        if (isFlapping)
        {
            var (effectiveStatus, effectiveRtt) = DetermineEffectiveStatusAndRtt(lastCheck);
            
            return new CurrentStateDto
            {
                EffectiveStatus = "flapping",
                EffectiveRtt = effectiveRtt,
                Classification = (int)OutageClassification.Intermittent,
                HostReachable = lastCheck.Primary.Status == "up" || 
                               (lastCheck.Fallback.Attempted && lastCheck.Fallback.Status == "up"),
                LastCheck = lastCheck.Ts
            };
        }

        // 🔹 PRIORITY 2: Normal status logic
        var (status, rtt) = DetermineEffectiveStatusAndRtt(lastCheck);
        
        return new CurrentStateDto
        {
            EffectiveStatus = status,
            EffectiveRtt = rtt,
            Classification = lastCheck.Classification,
            HostReachable = lastCheck.Primary.Status == "up" || 
                           (lastCheck.Fallback.Attempted && lastCheck.Fallback.Status == "up"),
            LastCheck = lastCheck.Ts
        };
    }

    // 🔹 NEW: Proper effective status determination
    private (string status, double? rtt) DetermineEffectiveStatusAndRtt(CheckResultStructuredDto check)
    {
        // If primary DOWN but fallback UP → show as UP (service issue, host reachable)
        if (check.Primary.Status == "down" && 
            check.Fallback.Attempted && 
            check.Fallback.Status == "up")
        {
            return ("up", check.Fallback.RttMs);
        }
        
        // Otherwise use primary status and RTT
        return (check.Primary.Status, check.Primary.RttMs);
    }

    // 🔹 NEW: Flapping detection using structured data
    private async Task<bool> IsFlappingAsync(Guid endpointId, List<CheckResultStructuredDto> recent)
    {
        // Use recent data if we have enough, otherwise query database
        var checksForFlapping = recent.Count >= 10 
            ? recent.Take(10).ToList()
            : await GetRecentChecksForFlappingAsync(endpointId);

        if (checksForFlapping.Count < 4)
        {
            return false;
        }

        // Apply effective status logic to each check
        var effectiveStatuses = checksForFlapping
            .OrderBy(c => c.Ts)
            .Select(c => {
                var (effectiveStatus, _) = DetermineEffectiveStatusAndRtt(c);
                return effectiveStatus;
            })
            .ToList();

        // Count state changes in effective status
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

    // 🔹 NEW: Helper to get recent checks for flapping detection
    private async Task<List<CheckResultStructuredDto>> GetRecentChecksForFlappingAsync(Guid endpointId)
    {
        var cutoffTime = DateTimeOffset.UtcNow.AddMinutes(-5);
        var checks = await _context.CheckResultsRaw
            .Where(c => c.EndpointId == endpointId && ConvertToDateTimeOffset(c.Ts) >= cutoffTime)
            .OrderByDescending(c => c.Ts)
            .Take(10)
            .ToListAsync();

        // Convert to structured format for consistency
        return checks.Select(c => new CheckResultStructuredDto
        {
            Ts = ConvertToDateTimeOffset(c.Ts),
            Classification = (int)(c.Classification ?? OutageClassification.Unknown),
            Primary = new ProbeResultDto 
            { 
                Status = c.Status.ToString().ToLower(),
                RttMs = c.RttMs,
                Error = c.Error
            },
            Fallback = new FallbackResultDto 
            { 
                Attempted = c.FallbackAttempted ?? false,
                Status = c.FallbackStatus?.ToString().ToLower(),
                RttMs = c.FallbackRttMs,
                Error = c.FallbackError
            }
        }).ToList();
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
