using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Models;


public sealed class RollupBucketDto
{
    public DateTimeOffset BucketTs { get; set; }
    public double UpPct { get; set; }
    public double? AvgRttMs { get; set; }
    public int DownEvents { get; set; }
}

public sealed class DailyBucketDto
{
    public DateOnly BucketDate { get; set; }
    public double UpPct { get; set; }
    public double? AvgRttMs { get; set; }
    public int DownEvents { get; set; }
}

public sealed class OutageDto
{
    public DateTimeOffset StartedTs { get; set; }
    public DateTimeOffset? EndedTs { get; set; }
    public int? DurationS { get; set; }
    public string? LastError { get; set; }
    public Classification? Classification { get; set; }
}

public sealed class HistoryResponseDto
{
    public EndpointDto Endpoint { get; set; } = default!;
    public List<RawCheckDto> Raw { get; set; } = new();
    public List<RollupBucketDto> Rollup15m { get; set; } = new();
    public List<DailyBucketDto> RollupDaily { get; set; } = new();
    public List<OutageDto> Outages { get; set; } = new();
}
