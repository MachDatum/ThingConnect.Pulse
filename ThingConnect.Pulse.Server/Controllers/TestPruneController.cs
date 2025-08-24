using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Services.Prune;

namespace ThingConnect.Pulse.Server.Controllers;

/// <summary>
/// Test controller for prune functionality (development only)
/// </summary>
[ApiController]
[Route("api/test/prune")]
public sealed class TestPruneController : ControllerBase
{
    private readonly IPruneService _pruneService;
    private readonly ILogger<TestPruneController> _logger;

    public TestPruneController(IPruneService pruneService, ILogger<TestPruneController> logger)
    {
        _pruneService = pruneService;
        _logger = logger;
    }

    /// <summary>
    /// Get current retention period
    /// </summary>
    [HttpGet("retention-days")]
    public async Task<IActionResult> GetRetentionDaysAsync()
    {
        try
        {
            var days = await _pruneService.GetRetentionDaysAsync();
            return Ok(new { retentionDays = days });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting retention days");
            return StatusCode(500, new { message = "Error getting retention days", error = ex.Message });
        }
    }

    /// <summary>
    /// Set retention period in days
    /// </summary>
    [HttpPost("retention-days/{days:int}")]
    public async Task<IActionResult> SetRetentionDaysAsync(int days)
    {
        try
        {
            if (days <= 0)
            {
                return BadRequest(new { message = "Retention days must be greater than 0" });
            }

            await _pruneService.SetRetentionDaysAsync(days);
            return Ok(new { message = $"Retention period set to {days} days" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting retention days to {Days}", days);
            return StatusCode(500, new { message = "Error setting retention days", error = ex.Message });
        }
    }

    /// <summary>
    /// Dry-run prune operation - shows what would be deleted without actually deleting
    /// </summary>
    [HttpPost("dry-run")]
    public async Task<IActionResult> DryRunPruneAsync()
    {
        try
        {
            _logger.LogInformation("Manual dry-run prune requested");
            var wouldDeleteCount = await _pruneService.PruneRawDataAsync(dryRun: true);
            var retentionDays = await _pruneService.GetRetentionDaysAsync();
            
            return Ok(new 
            { 
                message = "Dry-run prune completed",
                wouldDeleteCount = wouldDeleteCount,
                retentionDays = retentionDays,
                cutoffDate = DateTimeOffset.UtcNow.AddDays(-retentionDays).ToString("O")
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during dry-run prune");
            return StatusCode(500, new { message = "Error during dry-run prune", error = ex.Message });
        }
    }

    /// <summary>
    /// Execute actual prune operation - PERMANENTLY deletes old raw data
    /// </summary>
    [HttpPost("execute")]
    public async Task<IActionResult> ExecutePruneAsync()
    {
        try
        {
            _logger.LogInformation("Manual prune execution requested");
            var deletedCount = await _pruneService.PruneRawDataAsync(dryRun: false);
            var retentionDays = await _pruneService.GetRetentionDaysAsync();
            
            return Ok(new 
            { 
                message = "Prune operation completed successfully",
                deletedCount = deletedCount,
                retentionDays = retentionDays
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during prune execution");
            return StatusCode(500, new { message = "Error during prune execution", error = ex.Message });
        }
    }
}