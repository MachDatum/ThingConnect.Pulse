using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Models;

/// <summary>
/// Result of a single probe check (ICMP, TCP, or HTTP).
/// </summary>
public sealed class CheckResult
{
    /// <summary>
    /// The endpoint that was checked.
    /// </summary>
    public Guid EndpointId { get; set; }

    /// <summary>
    /// Timestamp when the check was performed.
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>
    /// Result status: UP or DOWN.
    /// </summary>
    public UpDown Status { get; set; }

    /// <summary>
    /// Round-trip time in milliseconds. Null if not applicable or failed.
    /// </summary>
    public double? RttMs { get; set; }

    /// <summary>
    /// Error message if the check failed. Null if successful.
    /// </summary>
    public string? Error { get; set; }

    /// <summary>
    /// Creates a successful check result.
    /// </summary>
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
