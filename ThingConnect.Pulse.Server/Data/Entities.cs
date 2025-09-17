// ThingConnect Pulse - EF Core Entities (v1)
namespace ThingConnect.Pulse.Server.Data;

public enum ProbeType { icmp, tcp, http }
public enum UpDown { up, down }

public record GroupVm(string Id, string Name, string? ParentId, string? Color);
public record EndpointVm(Guid Id, string Name, GroupVm Group, ProbeType Type, string Host,
                         int? Port, string? HttpPath, string? HttpMatch,
                         int IntervalSeconds, int TimeoutMs, int Retries, bool Enabled);

public sealed class Group
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? ParentId { get; set; }
    public string? Color { get; set; }
    public int? SortOrder { get; set; }
    public ICollection<Endpoint> Endpoints { get; set; } = new List<Endpoint>();
}

public sealed class Endpoint
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string GroupId { get; set; } = default!;
    public Group Group { get; set; } = default!;
    public ProbeType Type { get; set; }
    public string Host { get; set; } = default!;
    public int? Port { get; set; }
    public string? HttpPath { get; set; }
    public string? HttpMatch { get; set; }
    public int IntervalSeconds { get; set; }
    public int TimeoutMs { get; set; }
    public int Retries { get; set; }
    public int? ExpectedRttMs { get; set; }
    public bool Enabled { get; set; } = true;
    public string? Notes { get; set; }
    public long? LastChangeTs { get; set; }
    public UpDown? LastStatus { get; set; }
    public double? LastRttMs { get; set; }
}

public sealed class CheckResultRaw
{
    public long Id { get; set; }
    public Guid EndpointId { get; set; }
    public Endpoint Endpoint { get; set; } = default!;
    public long Ts { get; set; }
    public UpDown Status { get; set; }
    public double? RttMs { get; set; }
    public string? Error { get; set; }
}

public sealed class Outage
{
    public long Id { get; set; }
    public Guid EndpointId { get; set; }
    public Endpoint Endpoint { get; set; } = default!;
    public long StartedTs { get; set; }
    public long? EndedTs { get; set; }
    public int? DurationSeconds { get; set; }
    public string? LastError { get; set; }

    /// <summary>
    /// Timestamp when monitoring was lost during this outage (service downtime).
    /// If not null, indicates outage duration may be inaccurate due to monitoring gap.
    /// </summary>
    public long? MonitoringStoppedTs { get; set; }

    /// <summary>
    /// True if this outage spans a period when monitoring service was unavailable.
    /// Indicates uncertainty in the actual endpoint availability during that time.
    /// </summary>
    public bool HasMonitoringGap { get; set; }
}

public sealed class Rollup15m
{
    public Guid EndpointId { get; set; }
    public Endpoint Endpoint { get; set; } = default!;
    public long BucketTs { get; set; }
    public double UpPct { get; set; }
    public double? AvgRttMs { get; set; }
    public int DownEvents { get; set; }
}

public sealed class RollupDaily
{
    public Guid EndpointId { get; set; }
    public Endpoint Endpoint { get; set; } = default!;
    public long BucketDate { get; set; }
    public double UpPct { get; set; }
    public double? AvgRttMs { get; set; }
    public int DownEvents { get; set; }
}

public sealed class Setting
{
    public string K { get; set; } = default!;
    public string V { get; set; } = default!;
}

public sealed class ConfigVersion
{
    public string Id { get; set; } = default!;
    public long AppliedTs { get; set; }
    public string FileHash { get; set; } = default!;
    public string FilePath { get; set; } = default!;
    public string? Actor { get; set; }
    public string? Note { get; set; }
}

/// <summary>
/// Tracks monitoring service uptime sessions to detect monitoring gaps.
/// </summary>
public sealed class MonitoringSession
{
    public long Id { get; set; }
    public long StartedTs { get; set; }
    public long? EndedTs { get; set; }
    /// <summary>
    /// Timestamp of last monitoring activity (periodic heartbeat).
    /// Updated regularly during monitoring to provide accurate gap detection.
    /// </summary>
    public long? LastActivityTs { get; set; }
    public string? ShutdownReason { get; set; }
    public string? Version { get; set; }
}
