using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers;

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
            if (!DateTimeOffset.TryParse(from, out DateTimeOffset fromDate))
            {
                return BadRequest(new { message = "Invalid 'from' date format. Use ISO 8601 format." });
            }

            if (!DateTimeOffset.TryParse(to, out DateTimeOffset toDate))
            {
                return BadRequest(new { message = "Invalid 'to' date format. Use ISO 8601 format." });
            }

            // Validate bucket parameter
            string[] validBuckets = new[] { "raw", "15m", "daily" };
            if (!validBuckets.Contains(bucket.ToLower()))
            {
                return BadRequest(new { message = $"Invalid bucket type '{bucket}'. Valid values: {string.Join(", ", validBuckets)}" });
            }

            _logger.LogInformation("Getting endpoint history - id: {Id}, from: {From}, to: {To}, bucket: {Bucket}",
                id, fromDate, toDate, bucket);

            HistoryResponseDto? result = await _historyService.GetEndpointHistoryAsync(id, fromDate, toDate, bucket);

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