using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Service for performing network probes (ICMP, TCP, HTTP) on endpoints.
/// </summary>
public interface IProbeService
{
    /// <summary>
    /// Performs a probe check on the specified endpoint.
    /// </summary>
    Task<CheckResult> ProbeAsync(Data.Endpoint endpoint, CancellationToken cancellationToken = default);

    /// <summary>
    /// Performs an ICMP ping probe.
    /// </summary>
    Task<CheckResult> PingAsync(Guid endpointId, string host, int timeoutMs, CancellationToken cancellationToken = default);

    /// <summary>
    /// Performs a TCP connection probe.
    /// </summary>
    Task<CheckResult> TcpConnectAsync(Guid endpointId, string host, int port, int timeoutMs, CancellationToken cancellationToken = default);

    /// <summary>
    /// Performs an HTTP/HTTPS probe.
    /// </summary>
    Task<CheckResult> HttpCheckAsync(Guid endpointId, string host, int port, string? path, string? expectedText,
        int timeoutMs, CancellationToken cancellationToken = default);
}
