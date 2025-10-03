using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;

namespace ThingConnect.Pulse.Server.Services.Rollup;

/// <summary>
/// Service for computing data rollups from raw check results.
/// </summary>
public sealed class RollupService : IRollupService
{
    private readonly PulseDbContext _context;
    private readonly ISettingsService _settingsService;
    private readonly ILogger<RollupService> _logger;

    public RollupService(PulseDbContext context, ISettingsService settingsService, ILogger<RollupService> logger)
    {
        _context = context;
        _settingsService = settingsService;
        _logger = logger;
    }

    public async Task ProcessRollup15mAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting 15-minute rollup processing");

        try
        {
            DateTimeOffset? lastWatermark = await _settingsService.GetLastRollup15mTimestampAsync();
            long fromTs = lastWatermark.HasValue 
                ? UnixTimestamp.ToUnixSeconds(lastWatermark.Value) 
                : UnixTimestamp.Subtract(UnixTimestamp.Now(), TimeSpan.FromDays(7));
            long toTs = UnixTimestamp.Now();

            List<CheckResultRaw> allChecks = await _context.CheckResultsRaw.ToListAsync(cancellationToken);
            var rawChecks = allChecks
                .Where(c => c.Ts > fromTs && c.Ts <= toTs)
                .OrderBy(c => c.EndpointId)
                .ThenBy(c => c.Ts)
                .Select(c => new WrappedCheck(c))
                .ToList();

            if (!rawChecks.Any()) return;

            var endpointGroups = rawChecks.GroupBy(c => c.EndpointId);
            List<Data.Rollup15m> rollupsToUpsert = new();

            foreach (var endpointGroup in endpointGroups)
            {
                var checks = endpointGroup.OrderBy(c => c.Ts).ToList();
                rollupsToUpsert.AddRange(CalculateRollups15m(endpointGroup.Key, checks));
            }

            await UpsertRollups15mAsync(rollupsToUpsert, cancellationToken);
            await _settingsService.SetLastRollup15mTimestampAsync(UnixTimestamp.FromUnixSeconds(toTs));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing 15-minute rollups");
            throw;
        }
    }

    public async Task ProcessRollupDailyAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting daily rollup processing");

        try
        {
            DateOnly? lastWatermark = await _settingsService.GetLastRollupDailyDateAsync();
            DateOnly fromDate = lastWatermark?.AddDays(1) ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
            DateOnly toDate = DateOnly.FromDateTime(DateTime.UtcNow.Date);

            if (fromDate >= toDate) return;

            long fromTs = UnixTimestamp.ToUnixDate(fromDate);
            long toTs = UnixTimestamp.ToUnixDate(toDate);

            List<CheckResultRaw> allChecks = await _context.CheckResultsRaw.ToListAsync(cancellationToken);
            var rawChecks = allChecks
                .Where(c => c.Ts >= fromTs && c.Ts < toTs)
                .OrderBy(c => c.EndpointId)
                .ThenBy(c => c.Ts)
                .Select(c => new WrappedCheck(c))
                .ToList();

            if (!rawChecks.Any()) return;

            var endpointGroups = rawChecks.GroupBy(c => c.EndpointId);
            List<Data.RollupDaily> rollupsToUpsert = new();

            foreach (var endpointGroup in endpointGroups)
            {
                var checks = endpointGroup.OrderBy(c => c.Ts).ToList();
                rollupsToUpsert.AddRange(CalculateRollupsDaily(endpointGroup.Key, checks, fromDate, toDate));
            }

            await UpsertRollupsDailyAsync(rollupsToUpsert, cancellationToken);
            await _settingsService.SetLastRollupDailyDateAsync(toDate.AddDays(-1));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing daily rollups");
            throw;
        }
    }

    // --- Private rollup calculation helpers ---
    private List<Data.Rollup15m> CalculateRollups15m(Guid endpointId, List<WrappedCheck> checks)
    {
        var rollups = new List<Data.Rollup15m>();

        var bucketGroups = checks
            .GroupBy(c => GetBucketTimestamp15m(c.Ts));

        foreach (var bucketGroup in bucketGroups)
        {
            var bucketChecks = bucketGroup.OrderBy(c => c.Ts).ToList();
            if (!bucketChecks.Any()) continue;

            int totalChecks = bucketChecks.Count;
            int upChecks = bucketChecks.Count(c => c.GetEffectiveStatus() == UpDown.up);
            double upPct = totalChecks > 0 ? (double)upChecks / totalChecks * 100.0 : 0.0;

            var rttValues = bucketChecks
                .Select(c => c.GetEffectiveRtt())
                .Where(rtt => rtt.HasValue && rtt > 0)
                .Select(rtt => rtt!.Value)
                .ToList();
            double? avgRttMs = rttValues.Any() ? rttValues.Average() : null;

            int downEvents = 0;
            for (int i = 1; i < bucketChecks.Count; i++)
            {
                if (bucketChecks[i - 1].GetEffectiveStatus() == UpDown.up &&
                    bucketChecks[i].GetEffectiveStatus() == UpDown.down)
                {
                    downEvents++;
                }
            }

            rollups.Add(new Data.Rollup15m
            {
                EndpointId = endpointId,
                BucketTs = GetBucketTimestamp15m(bucketChecks.First().Ts),
                UpPct = upPct,
                AvgRttMs = avgRttMs,
                DownEvents = downEvents
            });
        }

        return rollups;
    }

    private List<Data.RollupDaily> CalculateRollupsDaily(Guid endpointId, List<WrappedCheck> checks, DateOnly fromDate, DateOnly toDate)
    {
        var rollups = new List<Data.RollupDaily>();

        var dateGroups = checks
            .GroupBy(c => DateOnly.FromDateTime(UnixTimestamp.FromUnixSeconds(c.Ts).Date))
            .Where(g => g.Key >= fromDate && g.Key < toDate);

        foreach (var dateGroup in dateGroups)
        {
            var dayChecks = dateGroup.OrderBy(c => c.Ts).ToList();
            if (!dayChecks.Any()) continue;

            int totalChecks = dayChecks.Count;
            int upChecks = dayChecks.Count(c => c.GetEffectiveStatus() == UpDown.up);
            double upPct = totalChecks > 0 ? (double)upChecks / totalChecks * 100.0 : 0.0;

            var rttValues = dayChecks
                .Select(c => c.GetEffectiveRtt())
                .Where(rtt => rtt.HasValue && rtt > 0)
                .Select(rtt => rtt!.Value)
                .ToList();
            double? avgRttMs = rttValues.Any() ? rttValues.Average() : null;

            int downEvents = 0;
            for (int i = 1; i < dayChecks.Count; i++)
            {
                if (dayChecks[i - 1].GetEffectiveStatus() == UpDown.up &&
                    dayChecks[i].GetEffectiveStatus() == UpDown.down)
                {
                    downEvents++;
                }
            }

            rollups.Add(new Data.RollupDaily
            {
                EndpointId = endpointId,
                BucketDate = UnixTimestamp.ToUnixDate(dateGroup.Key),
                UpPct = upPct,
                AvgRttMs = avgRttMs,
                DownEvents = downEvents
            });
        }

        return rollups;
    }

    private static long GetBucketTimestamp15m(long unixTs)
    {
        DateTimeOffset ts = UnixTimestamp.FromUnixSeconds(unixTs);
        int bucketMinute = (ts.Minute / 15) * 15;
        return UnixTimestamp.ToUnixSeconds(new DateTimeOffset(ts.Year, ts.Month, ts.Day, ts.Hour, bucketMinute, 0, ts.Offset));
    }

    private async Task UpsertRollups15mAsync(List<Data.Rollup15m> rollups, CancellationToken cancellationToken)
    {
        if (!rollups.Any()) return;

        foreach (var rollup in rollups)
        {
            var existing = await _context.Rollups15m
                .FirstOrDefaultAsync(r => r.EndpointId == rollup.EndpointId && r.BucketTs == rollup.BucketTs, cancellationToken);

            if (existing != null)
            {
                existing.UpPct = rollup.UpPct;
                existing.AvgRttMs = rollup.AvgRttMs;
                existing.DownEvents = rollup.DownEvents;
            }
            else
            {
                _context.Rollups15m.Add(rollup);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task UpsertRollupsDailyAsync(List<Data.RollupDaily> rollups, CancellationToken cancellationToken)
    {
        if (!rollups.Any()) return;

        foreach (var rollup in rollups)
        {
            var existing = await _context.RollupsDaily
                .FirstOrDefaultAsync(r => r.EndpointId == rollup.EndpointId && r.BucketDate == rollup.BucketDate, cancellationToken);

            if (existing != null)
            {
                existing.UpPct = rollup.UpPct;
                existing.AvgRttMs = rollup.AvgRttMs;
                existing.DownEvents = rollup.DownEvents;
            }
            else
            {
                _context.RollupsDaily.Add(rollup);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    // --- Private wrapper class for effective status & RTT ---
    private class WrappedCheck
    {
        private readonly CheckResultRaw _check;

        public WrappedCheck(CheckResultRaw check)
        {
            _check = check;
            Ts = check.Ts;
            EndpointId = check.EndpointId;
        }

        public long Ts { get; }
        public Guid EndpointId { get; }

        public UpDown GetEffectiveStatus()
        {
            if (_check.Status == UpDown.down && _check.FallbackAttempted == true && _check.FallbackStatus == UpDown.up)
            {
                return UpDown.up;
            }
            return _check.Status;
        }

        public double? GetEffectiveRtt()
        {
            if (_check.Status == UpDown.up && _check.RttMs.HasValue) return _check.RttMs;
            if (_check.Status == UpDown.down && _check.FallbackAttempted == true && _check.FallbackStatus == UpDown.up && _check.FallbackRttMs.HasValue)
                return _check.FallbackRttMs;
            return null;
        }
    }
}
