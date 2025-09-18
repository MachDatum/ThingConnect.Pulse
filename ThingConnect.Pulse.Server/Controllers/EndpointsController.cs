using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Services;

[ApiController]
[Route("api/endpoints")]
public sealed class EndpointsController : ControllerBase
{
    private readonly IEndpointService _endpointService;

    public EndpointsController(IEndpointService endpointService)
    {
        _endpointService = endpointService;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EndpointDetailDto>> GetEndpointDetail(
        Guid id,
        [FromQuery] int windowMinutes = 60)
    {
        var detail = await _endpointService.GetEndpointDetailAsync(id, windowMinutes);
        return detail == null ? (ActionResult<EndpointDetailDto>)NotFound() : (ActionResult<EndpointDetailDto>)Ok(detail);
    }
}
