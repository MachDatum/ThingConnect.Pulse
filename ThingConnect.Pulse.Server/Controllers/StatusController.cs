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
    /// Get paged live status feed for all endpoints
    /// </summary>
    /// <param name="group">Optional group ID filter</param>
    /// <param name="search">Optional search string (matches name or host)</param>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <returns>Paged list of endpoint status with sparkline data</returns>
    [HttpGet("live")]
    public async Task<ActionResult<PagedLiveDto>> GetLiveStatusAsync(
        [FromQuery] string? group = null,
        [FromQuery] string? search = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        try
        {
            // Validate pagination parameters
            if (page < 1)
            {
                return BadRequest(new { message = "Page must be >= 1" });
            }

            if (pageSize < 1 || pageSize > 500)
            {
                return BadRequest(new { message = "PageSize must be between 1 and 500" });
            }

            _logger.LogInformation("Getting live status - group: {Group}, search: {Search}, page: {Page}, pageSize: {PageSize}",
                group, search, page, pageSize);

            PagedLiveDto result = await _statusService.GetLiveStatusAsync(group, search, page, pageSize);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting live status");
            return StatusCode(500, new { message = "Internal server error while retrieving live status" });
        }
    }
}
