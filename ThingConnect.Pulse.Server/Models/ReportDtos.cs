namespace ThingConnect.Pulse.Server.Models;

/// <summary>
/// One row of the Machine Availability Detail report.
/// </summary>
public sealed class MachineAvailabilityRowDto
{
    public Guid EndpointId { get; set; }

    public string MachineName { get; set; } = default!;

    public string Host { get; set; } = default!;

    public string GroupName { get; set; } = default!;

    /// <summary>
    /// Gets or sets current point-in-time status: "up", "degraded", or "down".
    /// Degraded means up but breaching the endpoint's expected RTT threshold.
    /// </summary>
    public string Status { get; set; } = default!;

    /// <summary>
    /// Gets or sets uptime percentage over the report period (from <c>RollupDaily.UpPct</c>).
    /// </summary>
    public double UptimePct { get; set; }

    public double? AvgRttMs { get; set; }

    /// <summary>
    /// Gets or sets a proxy for packet loss: <c>100 - UptimePct</c> over the period.
    /// Not a true multi-echo loss ratio — see report footnote.
    /// </summary>
    public double PacketLossPct { get; set; }

    public DateTimeOffset? LastCheckTs { get; set; }

    public long DowntimeSeconds { get; set; }
}

/// <summary>
/// Executive Health Summary report: org-wide totals plus a per-group breakdown.
/// </summary>
public sealed class ExecutiveSummaryDto
{
    public DateTimeOffset PeriodFrom { get; set; }

    public DateTimeOffset PeriodTo { get; set; }

    public double OverallUptimePct { get; set; }

    public int TotalDownEvents { get; set; }

    public double TotalDowntimeHours { get; set; }

    public int EndpointsMonitored { get; set; }

    public int EndpointsWithOutage { get; set; }

    public List<GroupSummaryRowDto> ByGroup { get; set; } = new();
}

public sealed class GroupSummaryRowDto
{
    public string GroupName { get; set; } = default!;

    public double UptimePct { get; set; }

    public double? AvgRttMs { get; set; }

    public int DownEvents { get; set; }

    public string? WorstEndpointName { get; set; }
}
