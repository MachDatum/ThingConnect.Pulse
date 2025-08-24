using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Services.Rollup;

/// <summary>
/// Service for computing data rollups from raw check results
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
            // Get last watermark
            DateTimeOffset? lastWatermark = await _settingsService.GetLastRollup15mTimestampAsync();
            DateTimeOffset fromTs = lastWatermark ?? DateTimeOffset.UtcNow.AddDays(-7); // Default: 7 days back
            DateTimeOffset toTs = DateTimeOffset.UtcNow;

            _logger.LogDebug("Processing 15m rollups from {FromTs} to {ToTs}", fromTs, toTs);

            // Get all raw checks in the time window
            // SQLite has issues with DateTimeOffset comparisons in LINQ, so fetch all and filter in memory
            List<CheckResultRaw> allChecks = await _context.CheckResultsRaw.ToListAsync(cancellationToken);
            List<CheckResultRaw> rawChecks = allChecks
                .Where(c => c.Ts > fromTs && c.Ts <= toTs)
                .OrderBy(c => c.EndpointId)
                .ThenBy(c => c.Ts)
                .ToList();

            if (!rawChecks.Any())
            {
                _logger.LogDebug("No raw checks found for rollup processing");
                return;
            }

            _logger.LogInformation("Processing {Count} raw checks", rawChecks.Count);

            // Group by endpoint and calculate rollups
            var endpointGroups = rawChecks.GroupBy(c => c.EndpointId);
            List<Data.Rollup15m> rollupsToUpsert = new();

            foreach (var endpointGroup in endpointGroups)
            {
                var checks = endpointGroup.OrderBy(c => c.Ts).ToList();
                var endpointRollups = CalculateRollups15m(endpointGroup.Key, checks);
                rollupsToUpsert.AddRange(endpointRollups);
            }

            // Upsert rollups in batches
            await UpsertRollups15mAsync(rollupsToUpsert, cancellationToken);

            // Update watermark
            await _settingsService.SetLastRollup15mTimestampAsync(toTs);

            _logger.LogInformation("Completed 15m rollup processing. Generated {Count} rollup records", rollupsToUpsert.Count);
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
            // Get last watermark
            DateOnly? lastWatermark = await _settingsService.GetLastRollupDailyDateAsync();
            DateOnly fromDate = lastWatermark?.AddDays(1) ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7));
            DateOnly toDate = DateOnly.FromDateTime(DateTime.UtcNow.Date);

            if (fromDate >= toDate)
            {
                _logger.LogDebug("No new days to process for daily rollup");
                return;
            }

            _logger.LogDebug("Processing daily rollups from {FromDate} to {ToDate}", fromDate, toDate);

            // Get all raw checks in the date range
            var fromTs = fromDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            var toTs = toDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

            // SQLite has issues with DateTimeOffset comparisons in LINQ, so fetch all and filter in memory
            List<CheckResultRaw> allChecks = await _context.CheckResultsRaw.ToListAsync(cancellationToken);
            List<CheckResultRaw> rawChecks = allChecks
                .Where(c => c.Ts >= fromTs && c.Ts < toTs)
                .OrderBy(c => c.EndpointId)
                .ThenBy(c => c.Ts)
                .ToList();

            if (!rawChecks.Any())
            {
                _logger.LogDebug("No raw checks found for daily rollup processing");
                return;
            }

            _logger.LogInformation("Processing {Count} raw checks for daily rollup", rawChecks.Count);

            // Group by endpoint and calculate rollups
            var endpointGroups = rawChecks.GroupBy(c => c.EndpointId);
            List<Data.RollupDaily> rollupsToUpsert = new();

            foreach (var endpointGroup in endpointGroups)
            {
                var checks = endpointGroup.OrderBy(c => c.Ts).ToList();
                var endpointRollups = CalculateRollupsDaily(endpointGroup.Key, checks, fromDate, toDate);
                rollupsToUpsert.AddRange(endpointRollups);
            }

            // Upsert rollups in batches
            await UpsertRollupsDailyAsync(rollupsToUpsert, cancellationToken);

            // Update watermark
            await _settingsService.SetLastRollupDailyDateAsync(toDate.AddDays(-1));

            _logger.LogInformation("Completed daily rollup processing. Generated {Count} rollup records", rollupsToUpsert.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing daily rollups");
            throw;
        }
    }

    private List<Data.Rollup15m> CalculateRollups15m(Guid endpointId, List<CheckResultRaw> checks)
    {
        var rollups = new List<Data.Rollup15m>();

        // Group by 15-minute bucket
        var bucketGroups = checks
            .Select(c => new
            {
                Check = c,
                Bucket = GetBucketTimestamp15m(c.Ts)
            })
            .GroupBy(x => x.Bucket);

        foreach (var bucketGroup in bucketGroups)
        {
            var bucketChecks = bucketGroup.Select(x => x.Check).OrderBy(c => c.Ts).ToList();
            
            if (!bucketChecks.Any()) 
            {
                continue;
            }

            // Calculate metrics
            int totalChecks = bucketChecks.Count;
            int upChecks = bucketChecks.Count(c => c.Status == UpDown.up);
            double upPct = totalChecks > 0 ? (double)upChecks / totalChecks * 100.0 : 0.0;
            
            var rttValues = bucketChecks
                .Where(c => c.RttMs.HasValue && c.RttMs > 0)
                .Select(c => c.RttMs!.Value)
                .ToList();
            double? avgRttMs = rttValues.Any() ? rttValues.Average() : null;

            // Count down events (up→down transitions)
            int downEvents = 0;
            for (int i = 1; i < bucketChecks.Count; i++)
            {
                if (bucketChecks[i - 1].Status == UpDown.up && bucketChecks[i].Status == UpDown.down)
                {
                    downEvents++;
                }
            }

            rollups.Add(new Data.Rollup15m
            {
                EndpointId = endpointId,
                BucketTs = bucketGroup.Key,
                UpPct = upPct,
                AvgRttMs = avgRttMs,
                DownEvents = downEvents
            });
        }

        return rollups;
    }

    private List<Data.RollupDaily> CalculateRollupsDaily(Guid endpointId, List<CheckResultRaw> checks, DateOnly fromDate, DateOnly toDate)
    {
        var rollups = new List<Data.RollupDaily>();

        // Group by date
        var dateGroups = checks
            .Select(c => new
            {
                Check = c,
                Date = DateOnly.FromDateTime(c.Ts.Date)
            })
            .Where(x => x.Date >= fromDate && x.Date < toDate)
            .GroupBy(x => x.Date);

        foreach (var dateGroup in dateGroups)
        {
            var dayChecks = dateGroup.Select(x => x.Check).OrderBy(c => c.Ts).ToList();
            
            if (!dayChecks.Any()) 
            {
                continue;
            }

            // Calculate metrics
            int totalChecks = dayChecks.Count;
            int upChecks = dayChecks.Count(c => c.Status == UpDown.up);
            double upPct = totalChecks > 0 ? (double)upChecks / totalChecks * 100.0 : 0.0;
            
            var rttValues = dayChecks
                .Where(c => c.RttMs.HasValue && c.RttMs > 0)
                .Select(c => c.RttMs!.Value)
                .ToList();
            double? avgRttMs = rttValues.Any() ? rttValues.Average() : null;

            // Count down events (up→down transitions)
            int downEvents = 0;
            for (int i = 1; i < dayChecks.Count; i++)
            {
                if (dayChecks[i - 1].Status == UpDown.up && dayChecks[i].Status == UpDown.down)
                {
                    downEvents++;
                }
            }

            rollups.Add(new Data.RollupDaily
            {
                EndpointId = endpointId,
                BucketDate = dateGroup.Key,
                UpPct = upPct,
                AvgRttMs = avgRttMs,
                DownEvents = downEvents
            });
        }

        return rollups;
    }

    private static DateTimeOffset GetBucketTimestamp15m(DateTimeOffset ts)
    {
        // Round down to nearest 15-minute boundary
        int minute = ts.Minute;
        int bucketMinute = (minute / 15) * 15;
        
        return new DateTimeOffset(ts.Year, ts.Month, ts.Day, ts.Hour, bucketMinute, 0, ts.Offset);
    }

    private async Task UpsertRollups15mAsync(List<Data.Rollup15m> rollups, CancellationToken cancellationToken)
    {
        if (!rollups.Any()) 
        {
            return;
        }

        // SQLite doesn't support MERGE/UPSERT in EF Core, so we'll do it manually
        foreach (Data.Rollup15m rollup in rollups)
        {
            var existing = await _context.Rollups15m
                .FirstOrDefaultAsync(r => r.EndpointId == rollup.EndpointId && r.BucketTs == rollup.BucketTs, cancellationToken);

            if (existing != null)
            {
                // Update existing
                existing.UpPct = rollup.UpPct;
                existing.AvgRttMs = rollup.AvgRttMs;
                existing.DownEvents = rollup.DownEvents;
            }
            else
            {
                // Add new
                _context.Rollups15m.Add(rollup);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogDebug("Upserted {Count} 15m rollup records", rollups.Count);
    }

    private async Task UpsertRollupsDailyAsync(List<Data.RollupDaily> rollups, CancellationToken cancellationToken)
    {
        if (!rollups.Any()) 
        {
            return;
        }

        // SQLite doesn't support MERGE/UPSERT in EF Core, so we'll do it manually
        foreach (Data.RollupDaily rollup in rollups)
        {
            var existing = await _context.RollupsDaily
                .FirstOrDefaultAsync(r => r.EndpointId == rollup.EndpointId && r.BucketDate == rollup.BucketDate, cancellationToken);

            if (existing != null)
            {
                // Update existing
                existing.UpPct = rollup.UpPct;
                existing.AvgRttMs = rollup.AvgRttMs;
                existing.DownEvents = rollup.DownEvents;
            }
            else
            {
                // Add new
                _context.RollupsDaily.Add(rollup);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        _logger.LogDebug("Upserted {Count} daily rollup records", rollups.Count);
    }
}