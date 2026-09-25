using ClosedXML.Excel;
using NUnit.Framework;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services.Reports;

namespace ThingConnect.Pulse.Tests;

[TestFixture]
public class XlsxReportWriterTests
{
    [Test]
    public void BuildMachineAvailabilityWorkbook_WritesHeaderAndRows()
    {
        var rows = new List<MachineAvailabilityRowDto>
        {
            new()
            {
                EndpointId = Guid.NewGuid(),
                MachineName = "CNC-01",
                Host = "10.0.0.1",
                GroupName = "Line 1",
                Status = "up",
                UptimePct = 99.99,
                AvgRttMs = 4,
                PacketLossPct = 0.01,
                LastCheckTs = new DateTimeOffset(2026, 9, 23, 10, 1, 20, TimeSpan.Zero),
                DowntimeSeconds = 30
            },
            new()
            {
                EndpointId = Guid.NewGuid(),
                MachineName = "PLC-03",
                Host = "10.0.0.3",
                GroupName = "Line 1",
                Status = "down",
                UptimePct = 96.2,
                AvgRttMs = null,
                PacketLossPct = 3.8,
                LastCheckTs = null,
                DowntimeSeconds = 180
            }
        };

        byte[] bytes = XlsxReportWriter.BuildMachineAvailabilityWorkbook(rows);

        using var stream = new MemoryStream(bytes);
        using var workbook = new XLWorkbook(stream);
        IXLWorksheet sheet = workbook.Worksheet("Detail");

        Assert.That(sheet.Cell(1, 1).GetString(), Is.EqualTo("Machine"));
        Assert.That(sheet.Cell(1, 2).GetString(), Is.EqualTo("Status"));
        Assert.That(sheet.Cell(2, 1).GetString(), Is.EqualTo("CNC-01"));
        Assert.That(sheet.Cell(2, 2).GetString(), Is.EqualTo("UP"));
        Assert.That(sheet.Cell(3, 1).GetString(), Is.EqualTo("PLC-03"));
        Assert.That(sheet.Cell(3, 4).GetString(), Is.EqualTo("—"), "no RTT sample shows as em dash");
    }

    [Test]
    public void BuildExecutiveSummaryWorkbook_WritesSummaryAndByGroupSheets()
    {
        var summary = new ExecutiveSummaryDto
        {
            PeriodFrom = new DateTimeOffset(2026, 9, 1, 0, 0, 0, TimeSpan.Zero),
            PeriodTo = new DateTimeOffset(2026, 9, 23, 0, 0, 0, TimeSpan.Zero),
            OverallUptimePct = 99.42,
            TotalDownEvents = 37,
            TotalDowntimeHours = 4.6,
            EndpointsMonitored = 128,
            EndpointsWithOutage = 9,
            ByGroup = new List<GroupSummaryRowDto>
            {
                new() { GroupName = "Line 1", UptimePct = 99.8, AvgRttMs = 12, DownEvents = 2, WorstEndpointName = "PLC-04" },
                new() { GroupName = "Line 3", UptimePct = 96.1, AvgRttMs = 41, DownEvents = 14, WorstEndpointName = "Robot-Arm-2" }
            }
        };

        byte[] bytes = XlsxReportWriter.BuildExecutiveSummaryWorkbook(summary);

        using var stream = new MemoryStream(bytes);
        using var workbook = new XLWorkbook(stream);

        IXLWorksheet summarySheet = workbook.Worksheet("Summary");
        Assert.That(summarySheet.Cell(1, 1).GetString(), Is.EqualTo("Metric"));
        Assert.That(summarySheet.Cell(2, 1).GetString(), Is.EqualTo("Report Period"));

        IXLWorksheet groupSheet = workbook.Worksheet("By Group");
        Assert.That(groupSheet.Cell(1, 1).GetString(), Is.EqualTo("Group"));
        Assert.That(groupSheet.Cell(2, 1).GetString(), Is.EqualTo("Line 1"));
        Assert.That(groupSheet.Cell(3, 1).GetString(), Is.EqualTo("Line 3"));
        Assert.That(groupSheet.Cell(3, 5).GetString(), Is.EqualTo("Robot-Arm-2"));
    }
}
