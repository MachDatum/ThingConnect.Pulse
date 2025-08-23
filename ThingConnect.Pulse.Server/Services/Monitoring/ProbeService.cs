using System.Diagnostics;
using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Implementation of network probe service supporting ICMP, TCP, and HTTP checks.
/// </summary>
public sealed class ProbeService : IProbeService
{
    private readonly ILogger<ProbeService> _logger;
    private readonly HttpClient _httpClient;

    public ProbeService(ILogger<ProbeService> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient("ProbeClient");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "ThingConnectPulse/1.0");
    }

    public async Task<CheckResult> ProbeAsync(Data.Endpoint endpoint, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTimeOffset.UtcNow;

        try
        {
            return endpoint.Type switch
            {
                ProbeType.icmp => await PingAsync(endpoint.Id, endpoint.Host, endpoint.TimeoutMs, cancellationToken),
                ProbeType.tcp => await TcpConnectAsync(endpoint.Id, endpoint.Host, 
                    endpoint.Port ?? 80, endpoint.TimeoutMs, cancellationToken),
                ProbeType.http => await HttpCheckAsync(endpoint.Id, endpoint.Host, 
                    endpoint.Port ?? (endpoint.Host.StartsWith("https://") ? 443 : 80), 
                    endpoint.HttpPath, endpoint.HttpMatch, endpoint.TimeoutMs, cancellationToken),
                _ => CheckResult.Failure(endpoint.Id, timestamp, $"Unknown probe type: {endpoint.Type}")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Probe failed for endpoint {EndpointId} ({Host})", endpoint.Id, endpoint.Host);
            return CheckResult.Failure(endpoint.Id, timestamp, ex.Message);
        }
    }

    public async Task<CheckResult> PingAsync(Guid endpointId, string host, int timeoutMs, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTimeOffset.UtcNow;
        
        try
        {
            using var ping = new Ping();
            var stopwatch = Stopwatch.StartNew();
            
            var reply = await ping.SendPingAsync(host, timeoutMs);
            stopwatch.Stop();

            if (reply.Status == IPStatus.Success)
            {
                return CheckResult.Success(endpointId, timestamp, reply.RoundtripTime);
            }
            else
            {
                return CheckResult.Failure(endpointId, timestamp, $"Ping failed: {reply.Status}");
            }
        }
        catch (Exception ex)
        {
            return CheckResult.Failure(endpointId, timestamp, $"Ping error: {ex.Message}");
        }
    }

    public async Task<CheckResult> TcpConnectAsync(Guid endpointId, string host, int port, int timeoutMs, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTimeOffset.UtcNow;
        
        try
        {
            using var tcpClient = new TcpClient();
            var stopwatch = Stopwatch.StartNew();
            
            // Create a timeout task
            var timeoutTask = Task.Delay(timeoutMs, cancellationToken);
            var connectTask = tcpClient.ConnectAsync(host, port);
            
            var completedTask = await Task.WhenAny(connectTask, timeoutTask);
            stopwatch.Stop();

            if (completedTask == connectTask && connectTask.IsCompletedSuccessfully)
            {
                return CheckResult.Success(endpointId, timestamp, stopwatch.ElapsedMilliseconds);
            }
            else if (completedTask == timeoutTask)
            {
                return CheckResult.Failure(endpointId, timestamp, $"TCP connection timeout to {host}:{port}");
            }
            else
            {
                var exception = connectTask.Exception?.GetBaseException();
                return CheckResult.Failure(endpointId, timestamp, $"TCP connection failed: {exception?.Message}");
            }
        }
        catch (Exception ex)
        {
            return CheckResult.Failure(endpointId, timestamp, $"TCP error: {ex.Message}");
        }
    }

    public async Task<CheckResult> HttpCheckAsync(Guid endpointId, string host, int port, string? path, 
        string? expectedText, int timeoutMs, CancellationToken cancellationToken = default)
    {
        var timestamp = DateTimeOffset.UtcNow;
        
        try
        {
            // Build URL
            var scheme = port == 443 ? "https" : "http";
            var url = $"{scheme}://{host}";
            
            if (port != 80 && port != 443)
            {
                url += $":{port}";
            }
            
            if (!string.IsNullOrEmpty(path))
            {
                url += path.StartsWith("/") ? path : "/" + path;
            }

            var stopwatch = Stopwatch.StartNew();
            
            // Create timeout token
            using var timeoutCts = new CancellationTokenSource(timeoutMs);
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            var response = await _httpClient.GetAsync(url, linkedCts.Token);
            stopwatch.Stop();

            // Check status code
            if (!response.IsSuccessStatusCode)
            {
                return CheckResult.Failure(endpointId, timestamp, 
                    $"HTTP {(int)response.StatusCode} {response.ReasonPhrase}");
            }

            // Check expected text if specified
            if (!string.IsNullOrEmpty(expectedText))
            {
                var content = await response.Content.ReadAsStringAsync(linkedCts.Token);
                if (!content.Contains(expectedText, StringComparison.OrdinalIgnoreCase))
                {
                    return CheckResult.Failure(endpointId, timestamp, 
                        $"Expected text '{expectedText}' not found in response");
                }
            }

            return CheckResult.Success(endpointId, timestamp, stopwatch.ElapsedMilliseconds);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException || cancellationToken.IsCancellationRequested)
        {
            return CheckResult.Failure(endpointId, timestamp, "HTTP request timeout");
        }
        catch (HttpRequestException ex)
        {
            return CheckResult.Failure(endpointId, timestamp, $"HTTP request failed: {ex.Message}");
        }
        catch (Exception ex)
        {
            return CheckResult.Failure(endpointId, timestamp, $"HTTP error: {ex.Message}");
        }
    }
}