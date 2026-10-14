using ClosedXML.Excel;
using NUnit.Framework;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services.Reports;

namespace ThingConnect.Pulse.Tests;

[TestFixture]
public class XlsxReportWriterTests
{
    private static readonly TimeZoneInfo Ist = TimeZoneInfo.CreateCustomTimeZone("IST", TimeSpan.FromMinutes(330), "IST", "IST");

    [Test]
    public void DailyWorkbook_HasSummaryAndBlockPerPeriodPlusTotal()
    {
        AvailabilityReport report = BuildReport(ReportInterval.Day, new DateOnly(2026, 9, 1), new DateOnly(2026, 9, 2));

        using XLWorkbook workbook = Open(XlsxReportWriter.BuildAvailabilityWorkbook(report));
        Assert.That(workbook.Worksheets.Select(w => w.Name), Is.EqualTo(new[] { "Summary", "Availability" }));

        IXLWorksheet ws = workbook.Worksheet("Availability");
        Assert.That(ws.Cell(4, 1).GetString(), Is.EqualTo("Endpoint"));
        Assert.That(ws.Cell(4, 4).GetString(), Is.EqualTo("01 Sep 2026"));
        Assert.That(ws.Cell(5, 4).GetString(), Is.EqualTo("Uptime %"));
        Assert.That(ws.Cell(4, 8).GetString(), Is.EqualTo("02 Sep 2026"));
        Assert.That(ws.Cell(4, 12).GetString(), Is.EqualTo("Total"));
        Assert.That(ws.Cell(5, 19).GetString(), Is.EqualTo("Coverage %"));

        // Row 6 = all endpoints, row 7 = group, row 8 = endpoint (indented).
        Assert.That(ws.Cell(6, 1).GetString(), Is.EqualTo("All endpoints"));
        Assert.That(ws.Cell(7, 1).GetString(), Is.EqualTo("Line 1"));
        Assert.That(ws.Cell(8, 1).GetString(), Is.EqualTo("  PLC/01"));
        Assert.That(ws.Cell(8, 3).GetString(), Is.EqualTo("UP"));
        Assert.That(ws.Cell(8, 4).GetDouble(), Is.EqualTo(0.75).Within(1e-9));
        Assert.That(ws.Cell(8, 8).GetString(), Is.EqualTo("—"), "a period with no data shows a dash, not 0%");
    }

    [Test]
    public void SummarySheet_ListsKpisAndGroups()
    {
        AvailabilityReport report = BuildReport(ReportInterval.Day, new DateOnly(2026, 9, 1), new DateOnly(2026, 9, 1));

        using XLWorkbook workbook = Open(XlsxReportWriter.BuildAvailabilityWorkbook(report));
        IXLWorksheet ws = workbook.Worksheet("Summary");

        IXLCell overall = ws.Column(1).CellsUsed().Single(c => c.GetString() == "Overall uptime");
        Assert.That(ws.Cell(overall.Address.RowNumber, 2).GetDouble(), Is.EqualTo(0.75).Within(1e-9));
        Assert.That(ws.Column(1).CellsUsed().Select(c => c.GetString()), Does.Contain("By group").And.Contain("Line 1"));
    }

    [Test]
    public void HourlyWorkbook_HasPivotSheetPerEndpointWithSafeNames()
    {
        AvailabilityReport report = BuildReport(ReportInterval.Hour, new DateOnly(2026, 9, 1), new DateOnly(2026, 9, 2));

        using XLWorkbook workbook = Open(XlsxReportWriter.BuildAvailabilityWorkbook(report));
        Assert.That(workbook.Worksheets.Select(w => w.Name), Is.EqualTo(new[] { "Summary", "All endpoints", "PLC_01" }));

        IXLWorksheet ws = workbook.Worksheet("PLC_01");
        IXLCell header = ws.Column(1).CellsUsed().First(c => c.GetString() == "Date");
        int row = header.Address.RowNumber;
        Assert.That(ws.Cell(row, 2).GetString(), Is.EqualTo("00:00"));
        Assert.That(ws.Cell(row, 25).GetString(), Is.EqualTo("23:00"));
        Assert.That(ws.Cell(row, 26).GetString(), Is.EqualTo("Day"));
        Assert.That(ws.Cell(row + 1, 1).GetString(), Is.EqualTo("Tue 01 Sep 2026"));
        Assert.That(ws.Cell(row + 1, 2).GetDouble(), Is.EqualTo(0.75).Within(1e-9));
        Assert.That(ws.Cell(row + 2, 1).GetString(), Is.EqualTo("Wed 02 Sep 2026"));
    }

    [TestCase(null, "—")]
    [TestCase(45.0, "45s")]
    [TestCase(150.0, "2m 30s")]
    [TestCase(3_900.0, "1h 5m")]
    [TestCase(90_000.0, "1d 1h 0m")]
    public void FormatDuration_IsHumanReadable(double? seconds, string expected)
        => Assert.That(XlsxReportWriter.FormatDuration(seconds), Is.EqualTo(expected));

    /// <summary>
    /// One group, one endpoint (name with a character Excel forbids in sheet names). Only the first period
    /// has data: 1 hour monitored, 75% up.
    /// </summary>
    private static AvailabilityReport BuildReport(ReportInterval interval, DateOnly from, DateOnly to)
    {
        List<ReportPeriod> periods = ReportDataService.BuildPeriods(from, to, interval, Ist);
        List<AvailabilityMetrics> perPeriod = periods.Select(_ => new AvailabilityMetrics { ExpectedSeconds = 3600 }).ToList();
        perPeriod[0].MonitoredSeconds = 3600;
        perPeriod[0].UpSeconds = 2700;

        var total = new AvailabilityMetrics();
        perPeriod.ForEach(total.Add);

        var endpoint = new ReportEndpointRow
        {
            EndpointId = Guid.NewGuid(),
            Name = "PLC/01",
            Host = "10.0.1.10",
            GroupName = "Line 1",
            CurrentStatus = "UP",
            PerPeriod = perPeriod,
            Total = total
        };

        return new AvailabilityReport
        {
            FromDate = from,
            ToDate = to,
            Interval = interval,
            TimeZoneName = "IST",
            GeneratedAt = new DateTimeOffset(2026, 9, 3, 0, 0, 0, TimeSpan.Zero),
            Periods = periods,
            Groups = new List<ReportGroupSection>
            {
                new() { GroupName = "Line 1", Totals = endpoint, Endpoints = new List<ReportEndpointRow> { endpoint } }
            },
            Overall = endpoint
        };
    }

    private static XLWorkbook Open(byte[] bytes) => new(new MemoryStream(bytes));
}
