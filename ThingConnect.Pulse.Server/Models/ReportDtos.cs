namespace ThingConnect.Pulse.Server.Models;

/// <summary>
/// Period granularity of the availability report. <see cref="Hour"/> is rendered as a pivot
/// (one sheet per endpoint, dates × hour-of-day); the others as column blocks per period.
/// </summary>
public enum ReportInterval
{
    Hour,
    Day,
    Week,
    Month,
    Year
}

/// <summary>
/// Inputs for the availability report. Dates are site-local calendar dates (inclusive), resolved
/// in <see cref="TimeZone"/> — the server's zone in production, so "a day" is a local midnight-to-midnight
/// day rather than a UTC day.
/// </summary>
public sealed class AvailabilityReportRequest
{
    public DateOnly FromDate { get; init; }

    public DateOnly ToDate { get; init; }

    public ReportInterval Interval { get; init; } = ReportInterval.Day;

    public List<string>? GroupIds { get; init; }

    public TimeZoneInfo TimeZone { get; init; } = TimeZoneInfo.Local;

    /// <summary>
    /// Gets the "current time" used to stop coverage at the present (a period still in progress only
    /// expects data up to now). Injected so tests are deterministic.
    /// </summary>
    public DateTimeOffset Now { get; init; } = DateTimeOffset.UtcNow;
}

/// <summary>
/// Fully computed availability report — the XLSX writer only lays this out, it does no maths.
/// </summary>
public sealed class AvailabilityReport
{
    public DateOnly FromDate { get; init; }

    public DateOnly ToDate { get; init; }

    public ReportInterval Interval { get; init; }

    public string TimeZoneName { get; init; } = default!;

    public DateTimeOffset GeneratedAt { get; init; }

    public List<ReportPeriod> Periods { get; init; } = new();

    public List<ReportGroupSection> Groups { get; init; } = new();

    /// <summary>
    /// Gets all endpoints combined, per period and in total.
    /// </summary>
    public ReportMetricsRow Overall { get; init; } = default!;
}

/// <summary>
/// One report column block: a local day/week/month/year (clipped to the report range), or one local hour.
/// </summary>
public sealed class ReportPeriod
{
    public string Label { get; init; } = default!;

    public DateTime LocalStart { get; init; }

    public DateTimeOffset StartUtc { get; init; }

    public DateTimeOffset EndUtc { get; init; }
}

public sealed class ReportGroupSection
{
    public string GroupName { get; init; } = default!;

    /// <summary>
    /// Gets the group subtotal row (all of the group's endpoints combined).
    /// </summary>
    public ReportMetricsRow Totals { get; init; } = default!;

    public List<ReportEndpointRow> Endpoints { get; init; } = new();
}

/// <summary>
/// Metrics for one row of the report: one entry per period (same order as <see cref="AvailabilityReport.Periods"/>)
/// plus the whole-range total.
/// </summary>
public class ReportMetricsRow
{
    public List<AvailabilityMetrics> PerPeriod { get; init; } = new();

    public AvailabilityMetrics Total { get; init; } = new();
}

public sealed class ReportEndpointRow : ReportMetricsRow
{
    public Guid EndpointId { get; init; }

    public string Name { get; init; } = default!;

    public string Host { get; init; } = default!;

    public string GroupName { get; init; } = default!;

    /// <summary>
    /// Gets the live status at report time: "UP", "DOWN" or "—" (never checked).
    /// </summary>
    public string CurrentStatus { get; init; } = default!;
}

/// <summary>
/// Additive availability accumulator. Raw sums are kept (not percentages) so endpoint, group and overall
/// figures are all time-weighted correctly when combined with <see cref="Add"/>.
/// </summary>
public sealed class AvailabilityMetrics
{
    /// <summary>Gets or sets seconds actually covered by monitoring data (15-min buckets present).</summary>
    public double MonitoredSeconds { get; set; }

    /// <summary>Gets or sets seconds the endpoint was up within <see cref="MonitoredSeconds"/>.</summary>
    public double UpSeconds { get; set; }

    /// <summary>Gets or sets seconds that should have been monitored (period length, clipped to "now").</summary>
    public double ExpectedSeconds { get; set; }

    public int DownEvents { get; set; }

    public double RttSum { get; set; }

    public int RttSamples { get; set; }

    // Outage statistics — only filled for whole-range totals (from the outage table).
    public int Outages { get; set; }

    public int ResolvedOutages { get; set; }

    public double ResolvedOutageSeconds { get; set; }

    public double LongestOutageSeconds { get; set; }

    public bool HasData => MonitoredSeconds > 0;

    /// <summary>Gets uptime as a percentage of monitored time, or null when nothing was monitored.</summary>
    public double? UptimePct => HasData ? UpSeconds / MonitoredSeconds * 100.0 : null;

