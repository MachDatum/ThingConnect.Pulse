using ClosedXML.Excel;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Reports;

/// <summary>
/// Pure DTO-to-workbook conversion for the XLSX reports — no DB access, no state.
/// </summary>
public static class XlsxReportWriter
{
    private static readonly string[] MachineHeaders = { "Machine", "Status", "Uptime", "Response", "Packet Loss", "Last Check", "Downtime" };
    private static readonly string[] GroupHeaders = { "Group", "Uptime %", "Avg RTT (ms)", "Down Events", "Worst Endpoint" };

    public static byte[] BuildMachineAvailabilityWorkbook(List<MachineAvailabilityRowDto> rows)
    {
        using var workbook = new XLWorkbook();
        IXLWorksheet sheet = workbook.Worksheets.Add("Detail");

        WriteHeaderRow(sheet, MachineHeaders);

        int row = 2;
        foreach (MachineAvailabilityRowDto r in rows)
        {
            sheet.Cell(row, 1).Value = r.MachineName;
            sheet.Cell(row, 2).Value = r.Status.ToUpperInvariant();
            sheet.Cell(row, 3).Value = r.UptimePct / 100.0;
            sheet.Cell(row, 3).Style.NumberFormat.Format = "0.00%";
            sheet.Cell(row, 4).Value = r.AvgRttMs.HasValue ? $"{r.AvgRttMs.Value:0} ms" : "—";
            sheet.Cell(row, 5).Value = r.PacketLossPct / 100.0;
            sheet.Cell(row, 5).Style.NumberFormat.Format = "0.00%";
            sheet.Cell(row, 6).Value = r.LastCheckTs.HasValue ? r.LastCheckTs.Value.LocalDateTime.ToString("HH:mm:ss") : "—";
            sheet.Cell(row, 7).Value = FormatDuration(r.DowntimeSeconds);
            row++;
        }

        sheet.Columns().AdjustToContents();

        row++;
        sheet.Cell(row, 1).Value =
            "* Packet Loss is a check-failure-rate proxy (100% − Uptime% for the period), not a true multi-echo loss ratio " +
            "— the prober sends one check per interval. Most meaningful for ICMP endpoints.";
        sheet.Range(row, 1, row, MachineHeaders.Length).Merge();
        sheet.Cell(row, 1).Style.Font.Italic = true;
        sheet.Cell(row, 1).Style.Font.FontSize = 9;

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public static byte[] BuildExecutiveSummaryWorkbook(ExecutiveSummaryDto summary)
    {
        using var workbook = new XLWorkbook();

        IXLWorksheet summarySheet = workbook.Worksheets.Add("Summary");
        summarySheet.Cell(1, 1).Value = "Metric";
        summarySheet.Cell(1, 2).Value = "Value";
        summarySheet.Row(1).Style.Font.Bold = true;

        (string Metric, string Value)[] metrics =
        {
            ("Report Period", $"{summary.PeriodFrom:yyyy-MM-dd} → {summary.PeriodTo:yyyy-MM-dd}"),
            ("Overall Uptime %", $"{summary.OverallUptimePct:0.00}%"),
            ("Total Down Events", summary.TotalDownEvents.ToString()),
            ("Total Downtime (hrs)", summary.TotalDowntimeHours.ToString("0.0")),
            ("Endpoints Monitored", summary.EndpointsMonitored.ToString()),
            ("Endpoints w/ ≥ 1 Outage", summary.EndpointsWithOutage.ToString())
        };

        for (int i = 0; i < metrics.Length; i++)
        {
            summarySheet.Cell(i + 2, 1).Value = metrics[i].Metric;
            summarySheet.Cell(i + 2, 2).Value = metrics[i].Value;
        }

        summarySheet.Columns().AdjustToContents();

        IXLWorksheet groupSheet = workbook.Worksheets.Add("By Group");
        WriteHeaderRow(groupSheet, GroupHeaders);

        int row = 2;
        foreach (GroupSummaryRowDto g in summary.ByGroup)
        {
            groupSheet.Cell(row, 1).Value = g.GroupName;
            groupSheet.Cell(row, 2).Value = g.UptimePct / 100.0;
            groupSheet.Cell(row, 2).Style.NumberFormat.Format = "0.00%";
            groupSheet.Cell(row, 3).Value = g.AvgRttMs.HasValue ? $"{g.AvgRttMs.Value:0}" : "—";
            groupSheet.Cell(row, 4).Value = g.DownEvents;
            groupSheet.Cell(row, 5).Value = g.WorstEndpointName ?? "—";
            row++;
        }

        groupSheet.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static void WriteHeaderRow(IXLWorksheet sheet, string[] headers)
    {
        for (int i = 0; i < headers.Length; i++)
        {
            sheet.Cell(1, i + 1).Value = headers[i];
        }

        sheet.Row(1).Style.Font.Bold = true;
    }

    private static string FormatDuration(long seconds)
    {
        if (seconds <= 0)
        {
            return "0 sec";
        }

        var span = TimeSpan.FromSeconds(seconds);
        if (span.TotalDays >= 1)
        {
            return $"{(int)span.TotalDays}d {span.Hours}h";
        }

        if (span.TotalHours >= 1)
        {
            return $"{(int)span.TotalHours}h {span.Minutes}m";
        }

        if (span.TotalMinutes >= 1)
        {
            return $"{(int)span.TotalMinutes} min";
        }

        return $"{span.Seconds} sec";
    }
}
