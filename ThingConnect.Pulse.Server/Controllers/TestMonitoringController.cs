using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services.Monitoring;

namespace ThingConnect.Pulse.Server.Controllers;

/// <summary>
/// Temporary controller for testing monitoring functionality.
/// </summary>
[ApiController]
[Route("api/test/monitoring")]
public class TestMonitoringController : ControllerBase
{
    private readonly PulseDbContext _context;
    private readonly IProbeService _probeService;
    private readonly IOutageDetectionService _outageService;
    private readonly IDiscoveryService _discoveryService;

    public TestMonitoringController(
        PulseDbContext context,
        IProbeService probeService,
        IOutageDetectionService outageService,
        IDiscoveryService discoveryService)
    {
        _context = context;
        _probeService = probeService;
        _outageService = outageService;
        _discoveryService = discoveryService;
    }

    /// <summary>
    /// Test probe functionality with different endpoint types.
    /// </summary>
    [HttpPost("test-probes")]
    public async Task<IActionResult> TestProbes()
    {
        var results = new List<object>();

        // Test ICMP probe
        CheckResult pingResult = await _probeService.PingAsync(Guid.NewGuid(), "8.8.8.8", 2000);
        results.Add(new { Type = "ICMP", Target = "8.8.8.8", Status = pingResult.Status, RTT = pingResult.RttMs, Error = pingResult.Error });

        // Test TCP probe
        CheckResult tcpResult = await _probeService.TcpConnectAsync(Guid.NewGuid(), "google.com", 80, 2000);
        results.Add(new { Type = "TCP", Target = "google.com:80", Status = tcpResult.Status, RTT = tcpResult.RttMs, Error = tcpResult.Error });

        // Test HTTP probe
        CheckResult httpResult = await _probeService.HttpCheckAsync(Guid.NewGuid(), "httpbin.org", 80, "/get", null, 3000);
        results.Add(new { Type = "HTTP", Target = "httpbin.org/get", Status = httpResult.Status, RTT = httpResult.RttMs, Error = httpResult.Error });

        return Ok(new { Results = results, Timestamp = DateTimeOffset.UtcNow });
    }

    /// <summary>
    /// Test outage detection with simulated probe results.
    /// </summary>
    [HttpPost("test-outage-detection")]
    public async Task<IActionResult> TestOutageDetection()
    {
        var testEndpointId = Guid.NewGuid();
        var results = new List<object>();

        // Simulate probe sequence: SUCCESS, SUCCESS, FAIL, FAIL (should trigger DOWN)
        CheckResult[] sequence = new[]
        {
            CheckResult.Success(testEndpointId, DateTimeOffset.UtcNow.AddMinutes(-4), 25.5),
            CheckResult.Success(testEndpointId, DateTimeOffset.UtcNow.AddMinutes(-3), 28.1),
            CheckResult.Failure(testEndpointId, DateTimeOffset.UtcNow.AddMinutes(-2), "Connection timeout"),
            CheckResult.Failure(testEndpointId, DateTimeOffset.UtcNow.AddMinutes(-1), "Connection refused"),
            CheckResult.Success(testEndpointId, DateTimeOffset.UtcNow.AddSeconds(-30), 22.3),
            CheckResult.Success(testEndpointId, DateTimeOffset.UtcNow, 19.7)
        };

        foreach (CheckResult? result in sequence)
        {
            bool stateChanged = await _outageService.ProcessCheckResultAsync(result);
            MonitorState? state = _outageService.GetMonitorState(testEndpointId);

            results.Add(new
            {
                Timestamp = result.Timestamp,
                Status = result.Status,
                StateChanged = stateChanged,
                LastPublicStatus = state?.LastPublicStatus,
                FailStreak = state?.FailStreak ?? 0,
                SuccessStreak = state?.SuccessStreak ?? 0,
                OpenOutageId = state?.OpenOutageId
            });
        }

        return Ok(new { TestEndpointId = testEndpointId, Sequence = results });
    }

    /// <summary>
    /// Test discovery service with various target types.
    /// </summary>
    [HttpPost("test-discovery")]
    public async Task<IActionResult> TestDiscovery()
    {
        var results = new List<object>();

        // Test CIDR expansion
        var cidrHosts = _discoveryService.ExpandCidr("192.168.1.0/30").Take(10).ToList();
        results.Add(new { Type = "CIDR", Input = "192.168.1.0/30", Expanded = cidrHosts });

        // Test wildcard expansion
        var wildcardHosts = _discoveryService.ExpandWildcard("10.0.0.*", 1, 5).ToList();
        results.Add(new { Type = "Wildcard", Input = "10.0.0.*", Range = "1-5", Expanded = wildcardHosts });

        // Test hostname resolution
        IEnumerable<string> resolvedHosts = await _discoveryService.ResolveHostnameAsync("google.com");
        results.Add(new { Type = "Hostname", Input = "google.com", Resolved = resolvedHosts });

        return Ok(new { Results = results, Timestamp = DateTimeOffset.UtcNow });
    }

    /// <summary>
    /// Get current raw check results for verification.
    /// </summary>
    [HttpGet("check-results")]
    public async Task<IActionResult> GetCheckResults()
    {
        var recentResults = await _context.CheckResultsRaw
            .OrderByDescending(cr => cr.Ts)
            .Take(20)
            .Select(cr => new
            {
                cr.Id,
                cr.EndpointId,
                cr.Ts,
                cr.Status,
                cr.RttMs,
                cr.Error
            })
            .ToListAsync();

        return Ok(new { Results = recentResults, Count = recentResults.Count });
    }

    /// <summary>
    /// Get current outages.
    /// </summary>
    [HttpGet("outages")]
    public async Task<IActionResult> GetOutages()
    {
        var outages = await _context.Outages
            .OrderByDescending(o => o.StartedTs)
            .Select(o => new
            {
                o.Id,
                o.EndpointId,
                o.StartedTs,
                o.EndedTs,
                o.DurationSeconds,
                o.LastError
            })
            .ToListAsync();

        return Ok(new { Outages = outages, Count = outages.Count });
    }
}
