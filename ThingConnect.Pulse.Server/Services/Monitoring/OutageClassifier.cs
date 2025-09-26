using System.Net;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Provides classification logic for probe results (primary + fallback + history).
/// </summary>
public static class OutageClassifier
{
    public static OutageClassificationDto ClassifyOutage(
        CheckResult primaryResult,
        CheckResult? fallbackResult,
        Data.Endpoint endpoint,
        IEnumerable<CheckResult> recentHistory)
    {
        // 1. ICMP probes → always Network on failure
        if (endpoint.Type == ProbeType.icmp && primaryResult.Status == UpDown.down)
        {
            return OutageClassificationDto.Network;
        }

        // 2. Successful probes → check performance
        if (primaryResult.Status == UpDown.up)
        {
            if (IsPerformanceDegraded(primaryResult, endpoint))
            {
                return OutageClassificationDto.Performance;
            }

            return OutageClassificationDto.None; // explicitly healthy
        }

        // 3. Failed TCP/HTTP probes → use fallback
        if (fallbackResult != null)
        {
            var baseClassification = fallbackResult.Status == UpDown.up
                ? OutageClassificationDto.Service
                : OutageClassificationDto.Network;

            // 4. Advanced patterns
            if (IsIntermittent(recentHistory))
            {
                return OutageClassificationDto.Intermittent;
            }

            if (IsPartialService(primaryResult, fallbackResult, endpoint))
            {
                return OutageClassificationDto.PartialService;
            }

            if (IsDnsIssue(endpoint, fallbackResult))
            {
                return OutageClassificationDto.DnsResolution;
            }

            return baseClassification;
        }

        // 5. Fallback missing or failed → default
        return OutageClassificationDto.Unknown;
    }

    private static bool IsPerformanceDegraded(CheckResult result, Data.Endpoint endpoint)
    {
        if (!result.RttMs.HasValue) return false;

        double threshold = endpoint.Type == ProbeType.icmp ? 2.0 : 3.0;
        double baselineRtt = endpoint.ExpectedRttMs ?? 100; // default baseline

        return result.RttMs > baselineRtt * threshold;
    }

    private static bool IsIntermittent(IEnumerable<CheckResult> recentHistory)
    {
        var last15Min = recentHistory
            .Where(r => r.Timestamp > DateTimeOffset.UtcNow.AddMinutes(-15))
            .OrderBy(r => r.Timestamp)
            .ToList();

        if (last15Min.Count < 4) return false;

        int transitions = 0;
        for (int i = 1; i < last15Min.Count; i++)
        {
            if (last15Min[i].Status != last15Min[i - 1].Status)
                transitions++;
        }

        return transitions >= 4;
    }

    private static bool IsPartialService(CheckResult primary, CheckResult fallback, Data.Endpoint endpoint)
    {
        return endpoint.Type == ProbeType.http &&
               primary.Error?.Contains("50") == true && // HTTP 5xx
               fallback.Status == UpDown.up;
    }

    private static bool IsDnsIssue(Data.Endpoint endpoint, CheckResult fallbackResult)
    {
        return IsHostname(endpoint.Host) &&
               fallbackResult.Status == UpDown.down &&
               (fallbackResult.Error?.Contains("resolve", StringComparison.OrdinalIgnoreCase) ?? false);
    }

    private static bool IsHostname(string host)
    {
        return !IPAddress.TryParse(host, out _);
    }
}
