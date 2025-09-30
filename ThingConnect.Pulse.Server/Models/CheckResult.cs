using System;
using System.Collections.Generic;
using System.Linq;
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
    /// 🔹 Helper to calculate effective status
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
    /// 🔹 Helper to get effective RTT
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
    /// 🔹 Auto-classification based on probe results
    /// </summary>
    public Classification DetermineClassification()
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
            return Data.Classification.Network; // Both down
        }
        return Data.Classification.Unknown; // No fallback info
    }

    /// <summary>
    /// 🔹 Common flapping detection utility (uses recent check list)
    /// </summary>
    public static bool IsFlapping(List<CheckResult> recent)
    {
        if (recent.Count < 4) return false;
        var effectiveStatuses = recent
            .OrderBy(c => c.Timestamp)
            .Select(c => c.GetEffectiveStatus().ToString())
            .ToList();
        int stateChanges = 0;
        for (int i = 1; i < effectiveStatuses.Count; i++)
            if (effectiveStatuses[i] != effectiveStatuses[i - 1])
                stateChanges++;
        return stateChanges > 3;
    }

    /// <summary>
    /// 🔹 Map endpoint entity to EndpointDto (call anywhere you need)
    /// </summary>
    public static EndpointDto MapToEndpointDto(Data.Endpoint endpoint)
    {
        return new EndpointDto
        {
            Id = endpoint.Id,
            Name = endpoint.Name,
            Group = new GroupDto
            {
                Id = endpoint.Group.Id,
                Name = endpoint.Group.Name,
                ParentId = endpoint.Group.ParentId,
                Color = endpoint.Group.Color
            },
            Type = endpoint.Type.ToString().ToLower(),
            Host = endpoint.Host,
            Port = endpoint.Port,
            HttpPath = endpoint.HttpPath,
            HttpMatch = endpoint.HttpMatch,
            IntervalSeconds = endpoint.IntervalSeconds,
            TimeoutMs = endpoint.TimeoutMs,
            Retries = endpoint.Retries,
            Enabled = endpoint.Enabled
        };
    }
}