    public double? DowntimeMinutes => HasData ? (MonitoredSeconds - UpSeconds) / 60.0 : null;

    public double? AvgRttMs => RttSamples > 0 ? RttSum / RttSamples : null;

    /// <summary>Gets the share of the expected time that has monitoring data (gaps = service stopped / not yet configured).</summary>
    public double? CoveragePct => ExpectedSeconds > 0 ? Math.Min(100.0, MonitoredSeconds / ExpectedSeconds * 100.0) : null;

    /// <summary>Gets mean time to recover: average duration of outages that started in range and have ended.</summary>
    public double? MttrSeconds => ResolvedOutages > 0 ? ResolvedOutageSeconds / ResolvedOutages : null;

    /// <summary>Gets mean time between failures: up time per outage started in range.</summary>
    public double? MtbfSeconds => Outages > 0 ? UpSeconds / Outages : null;

    public void Add(AvailabilityMetrics other)
    {
        MonitoredSeconds += other.MonitoredSeconds;
        UpSeconds += other.UpSeconds;
        ExpectedSeconds += other.ExpectedSeconds;
        DownEvents += other.DownEvents;
        RttSum += other.RttSum;
        RttSamples += other.RttSamples;
        Outages += other.Outages;
        ResolvedOutages += other.ResolvedOutages;
        ResolvedOutageSeconds += other.ResolvedOutageSeconds;
        LongestOutageSeconds = Math.Max(LongestOutageSeconds, other.LongestOutageSeconds);
    }
}

/// <summary>
/// Headline figures for the Reports page preview — the same numbers as the workbook's Summary sheet.
/// </summary>
public sealed class AvailabilitySummaryDto
{
    public int EndpointCount { get; init; }

    public int EndpointsDown { get; init; }

    public int EndpointsWithOutage { get; init; }

    /// <summary>
    /// Gets the average downtime per endpoint that had monitoring data — the meaningful "how much down time"
    /// figure (the overall downtime is a sum across endpoints and grows with the endpoint count).
    /// </summary>
    public double? AvgDowntimeMinutesPerEndpoint { get; init; }

    public AvailabilityFiguresDto Overall { get; init; } = default!;

    public List<GroupAvailabilityDto> Groups { get; init; } = new();

    public static AvailabilitySummaryDto From(AvailabilityReport report)
    {
        List<ReportEndpointRow> endpoints = report.Groups.SelectMany(g => g.Endpoints).ToList();
        return new AvailabilitySummaryDto
        {
            EndpointCount = endpoints.Count,
            EndpointsDown = endpoints.Count(e => e.CurrentStatus == "DOWN"),
            EndpointsWithOutage = endpoints.Count(e => e.Total.Outages > 0),
            AvgDowntimeMinutesPerEndpoint = AverageDowntimeMinutes(endpoints),
            Overall = AvailabilityFiguresDto.From(report.Overall.Total),
            Groups = report.Groups
                .Select(g => new GroupAvailabilityDto
                {
                    Name = g.GroupName,
                    EndpointCount = g.Endpoints.Count,
                    Figures = AvailabilityFiguresDto.From(g.Totals.Total)
                })
                .ToList()
        };
    }

    /// <summary>Average downtime (minutes) over endpoints that had monitoring data in the range.</summary>
    public static double? AverageDowntimeMinutes(IEnumerable<ReportEndpointRow> endpoints)
    {
        List<double> downtimes = endpoints
            .Where(e => e.Total.HasData)
            .Select(e => e.Total.DowntimeMinutes!.Value)
            .ToList();

        return downtimes.Count > 0 ? downtimes.Average() : null;
    }
}

public sealed class GroupAvailabilityDto
{
    public string Name { get; init; } = default!;

    public int EndpointCount { get; init; }

    public AvailabilityFiguresDto Figures { get; init; } = default!;
}

public sealed class AvailabilityFiguresDto
{
    public double? UptimePct { get; init; }

    public double? DowntimeMinutes { get; init; }

    public int DownEvents { get; init; }

    public double? AvgRttMs { get; init; }

    public double? MttrSeconds { get; init; }

    public double? MtbfSeconds { get; init; }

    public double? LongestOutageSeconds { get; init; }

    public double? CoveragePct { get; init; }

    public static AvailabilityFiguresDto From(AvailabilityMetrics m) => new()
    {
        UptimePct = m.UptimePct,
        DowntimeMinutes = m.DowntimeMinutes,
        DownEvents = m.DownEvents,
        AvgRttMs = m.AvgRttMs,
        MttrSeconds = m.MttrSeconds,
        MtbfSeconds = m.MtbfSeconds,
        LongestOutageSeconds = m.LongestOutageSeconds > 0 ? m.LongestOutageSeconds : null,
        CoveragePct = m.CoveragePct
    };
}
