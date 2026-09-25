using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services.Reports;

namespace ThingConnect.Pulse.Server.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public sealed class ReportsController : ControllerBase
{
    private const string XlsxContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    private readonly IReportDataService _reportDataService;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(IReportDataService reportDataService, ILogger<ReportsController> logger)
    {
        _reportDataService = reportDataService;
        _logger = logger;
    }

    /// <summary>
    /// Downloads the Machine Availability Detail report: one row per machine with uptime, response time,
    /// packet-loss proxy, last check time and downtime for the selected period.
    /// </summary>
    [HttpGet("machine-availability")]
    public async Task<IActionResult> GetMachineAvailabilityAsync(
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] List<string>? groupIds = null,
        [FromQuery] string format = "xlsx")
    {
        (DateTimeOffset? fromDate, DateTimeOffset? toDate, IActionResult? rangeError) = ParseRange(from, to);
        if (rangeError != null)
        {
            return rangeError;
        }

        if (!string.Equals(format, "xlsx", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = $"Unsupported format '{format}'. Only 'xlsx' is available today." });
        }

        try
        {
            List<MachineAvailabilityRowDto> rows = await _reportDataService.GetMachineAvailabilityAsync(fromDate!.Value, toDate!.Value, groupIds);
            byte[] bytes = XlsxReportWriter.BuildMachineAvailabilityWorkbook(rows);

            string filename = $"machine-availability-{fromDate.Value:yyyyMMdd}-{toDate.Value:yyyyMMdd}.xlsx";
            return File(bytes, XlsxContentType, filename);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid parameters for machine availability report");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating machine availability report");
            return StatusCode(500, new { message = "Internal server error while generating the report" });
        }
    }

    /// <summary>
    /// Downloads the Executive Health Summary report: org-wide totals plus a per-group breakdown for the
    /// selected period.
    /// </summary>
    [HttpGet("executive-summary")]
    public async Task<IActionResult> GetExecutiveSummaryAsync(
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] List<string>? groupIds = null,
        [FromQuery] string format = "xlsx")
    {
        (DateTimeOffset? fromDate, DateTimeOffset? toDate, IActionResult? rangeError) = ParseRange(from, to);
        if (rangeError != null)
        {
            return rangeError;
        }

        if (!string.Equals(format, "xlsx", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { message = $"Unsupported format '{format}'. Only 'xlsx' is available today." });
        }

        try
        {
            ExecutiveSummaryDto summary = await _reportDataService.GetExecutiveSummaryAsync(fromDate!.Value, toDate!.Value, groupIds);
            byte[] bytes = XlsxReportWriter.BuildExecutiveSummaryWorkbook(summary);

            string filename = $"executive-summary-{fromDate.Value:yyyyMMdd}-{toDate.Value:yyyyMMdd}.xlsx";
            return File(bytes, XlsxContentType, filename);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid parameters for executive summary report");
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating executive summary report");
            return StatusCode(500, new { message = "Internal server error while generating the report" });
        }
    }

    private (DateTimeOffset? From, DateTimeOffset? To, IActionResult? Error) ParseRange(string from, string to)
    {
        if (string.IsNullOrEmpty(from))
        {
            return (null, null, BadRequest(new { message = "Required parameter 'from' is missing." }));
        }

        if (string.IsNullOrEmpty(to))
        {
            return (null, null, BadRequest(new { message = "Required parameter 'to' is missing." }));
        }

        if (!DateTimeOffset.TryParse(from, out DateTimeOffset fromDate))
        {
            return (null, null, BadRequest(new { message = "Invalid 'from' date format. Use ISO 8601 format." }));
        }

        if (!DateTimeOffset.TryParse(to, out DateTimeOffset toDate))
        {
            return (null, null, BadRequest(new { message = "Invalid 'to' date format. Use ISO 8601 format." }));
        }

        return (fromDate, toDate, null);
    }
}
