using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Services.Rollup;

namespace ThingConnect.Pulse.Server.Controllers;

/// <summary>
/// Test controller for rollup functionality (development only)
/// </summary>
[ApiController]
[Route("api/test/rollup")]
public sealed class TestRollupController : ControllerBase
{
    private readonly IRollupService _rollupService;
    private readonly ILogger<TestRollupController> _logger;

    public TestRollupController(IRollupService rollupService, ILogger<TestRollupController> logger)
    {
        _rollupService = rollupService;
        _logger = logger;
    }

    /// <summary>
    /// Manually trigger 15-minute rollup processing
    /// </summary>
    [HttpPost("process-15m")]
    public async Task<IActionResult> ProcessRollup15mAsync()
    {
        try
        {
            _logger.LogInformation("Manual 15m rollup processing requested");
            await _rollupService.ProcessRollup15mAsync();
            return Ok(new { message = "15-minute rollup processing completed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing 15m rollups");
            return StatusCode(500, new { message = "Error processing rollups", error = ex.Message });
        }
    }

    /// <summary>
    /// Manually trigger daily rollup processing
    /// </summary>
    [HttpPost("process-daily")]
    public async Task<IActionResult> ProcessRollupDailyAsync()
    {
        try
        {
            _logger.LogInformation("Manual daily rollup processing requested");
            await _rollupService.ProcessRollupDailyAsync();
            return Ok(new { message = "Daily rollup processing completed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing daily rollups");
            return StatusCode(500, new { message = "Error processing rollups", error = ex.Message });
        }
    }
}
