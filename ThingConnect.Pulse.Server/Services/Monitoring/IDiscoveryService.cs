namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Service for expanding CIDR ranges, wildcards, and hostnames into individual endpoints.
/// </summary>
public interface IDiscoveryService
{
    /// <summary>
    /// Expands a CIDR range (e.g., "10.0.0.0/24") into individual IP addresses.
    /// </summary>
    /// <returns></returns>
    IEnumerable<string> ExpandCidr(string cidr);

    /// <summary>
    /// Expands a wildcard IP (e.g., "10.0.0.*") into individual IP addresses.
    /// Default range: 1-254 for the wildcard octet.
    /// </summary>
    /// <returns></returns>
    IEnumerable<string> ExpandWildcard(string wildcard, int startRange = 1, int endRange = 254);

    /// <summary>
    /// Resolves a hostname to its IP addresses.
    /// </summary>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
    Task<IEnumerable<string>> ResolveHostnameAsync(string hostname, CancellationToken cancellationToken = default);

    /// <summary>
    /// Expands configuration targets into concrete endpoints based on their host specification.
    /// Handles single hosts, CIDR ranges, and wildcards.
    /// </summary>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
    Task<IEnumerable<Data.Endpoint>> ExpandTargetsAsync(IEnumerable<dynamic> configTargets,
        CancellationToken cancellationToken = default);
}
