using ThingConnect.Pulse.Server.Models;

public sealed class EndpointDetailDto
{
    public required EndpointDto Endpoint { get; set; }
    public CurrentStateDto CurrentState { get; set; } = default!;
    public List<CheckResultStructuredDto> Recent { get; set; } = [];
    public List<OutageDto> Outages { get; set; } = [];
}

public sealed class CheckResultStructuredDto
{
    public DateTimeOffset Ts { get; set; }
    public int Classification { get; set; }
    public ProbeResultDto Primary { get; set; } = default!;
    public FallbackResultDto Fallback { get; set; } = default!;
}

public sealed class ProbeResultDto
{
    public string Type { get; set; } = default!;
    public string Target { get; set; } = default!;
    public string Status { get; set; } = default!;
    public double? RttMs { get; set; }
    public string? Error { get; set; }
}

public sealed class FallbackResultDto
{
    public bool Attempted { get; set; }
    public string? Type { get; set; }
    public string? Target { get; set; }
    public string? Status { get; set; }
    public double? RttMs { get; set; }
    public string? Error { get; set; }
}
