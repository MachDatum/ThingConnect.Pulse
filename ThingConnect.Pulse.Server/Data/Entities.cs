// ThingConnect Pulse - EF Core Entities (v2)
// Updated for ICMP Fallback + Outage Classification
namespace ThingConnect.Pulse.Server.Data;

public enum ProbeType { icmp, tcp, http }
public enum UpDown { up, down }

/// <summary>
/// Status classification for failed probe analysis.
/// </summary>
public enum Classification
{
    None = -1, // Explicitly healthy, no outage detected
    Unknown = 0, // Not enough information to classify
    Network = 1, // Host unreachable (ICMP + service fail)
    Service = 2, // Service down, host reachable via ICMP
    Intermittent = 3, // Flapping / unstable
    Performance = 4, // RTT above threshold
    PartialService = 5, // HTTP error, TCP works
    DnsResolution = 6, // DNS fails, IP works
    Congestion = 7, // Correlated latency
    Maintenance = 8 // Planned downtime
}

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

    // 🔹 New fields for fallback probe
    public bool? FallbackAttempted { get; set; }
    public UpDown? FallbackStatus { get; set; }
    public double? FallbackRttMs { get; set; }
    public string? FallbackError { get; set; }
    public Classification? Classification { get; set; }
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
    public Classification? Classification { get; set; }

    /// <summary>
    /// Gets or sets timestamp when monitoring was lost during this outage (service downtime).
    /// If not null, indicates outage duration may be inaccurate due to monitoring gap.
    /// </summary>
    public long? MonitoringStoppedTs { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether true if this outage spans a period when monitoring service was unavailable.
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
    /// Gets or sets timestamp of last monitoring activity (periodic heartbeat).
    /// Updated regularly during monitoring to provide accurate gap detection.
    /// </summary>
    public long? LastActivityTs { get; set; }
    public string? ShutdownReason { get; set; }
    public string? Version { get; set; }
}

public enum NotificationType { info, warning, release, maintenance }
public enum NotificationPriority { low, medium, high, critical }

/// <summary>
/// Represents a notification fetched from the remote server for display to users.
/// </summary>
public sealed class Notification
{
    public string Id { get; set; } = default!;
    public NotificationType Type { get; set; }
    public NotificationPriority Priority { get; set; }
    public string Title { get; set; } = default!;
    public string Message { get; set; } = default!;
    public string? ActionUrl { get; set; }
    public string? ActionText { get; set; }
    public long ValidFromTs { get; set; }
    public long ValidUntilTs { get; set; }
    public string? TargetVersions { get; set; }
    public bool ShowOnce { get; set; }
    public bool IsRead { get; set; }
    public bool IsShown { get; set; }
    public long CreatedTs { get; set; }
    public long? ReadTs { get; set; }
    public long? ShownTs { get; set; }
}

/// <summary>
/// Tracks the last successful notification fetch from the remote server.
/// </summary>
public sealed class NotificationFetch
{
    public long Id { get; set; }
    public long FetchTs { get; set; }
    public string RemoteVersion { get; set; } = default!;
    public string RemoteLastUpdated { get; set; } = default!;
    public int NotificationCount { get; set; }
    public bool Success { get; set; }
    public string? Error { get; set; }
}
