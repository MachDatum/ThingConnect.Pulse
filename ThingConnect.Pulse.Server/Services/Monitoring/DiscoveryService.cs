using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;
using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Implementation of discovery service for expanding network targets.
/// </summary>
public sealed class DiscoveryService : IDiscoveryService
{
    private readonly ILogger<DiscoveryService> _logger;

    private static readonly Regex CidrRegex = new(@"^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/(\d{1,2})$", 
        RegexOptions.Compiled);
    private static readonly Regex WildcardRegex = new(@"^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\*$", 
        RegexOptions.Compiled);

    public DiscoveryService(ILogger<DiscoveryService> logger)
    {
        _logger = logger;
    }

    public IEnumerable<string> ExpandCidr(string cidr)
    {
        var match = CidrRegex.Match(cidr);
        if (!match.Success)
        {
            _logger.LogWarning("Invalid CIDR format: {Cidr}", cidr);
            yield break;
        }

        var baseIp = match.Groups[1].Value;
        var prefixLength = int.Parse(match.Groups[2].Value);

        if (prefixLength < 0 || prefixLength > 32)
        {
            _logger.LogWarning("Invalid CIDR prefix length: {PrefixLength}", prefixLength);
            yield break;
        }

        if (!IPAddress.TryParse(baseIp, out var ipAddress))
        {
            _logger.LogWarning("Invalid IP address in CIDR: {BaseIp}", baseIp);
            yield break;
        }

        var addressBytes = ipAddress.GetAddressBytes();
        var addressInt = BitConverter.ToUInt32(addressBytes.Reverse().ToArray(), 0);
        
        var hostBits = 32 - prefixLength;
        var hostCount = (uint)(1 << hostBits);
        var networkAddress = addressInt & (0xFFFFFFFF << hostBits);

        // Skip network and broadcast addresses for practical use
        var startAddress = networkAddress + 1;
        var endAddress = networkAddress + hostCount - 1;

        for (var address = startAddress; address < endAddress && address > networkAddress; address++)
        {
            var bytes = BitConverter.GetBytes(address).Reverse().ToArray();
            var ip = new IPAddress(bytes);
            yield return ip.ToString();
        }
    }

    public IEnumerable<string> ExpandWildcard(string wildcard, int startRange = 1, int endRange = 254)
    {
        var match = WildcardRegex.Match(wildcard);
        if (!match.Success)
        {
            _logger.LogWarning("Invalid wildcard format: {Wildcard}", wildcard);
            yield break;
        }

        var octet1 = int.Parse(match.Groups[1].Value);
        var octet2 = int.Parse(match.Groups[2].Value);
        var octet3 = int.Parse(match.Groups[3].Value);

        if (octet1 > 255 || octet2 > 255 || octet3 > 255)
        {
            _logger.LogWarning("Invalid IP octets in wildcard: {Wildcard}", wildcard);
            yield break;
        }

        for (var octet4 = startRange; octet4 <= endRange; octet4++)
        {
            yield return $"{octet1}.{octet2}.{octet3}.{octet4}";
        }
    }

    public async Task<IEnumerable<string>> ResolveHostnameAsync(string hostname, CancellationToken cancellationToken = default)
    {
        try
        {
            var addresses = await Dns.GetHostAddressesAsync(hostname);
            return addresses
                .Where(addr => addr.AddressFamily == AddressFamily.InterNetwork) // IPv4 only for now
                .Select(addr => addr.ToString())
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to resolve hostname: {Hostname}", hostname);
            return Enumerable.Empty<string>();
        }
    }

    public async Task<IEnumerable<Data.Endpoint>> ExpandTargetsAsync(IEnumerable<dynamic> configTargets, 
        CancellationToken cancellationToken = default)
    {
        var endpoints = new List<Data.Endpoint>();

        foreach (var target in configTargets)
        {
            try
            {
                var expandedEndpoints = await ExpandSingleTargetAsync(target, cancellationToken);
                endpoints.AddRange(expandedEndpoints);
            }
            catch (Exception ex)
            {
                var targetStr = target?.ToString() ?? "null";
                Microsoft.Extensions.Logging.LoggerExtensions.LogError(_logger, ex, "Failed to expand target: " + targetStr);
            }
        }

        _logger.LogInformation("Expanded {TargetCount} targets into {EndpointCount} endpoints", 
            configTargets.Count(), endpoints.Count);

        return endpoints;
    }

    private async Task<IEnumerable<Data.Endpoint>> ExpandSingleTargetAsync(dynamic target, 
        CancellationToken cancellationToken)
    {
        var endpoints = new List<Data.Endpoint>();
        var hosts = new List<string>();

        // Extract host specification
        if (target.host != null)
        {
            var host = (string)target.host;
            
            // Check if it's an IP address or hostname
            if (IPAddress.TryParse(host, out _))
            {
                hosts.Add(host);
            }
            else
            {
                var resolvedHosts = await ResolveHostnameAsync(host, cancellationToken);
                hosts.AddRange(resolvedHosts);
            }
        }
        else if (target.cidr != null)
        {
            var cidr = (string)target.cidr;
            hosts.AddRange(ExpandCidr(cidr));
        }
        else if (target.wildcard != null)
        {
            var wildcard = (string)target.wildcard;
            hosts.AddRange(ExpandWildcard(wildcard));
        }

        // Create endpoint for each expanded host
        foreach (var host in hosts)
        {
            var endpoint = CreateEndpointFromTarget(target, host);
            endpoints.Add(endpoint);
        }

        return endpoints;
    }

    private static Data.Endpoint CreateEndpointFromTarget(dynamic target, string host)
    {
        // Parse probe type
        var probeType = ProbeType.icmp; // default
        if (target.type != null)
        {
            Enum.TryParse<ProbeType>((string)target.type, ignoreCase: true, out probeType);
        }
        else if (target.probe_type != null)
        {
            Enum.TryParse<ProbeType>((string)target.probe_type, ignoreCase: true, out probeType);
        }

        var endpoint = new Data.Endpoint
        {
            Id = Guid.NewGuid(),
            Name = target.name ?? $"{probeType.ToString().ToUpper()} {host}",
            GroupId = target.group ?? "default",
            Type = probeType,
            Host = host,
            Port = target.port,
            HttpPath = target.path,
            HttpMatch = target.expect_text,
            IntervalSeconds = target.interval_seconds ?? 30,
            TimeoutMs = target.timeout_ms ?? 2000,
            Retries = target.retries ?? 2,
            ExpectedRttMs = target.expected_rtt_ms,
            Enabled = target.enabled ?? true,
            Notes = target.notes
        };

        return endpoint;
    }
}