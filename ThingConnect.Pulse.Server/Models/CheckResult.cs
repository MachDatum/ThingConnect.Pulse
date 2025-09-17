using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Models;

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
