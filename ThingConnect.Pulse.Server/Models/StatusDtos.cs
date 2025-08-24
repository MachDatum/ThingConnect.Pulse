namespace ThingConnect.Pulse.Server.Models;

public sealed class LiveStatusItemDto
{
    public EndpointDto Endpoint { get; set; } = default!;
    public string Status { get; set; } = default!;
    public double? RttMs { get; set; }
    public DateTimeOffset LastChangeTs { get; set; }
    public List<SparklinePoint> Sparkline { get; set; } = new();
}

public sealed class SparklinePoint
{
    public DateTimeOffset Ts { get; set; }
    public string S { get; set; } = default!;
}

public sealed class EndpointDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public GroupDto Group { get; set; } = default!;
    public string Type { get; set; } = default!;
    public string Host { get; set; } = default!;
    public int? Port { get; set; }
    public string? HttpPath { get; set; }
    public string? HttpMatch { get; set; }
    public int IntervalSeconds { get; set; }
    public int TimeoutMs { get; set; }
    public int Retries { get; set; }
    public bool Enabled { get; set; }
}

public sealed class GroupDto
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? ParentId { get; set; }
    public string? Color { get; set; }
}

public sealed class PageMetaDto
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int Total { get; set; }
}

public sealed class PagedLiveDto
{
    public PageMetaDto Meta { get; set; } = default!;
    public List<LiveStatusItemDto> Items { get; set; } = new();
}