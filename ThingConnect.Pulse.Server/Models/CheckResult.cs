using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Models;

/// <summary>
/// Result of a single probe check (ICMP, TCP, or HTTP).
/// </summary>
public sealed class CheckResult
{
    public Guid EndpointId { get; set; }
    public DateTimeOffset Timestamp { get; set; }
    public UpDown Status { get; set; }
    public double? RttMs { get; set; }
    public string? Error { get; set; }

    // 🔹 Fallback probe info
    public bool FallbackAttempted { get; set; } = false;
    public UpDown? FallbackStatus { get; set; }
    public double? FallbackRttMs { get; set; }
    public string? FallbackError { get; set; }
    public Classification? Classification { get; set; }

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
            Classification = Data.Classification.None
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
            Classification = Data.Classification.Unknown // 🔹 FIXED: Set to unknown
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
        Classification = DetermineClassification();
    }

    /// <summary>
    /// 🔹 NEW: Helper to calculate effective status
    /// </summary>
    public UpDown GetEffectiveStatus()
    {
        // Primary DOWN + Fallback UP = Effective UP (service issue)
        if (Status == UpDown.down && FallbackAttempted && FallbackStatus == UpDown.up)
        {
            return UpDown.up;
        }

        return Status;
    }

    /// <summary>
    /// 🔹 NEW: Helper to get effective RTT
    /// </summary>
    public double? GetEffectiveRtt()
    {
        // Priority 1: Primary RTT if successful
        if (Status == UpDown.up && RttMs.HasValue)
        {
            return RttMs;
        }

        // Priority 2: Fallback RTT if primary failed but fallback succeeded
        if (Status == UpDown.down && FallbackAttempted && FallbackStatus == UpDown.up && FallbackRttMs.HasValue)
        {
            return FallbackRttMs;
        }

        return null;
    }

    /// <summary>
    /// 🔹 NEW: Auto-classification based on probe results
    /// </summary>
    private Classification DetermineClassification()
    {
        if (Status == UpDown.up)
        {
            return Data.Classification.None; // Healthy
        }

        if (FallbackAttempted)
        {
            if (FallbackStatus == UpDown.up)
            {
                return Data.Classification.Service; // Service down, host up
            }
            else
            {
                return Data.Classification.Network; // Both down
            }
        }

        return Data.Classification.Unknown; // No fallback info
    }
}
