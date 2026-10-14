using System.Globalization;
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
    /// Downloads the availability report as an Excel workbook: a Summary sheet plus either a column block per
    /// local day/week/month/year with a Total block, or (interval=hour) one date × hour-of-day sheet per endpoint.
    /// </summary>
    /// <param name="from">First local calendar date, inclusive (yyyy-MM-dd; a full ISO timestamp is accepted and its date used).</param>
    /// <param name="to">Last local calendar date, inclusive.</param>
    /// <param name="interval">hour, day, week, month or year.</param>
    /// <param name="groupIds">Optional group filter.</param>
    /// <param name="cancellationToken">Request cancellation.</param>
    [HttpGet("availability")]
    public async Task<IActionResult> GetAvailabilityReportAsync(
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] string interval = "day",
        [FromQuery] List<string>? groupIds = null,
        CancellationToken cancellationToken = default)
    {
        if (!TryParseDate(from, out DateOnly fromDate))
        {
            return BadRequest(new { message = "Invalid or missing 'from' date. Use yyyy-MM-dd." });
        }

        if (!TryParseDate(to, out DateOnly toDate))
        {
            return BadRequest(new { message = "Invalid or missing 'to' date. Use yyyy-MM-dd." });
        }

        if (!Enum.TryParse(interval, ignoreCase: true, out ReportInterval reportInterval) || !Enum.IsDefined(reportInterval))
        {
            return BadRequest(new { message = "Invalid 'interval'. Use hour, day, week, month or year." });
        }

        try
        {
            var request = new AvailabilityReportRequest
            {
                FromDate = fromDate,
                ToDate = toDate,
                Interval = reportInterval,
                GroupIds = groupIds,
                TimeZone = TimeZoneInfo.Local,
                Now = DateTimeOffset.UtcNow
            };

            AvailabilityReport report = await _reportDataService.GetAvailabilityReportAsync(request, cancellationToken);
            byte[] bytes = XlsxReportWriter.BuildAvailabilityWorkbook(report);

            string filename = $"Availability_Report_{fromDate:dd-MMM-yyyy}_to_{toDate:dd-MMM-yyyy}_{XlsxReportWriter.IntervalLabel(reportInterval)}.xlsx";
            return File(bytes, XlsxContentType, filename);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid parameters for availability report");
            return BadRequest(new { message = ex.Message });
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            return StatusCode(499);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating availability report");
            return StatusCode(500, new { message = "Internal server error while generating the report" });
        }
    }

    /// <summary>
    /// Headline availability figures for the selected range and groups (the workbook's Summary numbers), for
    /// the Reports page preview. Independent of the interval, so it is always computed as a single period.
    /// </summary>
    [HttpGet("availability/summary")]
    public async Task<ActionResult<AvailabilitySummaryDto>> GetAvailabilitySummaryAsync(
        [FromQuery] string from,
        [FromQuery] string to,
        [FromQuery] List<string>? groupIds = null,
        CancellationToken cancellationToken = default)
    {
        if (!TryParseDate(from, out DateOnly fromDate) || !TryParseDate(to, out DateOnly toDate))
        {
            return BadRequest(new { message = "Invalid or missing 'from'/'to' date. Use yyyy-MM-dd." });
        }

        try
        {
            AvailabilityReport report = await _reportDataService.GetAvailabilityReportAsync(
                new AvailabilityReportRequest
                {
                    FromDate = fromDate,
                    ToDate = toDate,
                    Interval = ReportInterval.Year,
                    GroupIds = groupIds,
                    TimeZone = TimeZoneInfo.Local,
                    Now = DateTimeOffset.UtcNow
                },
                cancellationToken);

            return Ok(AvailabilitySummaryDto.From(report));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            return StatusCode(499);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error computing availability summary");
            return StatusCode(500, new { message = "Internal server error while computing the summary" });
        }
    }

    private static bool TryParseDate(string? value, out DateOnly date)
    {
        date = default;
        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        // Only the calendar date matters; ignore any time/offset so the browser's zone can't shift the day.
        string datePart = value.Length >= 10 ? value[..10] : value;
        return DateOnly.TryParseExact(datePart, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out date);
    }
}
