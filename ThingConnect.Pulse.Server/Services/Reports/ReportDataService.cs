using System.Globalization;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Reports;

/// <summary>
/// Builds the availability report: per endpoint and per local day/week/month/year (or hour), from the
/// 15-minute rollups (uptime, downtime, RTT, coverage) and the outage table (down events, MTTR, MTBF,
/// longest outage).
/// </summary>
/// <remarks>
/// Periods are cut on local-time boundaries in <see cref="AvailabilityReportRequest.TimeZone"/>. 15-minute
/// buckets never straddle a local period boundary because every real-world UTC offset is a multiple of
/// 15 minutes, so each bucket is attributed to exactly one period.
/// </remarks>
public sealed class ReportDataService : IReportDataService
{
    public const int BucketSeconds = 15 * 60;
    public const int MaxHourlyDays = 31;
    public const int MaxDailyDays = 366;
    public const int MaxRangeDays = 5 * 366;

    private readonly PulseDbContext _context;
    private readonly ILogger<ReportDataService> _logger;

    public ReportDataService(PulseDbContext context, ILogger<ReportDataService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Cuts [FromDate 00:00, ToDate+1 00:00) local time into periods. Weeks start on Monday; the first and
    /// last week/month/year are clipped to the requested range.
    /// </summary>
    public static List<ReportPeriod> BuildPeriods(DateOnly fromDate, DateOnly toDate, ReportInterval interval, TimeZoneInfo timeZone)
    {
        DateTime rangeStart = fromDate.ToDateTime(TimeOnly.MinValue);
        DateTime rangeEnd = toDate.AddDays(1).ToDateTime(TimeOnly.MinValue);
        var periods = new List<ReportPeriod>();

        DateTime cursor = rangeStart;
        while (cursor < rangeEnd)
        {
            DateTime next = interval switch
            {
                ReportInterval.Hour => cursor.AddHours(1),
                ReportInterval.Day => cursor.AddDays(1),
                ReportInterval.Week => cursor.AddDays(7 - (((int)cursor.DayOfWeek + 6) % 7)),
                ReportInterval.Month => new DateTime(cursor.Year, cursor.Month, 1).AddMonths(1),
                ReportInterval.Year => new DateTime(cursor.Year + 1, 1, 1),
                _ => throw new ArgumentOutOfRangeException(nameof(interval))
            };

            if (next > rangeEnd)
            {
                next = rangeEnd;
            }

            // Skip local hours that don't exist (DST spring-forward); they have no UTC instant.
            if (!(interval == ReportInterval.Hour && timeZone.IsInvalidTime(cursor)))
            {
                periods.Add(new ReportPeriod
                {
                    Label = FormatLabel(cursor, next, interval),
                    LocalStart = cursor,
                    StartUtc = ToUtc(cursor, timeZone),
                    EndUtc = ToUtc(next, timeZone)
                });
            }

            cursor = next;
        }

        return periods;
    }

    public async Task<AvailabilityReport> GetAvailabilityReportAsync(AvailabilityReportRequest request, CancellationToken cancellationToken = default)
    {
        ValidateRequest(request);

        List<ReportPeriod> periods = BuildPeriods(request.FromDate, request.ToDate, request.Interval, request.TimeZone);
        long rangeStartTs = periods[0].StartUtc.ToUnixTimeSeconds();
        long rangeEndTs = periods[^1].EndUtc.ToUnixTimeSeconds();
        long nowTs = request.Now.ToUnixTimeSeconds();
        long[] periodStarts = periods.Select(p => p.StartUtc.ToUnixTimeSeconds()).ToArray();

        List<Data.Endpoint> endpoints = await GetEndpointsAsync(request.GroupIds, cancellationToken);
        List<Guid> endpointIds = endpoints.Select(e => e.Id).ToList();

        var perPeriod = endpointIds.ToDictionary(id => id, _ => NewPeriodArray(periods, nowTs));
        var totals = endpointIds.ToDictionary(id => id, _ => new AvailabilityMetrics());

        if (endpointIds.Count > 0)
        {
            await AccumulateRollupsAsync(rangeStartTs, rangeEndTs, periodStarts, perPeriod, cancellationToken);
            await AccumulateOutagesAsync(endpointIds, rangeStartTs, rangeEndTs, nowTs, periodStarts, perPeriod, totals, cancellationToken);
        }

        var overall = new ReportMetricsRow { PerPeriod = NewPeriodArray(periods, 0).ToList() };
        var groups = new List<ReportGroupSection>();

        foreach (IGrouping<string, Data.Endpoint> group in endpoints.GroupBy(e => e.Group.Name))
        {
            var groupTotals = new ReportMetricsRow { PerPeriod = NewPeriodArray(periods, 0).ToList() };
            var rows = new List<ReportEndpointRow>();

            foreach (Data.Endpoint endpoint in group)
            {
                AvailabilityMetrics[] periodMetrics = perPeriod[endpoint.Id];
                AvailabilityMetrics total = totals[endpoint.Id];
                foreach (AvailabilityMetrics m in periodMetrics)
                {
                    total.MonitoredSeconds += m.MonitoredSeconds;
                    total.UpSeconds += m.UpSeconds;
                    total.ExpectedSeconds += m.ExpectedSeconds;
                    total.RttSum += m.RttSum;
                    total.RttSamples += m.RttSamples;
                }

                var row = new ReportEndpointRow
                {
                    EndpointId = endpoint.Id,
                    Name = endpoint.Name,
                    Host = endpoint.Host,
                    GroupName = group.Key,
                    CurrentStatus = endpoint.LastStatus switch
                    {
                        UpDown.up => "UP",
                        UpDown.down => "DOWN",
                        _ => "—"
                    },
                    PerPeriod = periodMetrics.ToList(),
                    Total = total
                };

                AddRow(groupTotals, row);
                rows.Add(row);
            }

            AddRow(overall, groupTotals);
            groups.Add(new ReportGroupSection { GroupName = group.Key, Totals = groupTotals, Endpoints = rows });
        }

        _logger.LogInformation(
            "Availability report built: {Interval} {From}..{To}, {Endpoints} endpoints, {Periods} periods",
            request.Interval, request.FromDate, request.ToDate, endpointIds.Count, periods.Count);

        return new AvailabilityReport
        {
            FromDate = request.FromDate,
            ToDate = request.ToDate,
            Interval = request.Interval,
            TimeZoneName = request.TimeZone.DisplayName,
            GeneratedAt = request.Now,
            Periods = periods,
            Groups = groups,
            Overall = overall
        };
    }

    private static string FormatLabel(DateTime start, DateTime end, ReportInterval interval)
    {
        DateTime last = end.AddDays(-1);
        return interval switch
        {
            ReportInterval.Hour => start.ToString("dd MMM yyyy HH:00", CultureInfo.InvariantCulture),
            ReportInterval.Day => start.ToString("dd MMM yyyy", CultureInfo.InvariantCulture),
            ReportInterval.Week => start.Year != last.Year
                ? string.Create(CultureInfo.InvariantCulture, $"{start:dd MMM yyyy} – {last:dd MMM yyyy}")
                : string.Create(CultureInfo.InvariantCulture, $"{start:dd MMM} – {last:dd MMM yyyy}"),
            ReportInterval.Month => start.Day == 1 && end == start.AddMonths(1)
                ? start.ToString("MMM yyyy", CultureInfo.InvariantCulture)
                : string.Create(CultureInfo.InvariantCulture, $"{start:dd MMM} – {last:dd MMM yyyy}"),
            ReportInterval.Year => start.Month == 1 && start.Day == 1 && end == start.AddYears(1)
                ? start.ToString("yyyy", CultureInfo.InvariantCulture)
                : string.Create(CultureInfo.InvariantCulture, $"{start:dd MMM yyyy} – {last:dd MMM yyyy}"),
            _ => start.ToString("dd MMM yyyy", CultureInfo.InvariantCulture)
        };
    }

    private static DateTimeOffset ToUtc(DateTime local, TimeZoneInfo timeZone)
    {
        DateTime unspecified = DateTime.SpecifyKind(local, DateTimeKind.Unspecified);
        if (timeZone.IsInvalidTime(unspecified))
        {
            unspecified = unspecified.AddHours(1);
        }

        return new DateTimeOffset(TimeZoneInfo.ConvertTimeToUtc(unspecified, timeZone), TimeSpan.Zero);
    }

    private static void ValidateRequest(AvailabilityReportRequest request)
    {
        if (request.FromDate > request.ToDate)
        {
            throw new ArgumentException("From date must not be after to date");
        }

        int days = request.ToDate.DayNumber - request.FromDate.DayNumber + 1;
        (int max, string label) = request.Interval switch
        {
            ReportInterval.Hour => (MaxHourlyDays, "hourly"),
            ReportInterval.Day => (MaxDailyDays, "daily"),
            _ => (MaxRangeDays, "weekly/monthly/yearly")
        };

        if (days > max)
        {
            throw new ArgumentException($"Date range too large for a {label} report: {days} days (maximum {max}).");
        }
    }

    private static AvailabilityMetrics[] NewPeriodArray(List<ReportPeriod> periods, long nowTs)
    {
        var result = new AvailabilityMetrics[periods.Count];
        for (int i = 0; i < periods.Count; i++)
        {
            double expected = 0;
            if (nowTs > 0)
            {
                long start = periods[i].StartUtc.ToUnixTimeSeconds();
                long end = Math.Min(periods[i].EndUtc.ToUnixTimeSeconds(), nowTs);
                expected = Math.Max(0, end - start);
            }

            result[i] = new AvailabilityMetrics { ExpectedSeconds = expected };
        }

        return result;
    }

    private static void AddRow(ReportMetricsRow target, ReportMetricsRow source)
    {
        for (int i = 0; i < source.PerPeriod.Count; i++)
        {
            target.PerPeriod[i].Add(source.PerPeriod[i]);
        }

        target.Total.Add(source.Total);
    }

    private static int FindPeriod(long[] periodStarts, long ts)
    {
        int index = Array.BinarySearch(periodStarts, ts);
        return index >= 0 ? index : ~index - 1;
    }

    private async Task<List<Data.Endpoint>> GetEndpointsAsync(List<string>? groupIds, CancellationToken cancellationToken)
    {
        IQueryable<Data.Endpoint> query = _context.Endpoints
            .Include(e => e.Group)
            .Where(e => e.Enabled)
            .AsNoTracking();

        if (groupIds is { Count: > 0 })
        {
            query = query.Where(e => groupIds.Contains(e.GroupId));
        }

        List<Data.Endpoint> endpoints = await query.ToListAsync(cancellationToken);

        return endpoints
            .OrderBy(e => e.Group.SortOrder ?? int.MaxValue)
            .ThenBy(e => e.Group.Name)
            .ThenBy(e => e.Name)
            .ToList();
    }

    /// <summary>
    /// Streams the range's 15-minute rollups (up to ~2.7M rows for a year of 78 endpoints) straight into the
    /// per-period accumulators, so memory stays flat regardless of range size.
    /// </summary>
    /// <remarks>
    /// Filters by time only and drops other endpoints in memory: an <c>EndpointId IN (...)</c> filter makes
    /// SQLite seek the primary key once per endpoint, which measured ~5x slower on a year of real data
    /// than a single range scan of <c>IX_rollup_15m_BucketTs</c>.
    /// </remarks>
    private async Task AccumulateRollupsAsync(
        long rangeStartTs,
        long rangeEndTs,
        long[] periodStarts,
        Dictionary<Guid, AvailabilityMetrics[]> perPeriod,
        CancellationToken cancellationToken)
    {
        var rollups = _context.Rollups15m
            .AsNoTracking()
            .Where(r => r.BucketTs >= rangeStartTs && r.BucketTs < rangeEndTs)
            .Select(r => new { r.EndpointId, r.BucketTs, r.UpPct, r.AvgRttMs })
            .AsAsyncEnumerable();

        await foreach (var r in rollups.WithCancellation(cancellationToken))
        {
            int index = FindPeriod(periodStarts, r.BucketTs);
            if (index < 0 || !perPeriod.TryGetValue(r.EndpointId, out AvailabilityMetrics[]? periods))
            {
                continue;
            }

            AvailabilityMetrics m = periods[index];
            m.MonitoredSeconds += BucketSeconds;
            m.UpSeconds += BucketSeconds * Math.Clamp(r.UpPct, 0, 100) / 100.0;
            if (r.AvgRttMs.HasValue)
            {
                m.RttSum += r.AvgRttMs.Value;
                m.RttSamples++;
            }
        }
    }

    /// <summary>
    /// Down events per period = outages that started in it. Whole-range totals also get MTTR inputs
    /// (outages started in range that have ended) and the longest outage (overlap with the range, so an
    /// outage that started before the range or is still ongoing counts only its in-range part).
    /// </summary>
    private async Task AccumulateOutagesAsync(
        List<Guid> endpointIds,
        long rangeStartTs,
        long rangeEndTs,
        long nowTs,
        long[] periodStarts,
        Dictionary<Guid, AvailabilityMetrics[]> perPeriod,
        Dictionary<Guid, AvailabilityMetrics> totals,
        CancellationToken cancellationToken)
    {
        var outages = await _context.Outages
            .AsNoTracking()
            .Where(o => endpointIds.Contains(o.EndpointId) && o.StartedTs < rangeEndTs && (o.EndedTs == null || o.EndedTs > rangeStartTs))
            .Select(o => new { o.EndpointId, o.StartedTs, o.EndedTs })
            .ToListAsync(cancellationToken);

        long clipEnd = Math.Min(rangeEndTs, nowTs);

        foreach (var o in outages)
        {
            AvailabilityMetrics total = totals[o.EndpointId];

            long overlap = Math.Min(o.EndedTs ?? nowTs, clipEnd) - Math.Max(o.StartedTs, rangeStartTs);
            total.LongestOutageSeconds = Math.Max(total.LongestOutageSeconds, Math.Max(0, overlap));

            if (o.StartedTs < rangeStartTs)
            {
                continue;
            }

            total.Outages++;
            total.DownEvents++;
            perPeriod[o.EndpointId][FindPeriod(periodStarts, o.StartedTs)].DownEvents++;

            if (o.EndedTs.HasValue)
            {
                total.ResolvedOutages++;
                total.ResolvedOutageSeconds += o.EndedTs.Value - o.StartedTs;
            }
        }
    }
}
