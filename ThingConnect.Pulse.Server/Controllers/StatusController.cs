using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class StatusController : ControllerBase
{
    private readonly IStatusService _statusService;
    private readonly ILogger<StatusController> _logger;

    public StatusController(IStatusService statusService, ILogger<StatusController> logger)
    {
        _statusService = statusService;
        _logger = logger;
    }

    /// <summary>
    /// Get paged live status feed for all endpoints.
    /// </summary>
    /// <param name="group">Optional group ID filter.</param>
    /// <param name="search">Optional search string (matches name or host).</param>
    /// <returns>Paged list of endpoint status with sparkline data.</returns>
    [HttpGet("live")]
    public async Task<ActionResult<LiveStatusItemDto>> GetLiveStatusAsync(
        [FromQuery] string? group = null,
        [FromQuery] string? search = null)
    {
        try
        {
            _logger.LogInformation("Getting live status - group: {Group}, search: {Search}, page: {Page}, pageSize: {PageSize}",
                group, search);

            List<LiveStatusItemDto> result = await _statusService.GetLiveStatusAsync(group, search);

            return Ok(new { items = result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting live status");
            return StatusCode(500, new { message = "Internal server error while retrieving live status" });
        }
    }
}
