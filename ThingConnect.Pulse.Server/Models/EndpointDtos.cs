using System;

namespace ThingConnect.Pulse.Server.Models;

/// <summary>
/// Detailed information about a specific endpoint
/// </summary>
public class EndpointDetailDto
{
    /// <summary>
    /// Core endpoint information
    /// </summary>
    public EndpointInfoDto Endpoint { get; set; }

    /// <summary>
    /// Last known status of the endpoint
    /// </summary>
    public string LastStatus { get; set; }

    /// <summary>
    /// Timestamp of the last check
    /// </summary>
    public DateTimeOffset? LastCheckTime { get; set; }
}

/// <summary>
/// Core information about an endpoint
/// </summary>
public class EndpointInfoDto
{
    /// <summary>
    /// Unique identifier for the endpoint
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Human-readable name of the endpoint
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Hostname or IP address of the endpoint
    /// </summary>
    public string Host { get; set; }

    /// <summary>
    /// Type of endpoint (e.g., ICMP, TCP, HTTP)
    /// </summary>
    public string Type { get; set; }

    /// <summary>
    /// Group information for the endpoint
    /// </summary>
    public GroupDto Group { get; set; }

    /// <summary>
    /// Interval between checks in seconds
    /// </summary>
    public int IntervalSeconds { get; set; }

    /// <summary>
    /// Timeout for endpoint checks in milliseconds
    /// </summary>
    public int TimeoutMs { get; set; }
}

/// <summary>
/// Group information for an endpoint
/// </summary>
public class GroupDto
{
    /// <summary>
    /// Unique identifier for the group
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Name of the group
    /// </summary>
    public string Name { get; set; }
}

/// <summary>
/// Lightweight summary of an endpoint
/// </summary>
public class EndpointSummaryDto
{
    /// <summary>
    /// Unique identifier for the endpoint
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Human-readable name of the endpoint
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// Hostname or IP address of the endpoint
    /// </summary>
    public string Host { get; set; }

    /// <summary>
    /// Type of endpoint (e.g., ICMP, TCP, HTTP)
    /// </summary>
    public string Type { get; set; }

    /// <summary>
    /// Last known status of the endpoint
    /// </summary>
    public string LastStatus { get; set; }

    /// <summary>
    /// Name of the group the endpoint belongs to
    /// </summary>
    public string GroupName { get; set; }
}