using System.Net;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Implementation of discovery service for expanding network targets, now supporting IPv6.
/// </summary>
public sealed class DiscoveryService : IDiscoveryService
{
    private readonly ILogger<DiscoveryService> _logger;

    // Regex for CIDR parsing
    private static readonly Regex Ipv6CidrRegex = new Regex(@"^([0-9a-fA-F:]+)(?:/([0-9]{1,3}))?$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);
    private static readonly Regex Ipv4CidrRegex = new Regex(@"^(\d{1,3}(?:\.\d{1,3}){3})(?:/([0-9]{1,2}))?$",
        RegexOptions.Compiled);
    private static readonly Regex WildcardRegex = new(@"^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.\*$",
        RegexOptions.Compiled);

    public DiscoveryService(ILogger<DiscoveryService> logger)
    {
        _logger = logger;
    }

    public IEnumerable<string> ExpandCidr(string cidr)
    {
        // IPv4 CIDR
        Match matchV4 = Ipv4CidrRegex.Match(cidr);
        if (matchV4.Success)
        {
            string baseIp = matchV4.Groups[1].Value;
            int prefixLength = int.Parse(matchV4.Groups[2].Value);

            if (prefixLength < 0 || prefixLength > 32)
            {
                _logger.LogWarning("Invalid CIDR prefix length: {PrefixLength}", prefixLength);
                yield break;
            }

            if (!IPAddress.TryParse(baseIp, out IPAddress? ipAddress))
            {
                _logger.LogWarning("Invalid IP address in CIDR: {BaseIp}", baseIp);
                yield break;
            }

            byte[] addressBytes = ipAddress.GetAddressBytes();
            uint addressInt = BitConverter.ToUInt32(addressBytes.Reverse().ToArray(), 0);
            int hostBits = 32 - prefixLength;
            uint hostCount = (uint)(1 << hostBits);
            uint networkAddress = addressInt & (0xFFFFFFFF << hostBits);

            // Skip network and broadcast addresses for practical use
            uint startAddress = networkAddress + 1;
            uint endAddress = networkAddress + hostCount - 1;

            for (uint address = startAddress; address < endAddress && address > networkAddress; address++)
            {
                byte[] bytes = BitConverter.GetBytes(address).Reverse().ToArray();
                yield return new IPAddress(bytes).ToString();
            }

            yield break;
        }

        // IPv6 CIDR using helper expander
        Match matchV6 = Ipv6CidrRegex.Match(cidr);
        if (matchV6.Success)
        {
            foreach (var ip in Ipv6CidrExpander.Expand(cidr))
            {
                yield return ip;
            }
            yield break;
        }

        _logger.LogWarning("Invalid CIDR format: {Cidr}", cidr);
    }

    public IEnumerable<string> ExpandWildcard(string wildcard, int startRange = 1, int endRange = 254)
    {
        Match match = WildcardRegex.Match(wildcard);
        if (!match.Success)
        {
            _logger.LogWarning("Invalid wildcard format: {Wildcard}", wildcard);
            yield break;
        }

        int octet1 = int.Parse(match.Groups[1].Value);
        int octet2 = int.Parse(match.Groups[2].Value);
        int octet3 = int.Parse(match.Groups[3].Value);

        if (octet1 > 255 || octet2 > 255 || octet3 > 255)
        {
            _logger.LogWarning("Invalid IP octets in wildcard: {Wildcard}", wildcard);
            yield break;
        }

        for (int octet4 = startRange; octet4 <= endRange; octet4++)
        {
            yield return $"{octet1}.{octet2}.{octet3}.{octet4}";
        }
    }

    public async Task<IEnumerable<string>> ResolveHostnameAsync(string hostname, CancellationToken cancellationToken = default)
    {
        try
        {
            IPAddress[] addresses = await Dns.GetHostAddressesAsync(hostname);
            return addresses
                .Select(addr =>
                {
                    if (addr.AddressFamily == AddressFamily.InterNetworkV6 && addr.ScopeId != 0)
                        return $"{addr}%{addr.ScopeId}";
                    return addr.ToString();
                })
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

        foreach (dynamic target in configTargets)
        {
            try
            {
                dynamic expandedEndpoints = await ExpandSingleTargetAsync(target, cancellationToken);
                endpoints.AddRange(expandedEndpoints);
            }
            catch (Exception ex)
            {
                dynamic targetStr = target?.ToString() ?? "null";
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
            string host = (string)target.host;

            // Check if it's an IP address or hostname
            if (IPAddress.TryParse(host, out _))
            {
                hosts.Add(host);
            }
            else
            {
                IEnumerable<string> resolvedHosts = await ResolveHostnameAsync(host, cancellationToken);
                hosts.AddRange(resolvedHosts);
            }
        }
        else if (target.cidr != null)
        {
            string cidr = (string)target.cidr;
            hosts.AddRange(ExpandCidr(cidr));
        }
        else if (target.wildcard != null)
        {
            string wildcard = (string)target.wildcard;
            hosts.AddRange(ExpandWildcard(wildcard));
        }

        // Create endpoint for each expanded host
        foreach (string host in hosts)
        {
            dynamic endpoint = CreateEndpointFromTarget(target, host);
            endpoints.Add(endpoint);
        }

        return endpoints;
    }

    private static Data.Endpoint CreateEndpointFromTarget(dynamic target, string host)
    {
        // Parse probe type
        ProbeType probeType = ProbeType.icmp; // default
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

    private sealed class NetworkRange
    {
        public string BaseAddress { get; }
        public int PrefixLength { get; }

        public NetworkRange(string baseAddress, int prefixLength)
        {
            BaseAddress = baseAddress;
            PrefixLength = prefixLength;
        }
    }

    private sealed class Ipv6CidrExpander
    {
        public static IEnumerable<string> Expand(string cidr)
        {
            var match = Ipv6CidrRegex.Match(cidr);
            if (!match.Success) throw new ArgumentException($"Invalid IPv6 CIDR: {cidr}");

            string baseAddress = match.Groups[1].Value;
            int prefixLength = match.Groups[2].Success ? int.Parse(match.Groups[2].Value) : 64;

            // Handle zone/index if present (e.g., fe80::1%eth0)
            string? zone = null;
            int percentIndex = baseAddress.IndexOf('%');
            if (percentIndex >= 0)
            {
                zone = baseAddress.Substring(percentIndex + 1);
                baseAddress = baseAddress.Substring(0, percentIndex);
            }

            if (!IPAddress.TryParse(baseAddress, out IPAddress? ipAddress) || ipAddress.AddressFamily != AddressFamily.InterNetworkV6)
                throw new ArgumentException($"Invalid IPv6 address: {baseAddress}");

            byte[] bytes = ipAddress.GetAddressBytes();

            string FormatAddress(byte[] addrBytes)
                => zone != null ? $"{new IPAddress(addrBytes)}%{zone}" : new IPAddress(addrBytes).ToString();

            if (prefixLength < 120 || prefixLength > 128)
                throw new ArgumentException($"IPv6 prefix /{prefixLength} not supported for practical expansion. Use /120–/128.");

            int hostCount = 1 << (128 - prefixLength);
            if (hostCount > 256) hostCount = 256;

            for (int i = 0; i < hostCount; i++)
            {
                byte[] copy = (byte[])bytes.Clone();
                copy[15] += (byte)i;
                yield return FormatAddress(copy);
            }
        }
    }
}
