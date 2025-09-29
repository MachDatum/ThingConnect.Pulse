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

    // 🔹 Fallback probe info
    public bool FallbackAttempted { get; set; } = false;
    public UpDown? FallbackStatus { get; set; }
    public double? FallbackRttMs { get; set; }
    public string? FallbackError { get; set; }

    /// <summary>
    /// Gets or sets the outage classification determined after primary and fallback probes.
    /// </summary>
    public OutageClassification? Classification { get; set; }

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
            Error = null,
            FallbackAttempted = false,
            FallbackStatus = null,
            FallbackRttMs = null,
            FallbackError = null,
            Classification = null
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
            Error = error,
            FallbackAttempted = false,
            FallbackStatus = null,
            FallbackRttMs = null,
            FallbackError = null,
            Classification = null
        };
    }

    /// <summary>
    /// Updates the current CheckResult with fallback info.
    /// </summary>
    public void ApplyFallback(CheckResult fallback)
    {
        if (fallback == null) return;

        FallbackAttempted = true;
        FallbackStatus = fallback.Status;
        FallbackRttMs = fallback.RttMs;
        FallbackError = fallback.Error;
    }
}
