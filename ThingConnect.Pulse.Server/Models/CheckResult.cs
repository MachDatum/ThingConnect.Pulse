using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Models;

public enum OutageClassificationDto
{
    None = -1,           // Explicitly healthy, no outage detected
    Unknown = 0,         // Not enough information to classify
    Network = 1,         // Host unreachable (ICMP + service fail)
    Service = 2,         // Service down, host reachable via ICMP
    Intermittent = 3,    // Flapping / unstable
    Performance = 4,     // RTT above threshold
    PartialService = 5,  // HTTP error, TCP works
    DnsResolution = 6,   // DNS fails, IP works
    Congestion = 7,      // Correlated latency
    Maintenance = 8      // Planned downtime
}

/// <summary>
/// Result of a single probe check (ICMP, TCP, or HTTP).
/// </summary>
public sealed class CheckResult
{
    /// <summary>
    /// Gets or sets the endpoint that was checked.
    /// </summary>
    public Guid EndpointId { get; set; }

    /// <summary>
    /// Gets or sets timestamp when the check was performed.
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>
    /// Gets or sets result status: UP or DOWN.
    /// </summary>
    public UpDown Status { get; set; }

    /// <summary>
    /// Gets or sets round-trip time in milliseconds. Null if not applicable or failed.
    /// </summary>
    public double? RttMs { get; set; }

    /// <summary>
    /// Gets or sets error message if the check failed. Null if successful.
    /// </summary>
    public string? Error { get; set; }

    // 🔹 Fallback probe info
    public bool? FallbackAttempted { get; set; }
    public UpDown? FallbackStatus { get; set; }
    public double? FallbackRttMs { get; set; }
    public string? FallbackError { get; set; }

    /// <summary>
    /// Gets or sets the outage classification determined after primary and fallback probes.
    /// </summary>
    public OutageClassificationDto? Classification { get; set; }

    /// <summary>
    /// Creates a successful check result.
    /// </summary>
    /// <returns></returns>
    public static CheckResult Success(Guid endpointId, DateTimeOffset timestamp, double? rttMs = null)
    {
        return new CheckResult
        {
            EndpointId = endpointId,
            Timestamp = timestamp,
            Status = UpDown.up,
            RttMs = rttMs,
            Error = null
        };
    }

    /// <summary>
    /// Creates a failed check result.
    /// </summary>
    /// <returns></returns>
    public static CheckResult Failure(Guid endpointId, DateTimeOffset timestamp, string error)
    {
        return new CheckResult
        {
            EndpointId = endpointId,
            Timestamp = timestamp,
            Status = UpDown.down,
            RttMs = null,
            Error = error
        };
    }
}
