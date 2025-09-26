using System.Diagnostics;
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
        DateTimeOffset timestamp = DateTimeOffset.UtcNow;
        CheckResult primaryResult;

        try
        {
            primaryResult = endpoint.Type switch
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
            _logger.LogError(ex, "Primary probe failed for endpoint {EndpointId} ({Host})", endpoint.Id, endpoint.Host);
            primaryResult = CheckResult.Failure(endpoint.Id, timestamp, ex.Message);
        }

        CheckResult? fallbackResult = null;

        // Trigger ICMP fallback only if primary failed and endpoint is not ICMP itself
        if (primaryResult.Status == UpDown.down && endpoint.Type != ProbeType.icmp)
        {
            fallbackResult = await PingAsync(endpoint.Id, endpoint.Host, endpoint.TimeoutMs, cancellationToken);

            primaryResult.FallbackAttempted = true;
            primaryResult.FallbackStatus = fallbackResult.Status;
            primaryResult.FallbackRttMs = fallbackResult.RttMs;
            primaryResult.FallbackError = fallbackResult.Error;
        }

        // Centralized classifier
        primaryResult.Classification = OutageClassifier.ClassifyOutage(
            primaryResult,
            fallbackResult,
            endpoint,
            Enumerable.Empty<CheckResult>() // later you can feed history here
        );

        return primaryResult;
    }

    public async Task<CheckResult> PingAsync(Guid endpointId, string host, int timeoutMs, CancellationToken cancellationToken = default)
    {
        DateTimeOffset timestamp = DateTimeOffset.UtcNow;

        try
        {
            using var ping = new Ping();
            var stopwatch = Stopwatch.StartNew();

            // Create cancellation token that respects both timeout and external cancellation
            using var timeoutCts = new CancellationTokenSource(timeoutMs);
            using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            try
            {
                // Use overload that accepts cancellation token
                PingReply reply = await ping.SendPingAsync(host, TimeSpan.FromMilliseconds(timeoutMs), cancellationToken: combinedCts.Token);
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
            catch (OperationCanceledException) when (timeoutCts.Token.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
            {
                // Timeout occurred (not external cancellation)
                stopwatch.Stop();
                return CheckResult.Failure(endpointId, timestamp, $"Ping timeout to {host}");
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                // External cancellation requested (service shutdown, etc.)
                stopwatch.Stop();
                return CheckResult.Failure(endpointId, timestamp, $"Ping cancelled to {host}");
            }
        }
        catch (Exception ex)
        {
            return CheckResult.Failure(endpointId, timestamp, $"Ping error: {ex.Message}");
        }
    }

    public async Task<CheckResult> TcpConnectAsync(Guid endpointId, string host, int port, int timeoutMs, CancellationToken cancellationToken = default)
    {
        DateTimeOffset timestamp = DateTimeOffset.UtcNow;

        try
        {
            using var tcpClient = new TcpClient();
            var stopwatch = Stopwatch.StartNew();

            // Create cancellation token that respects both timeout and external cancellation
            using var timeoutCts = new CancellationTokenSource(timeoutMs);
            using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            // Use the combined cancellation token for the connection
            Task connectTask = tcpClient.ConnectAsync(host, port, combinedCts.Token).AsTask();

            try
            {
                await connectTask;
                stopwatch.Stop();
                return CheckResult.Success(endpointId, timestamp, stopwatch.ElapsedMilliseconds);
            }
            catch (OperationCanceledException) when (timeoutCts.Token.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
            {
                // Timeout occurred (not external cancellation)
                stopwatch.Stop();
                return CheckResult.Failure(endpointId, timestamp, $"TCP connection timeout to {host}:{port}");
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                // External cancellation requested (service shutdown, etc.)
                stopwatch.Stop();
                return CheckResult.Failure(endpointId, timestamp, $"TCP connection cancelled to {host}:{port}");
            }
            catch (Exception ex)
            {
                // Connection failed for other reasons
                stopwatch.Stop();
                return CheckResult.Failure(endpointId, timestamp, $"TCP connection failed: {ex.Message}");
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
        DateTimeOffset timestamp = DateTimeOffset.UtcNow;

        try
        {
            // Build URL with proper protocol detection and validation
            string url = BuildHttpUrl(host, port, path);
            _logger.LogTrace("Built HTTP URL: {Url} from host={Host}, port={Port}, path={Path}",
                url, host, port, path);

            var stopwatch = Stopwatch.StartNew();

            // Create timeout token
            using var timeoutCts = new CancellationTokenSource(timeoutMs);
            using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, timeoutCts.Token);

            HttpResponseMessage response = await _httpClient.GetAsync(url, linkedCts.Token);
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
                string content = await response.Content.ReadAsStringAsync(linkedCts.Token);
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

    /// <summary>
    /// Builds HTTP URL with proper protocol detection and validation.
    /// Handles cases where host already contains protocol or needs port-based detection.
    /// </summary>
    private static string BuildHttpUrl(string host, int port, string? path)
    {
        string url;

        // Check if host already contains a protocol
        if (host.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            host.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            // Host already includes protocol, use as-is but validate port compatibility
            url = host;

            // If explicit port provided and doesn't match standard ports, append it
            bool isHttps = host.StartsWith("https://", StringComparison.OrdinalIgnoreCase);
            int standardPort = isHttps ? 443 : 80;

            if (port != standardPort)
            {
                // Check if host already has a port
                var uri = new Uri(host);
                if (uri.Port == -1 || uri.IsDefaultPort)
                {
                    // No explicit port in host, add the specified port
                    url = $"{uri.Scheme}://{uri.Host}:{port}";
                }

                // If host already has explicit port, keep it as-is
            }
        }
        else
        {
            // Host doesn't contain protocol, determine from port and context
            string scheme;

            // Use smart defaults: 443 and common HTTPS ports default to HTTPS, others to HTTP
            if (port == 443 || IsCommonHttpsPort(port))
            {
                scheme = "https";
            }
            else
            {
                scheme = "http";
            }

            url = $"{scheme}://{host}";

            // Add port if not standard for the chosen protocol
            int standardPort = scheme == "https" ? 443 : 80;
            if (port != standardPort)
            {
                url += $":{port}";
            }
        }

        // Add path if specified
        if (!string.IsNullOrEmpty(path))
        {
            // Ensure URL ends with host/port and path starts with /
            if (!url.EndsWith("/") && !path.StartsWith("/"))
            {
                url += "/";
            }
            else if (url.EndsWith("/") && path.StartsWith("/"))
            {
                // Remove duplicate slash
                path = path.Substring(1);
            }

            url += path;
        }

        // Validate the final URL
        try
        {
            var validationUri = new Uri(url);
            return url;
        }
        catch (UriFormatException ex)
        {
            throw new ArgumentException($"Invalid URL constructed: {url}", ex);
        }
    }

    /// <summary>
    /// Checks if the port is commonly used for HTTPS services.
    /// </summary>
    private static bool IsCommonHttpsPort(int port)
    {
        // Common HTTPS ports used in practice
        return port switch
        {
            8443 => true,  // Common alternative HTTPS port
            9443 => true,  // Common in containerized environments
            4443 => true,  // Sometimes used for APIs
            _ => false
        };
    }
}
