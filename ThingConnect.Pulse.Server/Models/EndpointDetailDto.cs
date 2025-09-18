using ThingConnect.Pulse.Server.Models;

public sealed class EndpointDetailDto
{
    public required EndpointDto Endpoint { get; set; }
    public List<RawCheckDto> Recent { get; set; } = [];
    public List<OutageDto> Outages { get; set; } = [];
}
