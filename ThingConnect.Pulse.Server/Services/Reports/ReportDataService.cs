using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Reports;

public sealed class ReportDataService : IReportDataService
{
    private readonly PulseDbContext _context;
    private readonly ILogger<ReportDataService> _logger;

    public ReportDataService(PulseDbContext context, ILogger<ReportDataService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<MachineAvailabilityRowDto>> GetMachineAvailabilityAsync(DateTimeOffset from, DateTimeOffset to, List<string>? groupIds)
    {
        ValidateRange(from, to);

        List<Data.Endpoint> endpoints = await GetEndpointsAsync(groupIds);
        List<Guid> endpointIds = endpoints.Select(e => e.Id).ToList();

        Dictionary<Guid, EndpointAggregate> aggregates = await ComputeAggregatesAsync(endpointIds, from, to);
        Dictionary<Guid, long> lastCheckByEndpoint = await GetLastCheckTimestampsAsync(endpointIds);

        var rows = new List<MachineAvailabilityRowDto>();
        foreach (Data.Endpoint endpoint in endpoints)
        {
            EndpointAggregate agg = aggregates.GetValueOrDefault(endpoint.Id, EndpointAggregate.Empty);

            rows.Add(new MachineAvailabilityRowDto
            {
                EndpointId = endpoint.Id,
                MachineName = endpoint.Name,
                Host = endpoint.Host,
                GroupName = endpoint.Group.Name,
                Status = DetermineReportStatus(endpoint, agg.AvgRttMs),
                UptimePct = Math.Round(agg.UptimePct, 2),
                AvgRttMs = agg.AvgRttMs,
                PacketLossPct = Math.Round(100.0 - agg.UptimePct, 2),
                LastCheckTs = lastCheckByEndpoint.TryGetValue(endpoint.Id, out long ts) ? UnixTimestamp.FromUnixSeconds(ts) : null,
                DowntimeSeconds = agg.DowntimeSeconds
            });
        }

        return rows;
    }

    public async Task<ExecutiveSummaryDto> GetExecutiveSummaryAsync(DateTimeOffset from, DateTimeOffset to, List<string>? groupIds)
    {
        ValidateRange(from, to);

        List<Data.Endpoint> endpoints = await GetEndpointsAsync(groupIds);
        List<Guid> endpointIds = endpoints.Select(e => e.Id).ToList();

        Dictionary<Guid, EndpointAggregate> aggregates = await ComputeAggregatesAsync(endpointIds, from, to);

        var perEndpoint = endpoints
            .Select(e => (Endpoint: e, Agg: aggregates.GetValueOrDefault(e.Id, EndpointAggregate.Empty)))
            .ToList();

        var summary = new ExecutiveSummaryDto
        {
            PeriodFrom = from,
            PeriodTo = to,
            EndpointsMonitored = perEndpoint.Count,
            EndpointsWithOutage = perEndpoint.Count(p => p.Agg.DowntimeSeconds > 0),
            TotalDownEvents = perEndpoint.Sum(p => p.Agg.DownEvents),
            TotalDowntimeHours = Math.Round(perEndpoint.Sum(p => p.Agg.DowntimeSeconds) / 3600.0, 2),
            OverallUptimePct = perEndpoint.Count > 0 ? Math.Round(perEndpoint.Average(p => p.Agg.UptimePct), 2) : 0,
        };

        summary.ByGroup = perEndpoint
            .GroupBy(p => p.Endpoint.Group.Name)
            .Select(g =>
            {
                var withRtt = g.Where(p => p.Agg.AvgRttMs.HasValue).ToList();
                (Data.Endpoint Endpoint, EndpointAggregate Agg) worst = g.OrderBy(p => p.Agg.UptimePct).First();

                return new GroupSummaryRowDto
                {
                    GroupName = g.Key,
                    UptimePct = Math.Round(g.Average(p => p.Agg.UptimePct), 2),
                    AvgRttMs = withRtt.Count > 0 ? Math.Round(withRtt.Average(p => p.Agg.AvgRttMs!.Value), 2) : null,
                    DownEvents = g.Sum(p => p.Agg.DownEvents),
                    WorstEndpointName = worst.Endpoint.Name
                };
            })
            .OrderBy(g => g.GroupName)
            .ToList();

        return summary;
    }

    private static void ValidateRange(DateTimeOffset from, DateTimeOffset to)
    {
        if (from >= to)
        {
            throw new ArgumentException("From date must be earlier than to date");
        }

        if (to - from > TimeSpan.FromDays(366))
        {
            throw new ArgumentException("Date range too large for this report. Maximum: 366 days");
        }
    }

    private async Task<List<Data.Endpoint>> GetEndpointsAsync(List<string>? groupIds)
    {
        IQueryable<Data.Endpoint> query = _context.Endpoints
            .Include(e => e.Group)
            .Where(e => e.Enabled)
            .AsNoTracking();

        if (groupIds is { Count: > 0 })
        {
            query = query.Where(e => groupIds.Contains(e.GroupId));
        }

        return await query
            .OrderBy(e => e.Group.Name)
            .ThenBy(e => e.Name)
            .ToListAsync();
    }

    /// <summary>
    /// Computes per-endpoint uptime/RTT/down-events/downtime for the period, from <see cref="RollupDaily"/>
    /// and <see cref="Outage"/> — batched by endpoint id list, no per-endpoint round trips.
    /// </summary>
    private async Task<Dictionary<Guid, EndpointAggregate>> ComputeAggregatesAsync(List<Guid> endpointIds, DateTimeOffset from, DateTimeOffset to)
    {
        var result = new Dictionary<Guid, EndpointAggregate>();
        if (endpointIds.Count == 0)
        {
            return result;
        }

        long fromDateUnix = UnixTimestamp.ToUnixDate(DateOnly.FromDateTime(from.Date));
        long toDateUnix = UnixTimestamp.ToUnixDate(DateOnly.FromDateTime(to.Date));

        var dailyRows = await _context.RollupsDaily
            .Where(r => endpointIds.Contains(r.EndpointId) && r.BucketDate >= fromDateUnix && r.BucketDate <= toDateUnix)
            .AsNoTracking()
            .Select(r => new { r.EndpointId, r.UpPct, r.AvgRttMs, r.DownEvents })
            .ToListAsync();

        long fromUnix = UnixTimestamp.ToUnixSeconds(from);
        long toUnix = UnixTimestamp.ToUnixSeconds(to);
        long nowUnix = UnixTimestamp.Now();

        var outages = await _context.Outages
            .Where(o => endpointIds.Contains(o.EndpointId) && o.StartedTs <= toUnix && (o.EndedTs == null || o.EndedTs >= fromUnix))
            .AsNoTracking()
            .Select(o => new { o.EndpointId, o.StartedTs, o.EndedTs })
            .ToListAsync();

        ILookup<Guid, (double UpPct, double? AvgRttMs, int DownEvents)> dailyByEndpoint = dailyRows
            .ToLookup(r => r.EndpointId, r => (r.UpPct, r.AvgRttMs, r.DownEvents));

        ILookup<Guid, (long StartedTs, long? EndedTs)> outagesByEndpoint = outages
            .ToLookup(o => o.EndpointId, o => (o.StartedTs, o.EndedTs));

        foreach (Guid endpointId in endpointIds)
        {
            var daily = dailyByEndpoint[endpointId].ToList();
            double uptimePct = daily.Count > 0 ? daily.Average(d => d.UpPct) : 0;
            var rttSamples = daily.Where(d => d.AvgRttMs.HasValue).Select(d => d.AvgRttMs!.Value).ToList();
            double? avgRtt = rttSamples.Count > 0 ? rttSamples.Average() : null;
            int downEvents = daily.Sum(d => d.DownEvents);

            long downtimeSeconds = 0;
            foreach ((long startedTs, long? endedTs) in outagesByEndpoint[endpointId])
            {
                long start = Math.Max(startedTs, fromUnix);
                long end = Math.Min(endedTs ?? nowUnix, toUnix);
                if (end > start)
                {
                    downtimeSeconds += end - start;
                }
            }

            result[endpointId] = new EndpointAggregate(uptimePct, avgRtt, downEvents, downtimeSeconds);
        }

        return result;
    }

    /// <summary>
    /// Bounded 2-hour lookback for "last check" — mirrors <c>StatusService.GetSparklineDataAsync</c> so this
    /// stays a single indexed batch query instead of an unbounded scan across the full retention window.
    /// </summary>
    private async Task<Dictionary<Guid, long>> GetLastCheckTimestampsAsync(List<Guid> endpointIds)
    {
        if (endpointIds.Count == 0)
        {
            return new Dictionary<Guid, long>();
        }

        long cutoffTime = UnixTimestamp.Subtract(UnixTimestamp.Now(), TimeSpan.FromHours(2));

        var recentChecks = await _context.CheckResultsRaw
            .Where(c => endpointIds.Contains(c.EndpointId) && c.Ts >= cutoffTime)
            .AsNoTracking()
            .Select(c => new { c.EndpointId, c.Ts })
            .ToListAsync();

        return recentChecks
            .GroupBy(c => c.EndpointId)
            .ToDictionary(g => g.Key, g => g.Max(c => c.Ts));
    }

    /// <summary>
    /// Current point-in-time status: down if the last known live status is down/unknown, degraded if up but
    /// the period's average RTT breaches the endpoint's expected threshold, otherwise up.
    /// </summary>
    private static string DetermineReportStatus(Data.Endpoint endpoint, double? periodAvgRttMs)
    {
        if (endpoint.LastStatus != UpDown.up)
        {
            return "down";
        }

        if (endpoint.ExpectedRttMs.HasValue && periodAvgRttMs.HasValue && periodAvgRttMs.Value > endpoint.ExpectedRttMs.Value)
        {
            return "degraded";
        }

        return "up";
    }

    private readonly record struct EndpointAggregate(double UptimePct, double? AvgRttMs, int DownEvents, long DowntimeSeconds)
    {
        public static readonly EndpointAggregate Empty = new(0, null, 0, 0);
    }
}
