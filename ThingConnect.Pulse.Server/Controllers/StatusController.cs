using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class StatusController : ControllerBase
{
    private readonly IStatusService _statusService;
    private readonly IHistoryService _historyService;
    private readonly ILogger<StatusController> _logger;

    public StatusController(IStatusService statusService, IHistoryService historyService, ILogger<StatusController> logger)
    {
        _statusService = statusService;
        _historyService = historyService;
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

            var result = await _statusService.GetLiveStatusAsync(group, search, page, pageSize);
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting live status");
            return StatusCode(500, new { message = "Internal server error while retrieving live status" });
        }
    }
}

[ApiController]
[Route("api/history")]
public sealed class HistoryController : ControllerBase
{
    private readonly IHistoryService _historyService;
    private readonly ILogger<HistoryController> _logger;

    public HistoryController(IHistoryService historyService, ILogger<HistoryController> logger)
    {
        _historyService = historyService;
        _logger = logger;
    }

    /// <summary>
    /// Get historical data for a specific endpoint
    /// </summary>
    /// <param name="id">Endpoint ID</param>
    /// <param name="from">Start time (ISO 8601 format)</param>
    /// <param name="to">End time (ISO 8601 format)</param>
    /// <param name="bucket">Data bucket type: raw, 15m, or daily</param>
    /// <returns>Historical data for the endpoint</returns>
    [HttpGet("endpoint/{id}")]
    public async Task<ActionResult<HistoryResponseDto>> GetEndpointHistoryAsync(
        [FromRoute] Guid id,
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] string bucket = "15m")
    {
        try
        {
            // Check required parameters
            if (string.IsNullOrEmpty(from))
            {
                return BadRequest(new { message = "Required parameter 'from' is missing." });
            }

            if (string.IsNullOrEmpty(to))
            {
                return BadRequest(new { message = "Required parameter 'to' is missing." });
            }

            // Parse and validate date parameters
            if (!DateTimeOffset.TryParse(from, out var fromDate))
            {
                return BadRequest(new { message = "Invalid 'from' date format. Use ISO 8601 format." });
            }

            if (!DateTimeOffset.TryParse(to, out var toDate))
            {
                return BadRequest(new { message = "Invalid 'to' date format. Use ISO 8601 format." });
            }

            // Validate bucket parameter
            var validBuckets = new[] { "raw", "15m", "daily" };
            if (!validBuckets.Contains(bucket.ToLower()))
            {
                return BadRequest(new { message = $"Invalid bucket type '{bucket}'. Valid values: {string.Join(", ", validBuckets)}" });
            }

            _logger.LogInformation("Getting endpoint history - id: {Id}, from: {From}, to: {To}, bucket: {Bucket}",
                id, fromDate, toDate, bucket);

            var result = await _historyService.GetEndpointHistoryAsync(id, fromDate, toDate, bucket);
            
            if (result == null)
            {
                return NotFound(new { message = $"Endpoint with ID {id} not found" });
            }

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid parameters for endpoint history");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting endpoint history");
            return StatusCode(500, new { message = "Internal server error while retrieving endpoint history" });
        }
    }
}