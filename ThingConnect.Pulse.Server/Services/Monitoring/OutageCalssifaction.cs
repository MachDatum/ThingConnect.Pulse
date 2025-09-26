// public static OutageClassification ClassifyOutage(
//     CheckResult primaryResult, 
//     CheckResult? fallbackResult, 
//     Endpoint endpoint,
//     IEnumerable<CheckResult> recentHistory)
// {
//     // 1. ICMP probes always Network on failure
//     if (endpoint.Type == ProbeType.icmp && primaryResult.Status == UpDown.down)
//         return OutageClassification.Network;
        
//     // 2. Successful probes - check performance
//     if (primaryResult.Status == UpDown.up)
//     {
//         if (IsPerformanceDegraded(primaryResult, endpoint))
//             return OutageClassification.Performance;
//         return OutageClassification.Unknown; // No outage
//     }
    
//     // 3. Failed TCP/HTTP probes - use fallback
//     if (fallbackResult?.IsExecuted == true)
//     {
//         var baseClassification = fallbackResult.IsSuccess ? 
//             OutageClassification.Service : OutageClassification.Network;
            
//         // 4. Check for advanced patterns
//         if (IsIntermittent(recentHistory))
//             return OutageClassification.Intermittent;
            
//         if (IsPartialService(primaryResult, fallbackResult, endpoint))
//             return OutageClassification.PartialService;
            
//         if (IsDnsIssue(endpoint, fallbackResult))
//             return OutageClassification.DnsResolution;
            
//         return baseClassification;
//     }
    
//     // 5. Fallback failed or no fallback
//     return OutageClassification.Unknown;
// }

// // Helper Methods
// private static bool IsPerformanceDegraded(CheckResult result, Endpoint endpoint)
// {
//     if (!result.RttMs.HasValue) return false;
    
//     double threshold = endpoint.Type == ProbeType.icmp ? 2.0 : 3.0;
//     double baselineRtt = endpoint.ExpectedRttMs ?? 100; // Default 100ms baseline
    
//     return result.RttMs > baselineRtt * threshold;
// }

// private static bool IsIntermittent(IEnumerable<CheckResult> recentHistory)
// {
//     var last15Min = recentHistory
//         .Where(r => r.Timestamp > DateTimeOffset.UtcNow.AddMinutes(-15))
//         .OrderBy(r => r.Timestamp)
//         .ToList();
        
//     if (last15Min.Count < 4) return false;
    
//     int transitions = 0;
//     for (int i = 1; i < last15Min.Count; i++)
//     {
//         if (last15Min[i].Status != last15Min[i-1].Status)
//             transitions++;
//     }
    
//     return transitions >= 4;
// }

// private static bool IsPartialService(CheckResult primary, CheckResult fallback, Endpoint endpoint)
// {
//     return endpoint.Type == ProbeType.http && 
//            primary.Error?.Contains("50") == true && // 5xx HTTP errors
//            fallback.IsSuccess == true;
// }

// private static bool IsDnsIssue(Endpoint endpoint, CheckResult fallbackResult)
// {
//     // Only for hostnames, not IP addresses
//     return IsHostname(endpoint.Host) && 
//            fallbackResult.IsSuccess == false &&
//            fallbackResult.Error?.Contains("resolve") == true;
// }

// private static bool IsHostname(string host)
// {
//     return !IPAddress.TryParse(host, out _);
// }
