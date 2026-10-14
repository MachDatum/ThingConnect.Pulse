using System.Globalization;
using ClosedXML.Excel;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Reports;

/// <summary>
/// Pure report-to-workbook layout for the availability report — no DB access, no maths beyond
/// combining already-computed metrics. Layout follows the ThingConnect EMS exports: a two-row merged
/// header (period label over its sub-columns), a block per period plus a trailing Total block, frozen
/// name columns/header rows, and dividers between blocks.
/// </summary>
public static class XlsxReportWriter
{
    public const double GoodUptimePct = 99.5;
    public const double WarnUptimePct = 95.0;

    private const int TitleRow = 1;
    private const int SubtitleRow = 2;
    private const int HeaderRow = 4;
    private const int SubHeaderRow = 5;
    private const int FirstDataRow = 6;
    private const int FixedColumns = 3;

    private static readonly XLColor HeaderFill = XLColor.FromHtml("#E8F0FE");
    private static readonly XLColor TotalHeaderFill = XLColor.FromHtml("#DCE9FE");
    private static readonly XLColor OverallFill = XLColor.FromHtml("#D9E2F3");
    private static readonly XLColor GroupFill = XLColor.FromHtml("#F2F5FA");
    private static readonly XLColor GoodFill = XLColor.FromHtml("#E2F0D9");
    private static readonly XLColor WarnFill = XLColor.FromHtml("#FFF2CC");
    private static readonly XLColor BadFill = XLColor.FromHtml("#F8D7DA");
    private static readonly XLColor MutedFont = XLColor.FromHtml("#808080");

    private static readonly string[] PeriodMetricHeaders = { "Uptime %", "Downtime (min)", "Down events", "Avg RTT (ms)" };
    private static readonly string[] TotalMetricHeaders =
        ["Uptime %", "Downtime (min)", "Down events", "Avg RTT (ms)", "MTTR", "MTBF", "Longest outage", "Coverage %"];

    private static readonly (string Title, Func<AvailabilityMetrics, double?> Value, string Format, bool IsUptime)[] HourlyTables =
    {
        ("Uptime %", m => m.UptimePct / 100.0, "0.00%", true),
        ("Downtime (min)", m => m.DowntimeMinutes, "0.0", false),
        ("Down events", m => m.HasData || m.DownEvents > 0 ? m.DownEvents : null, "0", false),
        ("Avg RTT (ms)", m => m.AvgRttMs, "0.0", false)
    };

    public static byte[] BuildAvailabilityWorkbook(AvailabilityReport report)
    {
        using var workbook = new XLWorkbook();

        BuildSummarySheet(workbook.Worksheets.Add("Summary"), report);

        if (report.Interval == ReportInterval.Hour)
        {
            BuildHourlySheets(workbook, report);
        }
        else
        {
            BuildPeriodSheet(workbook.Worksheets.Add("Availability"), report);
        }

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public static string IntervalLabel(ReportInterval interval) => interval switch
    {
        ReportInterval.Hour => "Hourly",
        ReportInterval.Day => "Daily",
        ReportInterval.Week => "Weekly",
        ReportInterval.Month => "Monthly",
        ReportInterval.Year => "Yearly",
        _ => interval.ToString()
    };

    public static string FormatDuration(double? seconds)
    {
        if (!seconds.HasValue)
        {
            return "—";
        }

        var span = TimeSpan.FromSeconds(Math.Round(seconds.Value));
        if (span.TotalDays >= 1)
        {
            return $"{(int)span.TotalDays}d {span.Hours}h {span.Minutes}m";
        }

        if (span.TotalHours >= 1)
        {
            return $"{(int)span.TotalHours}h {span.Minutes}m";
        }

        if (span.TotalMinutes >= 1)
        {
            return $"{(int)span.TotalMinutes}m {span.Seconds}s";
        }

        return $"{span.Seconds}s";
    }

    // ── Summary sheet ──────────────────────────────────────────────────────────────────────────
    private static void BuildSummarySheet(IXLWorksheet ws, AvailabilityReport report)
    {
        WriteTitle(ws, report, "Availability Summary", 6);

        List<ReportEndpointRow> endpoints = report.Groups.SelectMany(g => g.Endpoints).ToList();
        AvailabilityMetrics overall = report.Overall.Total;

        int row = HeaderRow;
        ws.Cell(row, 1).Value = "Metric";
        ws.Cell(row, 2).Value = "Value";
        StyleHeader(ws.Range(row, 1, row, 2));
        row++;

        void Kpi(string label, Action<IXLCell> write)
        {
            ws.Cell(row, 1).Value = label;
            write(ws.Cell(row, 2));
            ws.Cell(row, 2).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
            row++;
        }

        Kpi("Endpoints monitored", c => c.Value = endpoints.Count);
        Kpi("Groups", c => c.Value = report.Groups.Count);
        Kpi("Overall uptime", c => WriteUptime(c, overall));
        Kpi("Avg downtime per endpoint", c => c.Value = FormatDuration(AvailabilitySummaryDto.AverageDowntimeMinutes(endpoints) * 60));
        Kpi("Total downtime (all endpoints)", c => c.Value = FormatDuration(overall.DowntimeMinutes * 60));
        Kpi("Down events (outages)", c => c.Value = overall.DownEvents);
        Kpi("MTTR (mean time to recover)", c => c.Value = FormatDuration(overall.MttrSeconds));
        Kpi("MTBF (mean time between failures)", c => c.Value = FormatDuration(overall.MtbfSeconds));
        Kpi("Longest outage", c => c.Value = FormatDuration(overall.LongestOutageSeconds > 0 ? overall.LongestOutageSeconds : null));
        Kpi("Average response time", c => WriteNumber(c, overall.AvgRttMs, "0.0 \"ms\""));
        Kpi("Monitoring coverage", c => WritePercent(c, overall.CoveragePct, "0.0%"));
        Kpi("Endpoints with ≥ 1 outage", c => c.Value = endpoints.Count(e => e.Total.Outages > 0));
        Kpi("Endpoints currently DOWN", c => c.Value = endpoints.Count(e => e.CurrentStatus == "DOWN"));
        ApplyTableBorders(ws.Range(HeaderRow, 1, row - 1, 2));

        // By group
        row += 2;
        string[] groupHeaders =
            ["Group", "Endpoints", "Uptime %", "Downtime (min)", "Down events", "Avg RTT (ms)", "MTTR", "Longest outage", "Coverage %", "Least available endpoint"];
        WriteSectionTitle(ws, row++, "By group");
        int groupHeaderRow = row;
        WriteHeaderCells(ws, row++, groupHeaders);
        foreach (ReportGroupSection group in report.Groups)
        {
            AvailabilityMetrics t = group.Totals.Total;
            ReportEndpointRow? worst = group.Endpoints
                .Where(e => e.Total.HasData)
                .OrderBy(e => e.Total.UptimePct)
                .FirstOrDefault();

            ws.Cell(row, 1).Value = group.GroupName;
            ws.Cell(row, 2).Value = group.Endpoints.Count;
            WriteUptime(ws.Cell(row, 3), t);
            WriteNumber(ws.Cell(row, 4), t.DowntimeMinutes, "0.0");
            ws.Cell(row, 5).Value = t.DownEvents;
            WriteNumber(ws.Cell(row, 6), t.AvgRttMs, "0.0");
            ws.Cell(row, 7).Value = FormatDuration(t.MttrSeconds);
            ws.Cell(row, 8).Value = FormatDuration(t.LongestOutageSeconds > 0 ? t.LongestOutageSeconds : null);
            WritePercent(ws.Cell(row, 9), t.CoveragePct, "0.0%");
            ws.Cell(row, 10).Value = worst != null ? $"{worst.Name} ({worst.Total.UptimePct:0.00}%)" : "—";
            row++;
        }

        ApplyTableBorders(ws.Range(groupHeaderRow, 1, Math.Max(groupHeaderRow, row - 1), groupHeaders.Length));

        // Least available endpoints
        row += 2;
        string[] worstHeaders =
            ["Endpoint", "Group", "Host", "Status", "Uptime %", "Downtime (min)", "Down events", "Longest outage", "Coverage %"];
        WriteSectionTitle(ws, row++, "Least available endpoints (top 10)");
        int worstHeaderRow = row;
        WriteHeaderCells(ws, row++, worstHeaders);
        foreach (ReportEndpointRow e in endpoints.Where(e => e.Total.HasData).OrderBy(e => e.Total.UptimePct).ThenByDescending(e => e.Total.DownEvents).Take(10))
        {
            ws.Cell(row, 1).Value = e.Name;
            ws.Cell(row, 2).Value = e.GroupName;
            ws.Cell(row, 3).Value = e.Host;
            WriteStatus(ws.Cell(row, 4), e.CurrentStatus);
            WriteUptime(ws.Cell(row, 5), e.Total);
            WriteNumber(ws.Cell(row, 6), e.Total.DowntimeMinutes, "0.0");
            ws.Cell(row, 7).Value = e.Total.DownEvents;
            ws.Cell(row, 8).Value = FormatDuration(e.Total.LongestOutageSeconds > 0 ? e.Total.LongestOutageSeconds : null);
            WritePercent(ws.Cell(row, 9), e.Total.CoveragePct, "0.0%");
            row++;
        }

        ApplyTableBorders(ws.Range(worstHeaderRow, 1, Math.Max(worstHeaderRow, row - 1), worstHeaders.Length));

        // Definitions
        row += 2;
        WriteSectionTitle(ws, row++, "Definitions");
        string[] notes =
        {
            "Uptime % — share of monitored time the endpoint was up (from 15-minute rollups of every check).",
            "Downtime — monitored time the endpoint was down.",
            "Down events — outages that started in the period (an endpoint goes DOWN after 2 consecutive failed checks).",
            "MTTR — average duration of outages that started in the range and have recovered.",
            "MTBF — up time divided by the number of outages in the range.",
            "Longest outage — longest single outage within the range (ongoing outages count up to now).",
            "Coverage % — share of the period with monitoring data. Below 100% means Pulse was stopped, the endpoint was added later, or the data is older than the 15-minute rollup retention (365 days).",
            $"Uptime colours: green ≥ {GoodUptimePct}%, amber ≥ {WarnUptimePct}%, red below. Periods are local calendar periods; weeks start on Monday."
        };
        foreach (string note in notes)
        {
            ws.Cell(row, 1).Value = note;
            ws.Cell(row, 1).Style.Font.FontColor = MutedFont;
            row++;
        }

        ws.Column(1).Width = 36;
        ws.Columns(2, 10).AdjustToContents(HeaderRow, row);
        ws.Column(2).Width = Math.Max(ws.Column(2).Width, 18);
        ws.SheetView.FreezeRows(SubtitleRow);
    }

    // ── Day / week / month / year sheet ────────────────────────────────────────────────────────
    private static void BuildPeriodSheet(IXLWorksheet ws, AvailabilityReport report)
    {
        int periodCount = report.Periods.Count;
        int totalCol = FixedColumns + 1 + (periodCount * PeriodMetricHeaders.Length);
        int lastCol = totalCol + TotalMetricHeaders.Length - 1;

        WriteTitle(ws, report, $"Availability Report — {IntervalLabel(report.Interval)}", Math.Min(lastCol, 12));

        string[] fixedHeaders = { "Endpoint", "Host", "Status" };
        for (int i = 0; i < fixedHeaders.Length; i++)
        {
            ws.Cell(HeaderRow, i + 1).Value = fixedHeaders[i];
            ws.Range(HeaderRow, i + 1, SubHeaderRow, i + 1).Merge();
        }

        StyleHeader(ws.Range(HeaderRow, 1, SubHeaderRow, FixedColumns));

        for (int p = 0; p < periodCount; p++)
        {
            int col = PeriodColumn(p);
            WriteBlockHeader(ws, col, report.Periods[p].Label, PeriodMetricHeaders, HeaderFill);
        }

        WriteBlockHeader(ws, totalCol, "Total", TotalMetricHeaders, TotalHeaderFill);

        // Summary rows are shaded before their values are written, so the uptime colours written afterwards win.
        int row = FirstDataRow;
        StyleSummaryRow(ws.Range(row, 1, row, lastCol), OverallFill);
        WriteMetricsRow(ws, row++, "All endpoints", $"{report.Groups.Sum(g => g.Endpoints.Count)} endpoints", null, report.Overall, totalCol);

        var groupRows = new List<int>();
        foreach (ReportGroupSection group in report.Groups)
        {
            groupRows.Add(row);
            StyleSummaryRow(ws.Range(row, 1, row, lastCol), GroupFill);
            WriteMetricsRow(ws, row++, group.GroupName, $"{group.Endpoints.Count} endpoints", null, group.Totals, totalCol);

            foreach (ReportEndpointRow endpoint in group.Endpoints)
            {
                WriteMetricsRow(ws, row++, "  " + endpoint.Name, endpoint.Host, endpoint.CurrentStatus, endpoint, totalCol);
            }
        }

        int lastRow = Math.Max(FirstDataRow, row - 1);

        // Borders: outline, header/data divider, a divider before every block, and a line above each group.
        IXLRange table = ws.Range(HeaderRow, 1, lastRow, lastCol);
        table.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        ws.Range(SubHeaderRow, 1, SubHeaderRow, lastCol).Style.Border.BottomBorder = XLBorderStyleValues.Thin;
        ws.Range(HeaderRow, FixedColumns, lastRow, FixedColumns).Style.Border.RightBorder = XLBorderStyleValues.Thin;
        for (int p = 0; p <= periodCount; p++)
        {
            int blockStart = p < periodCount ? PeriodColumn(p) : totalCol;
            ws.Range(HeaderRow, blockStart, lastRow, blockStart).Style.Border.LeftBorder = XLBorderStyleValues.Thin;
        }

        foreach (int groupRow in groupRows)
        {
            ws.Range(groupRow, 1, groupRow, lastCol).Style.Border.TopBorder = XLBorderStyleValues.Thin;
        }

        ws.Column(1).Width = 34;
        ws.Column(2).Width = 18;
        ws.Column(3).Width = 9;
        for (int col = FixedColumns + 1; col <= lastCol; col++)
        {
            ws.Column(col).Width = col >= totalCol + 4 && col < totalCol + 7 ? 14 : 11;
        }

        ws.Row(SubHeaderRow).Style.Alignment.WrapText = true;
        ws.SheetView.Freeze(SubHeaderRow, FixedColumns);
    }

    private static int PeriodColumn(int periodIndex) => FixedColumns + 1 + (periodIndex * PeriodMetricHeaders.Length);

    private static void WriteBlockHeader(IXLWorksheet ws, int col, string label, string[] subHeaders, XLColor fill)
    {
        IXLRange top = ws.Range(HeaderRow, col, HeaderRow, col + subHeaders.Length - 1).Merge();
        top.FirstCell().Value = label;
        for (int i = 0; i < subHeaders.Length; i++)
        {
            ws.Cell(SubHeaderRow, col + i).Value = subHeaders[i];
        }

        IXLRange header = ws.Range(HeaderRow, col, SubHeaderRow, col + subHeaders.Length - 1);
        StyleHeader(header);
        header.Style.Fill.BackgroundColor = fill;
    }

    private static void WriteMetricsRow(IXLWorksheet ws, int row, string name, string host, string? status, ReportMetricsRow metrics, int totalCol)
    {
        ws.Cell(row, 1).Value = name;
        ws.Cell(row, 2).Value = host;
        if (status != null)
        {
            WriteStatus(ws.Cell(row, 3), status);
        }

        for (int p = 0; p < metrics.PerPeriod.Count; p++)
        {
            WritePeriodMetrics(ws, row, PeriodColumn(p), metrics.PerPeriod[p]);
        }

        AvailabilityMetrics t = metrics.Total;
        WritePeriodMetrics(ws, row, totalCol, t);
        ws.Cell(row, totalCol + 4).Value = FormatDuration(t.MttrSeconds);
        ws.Cell(row, totalCol + 5).Value = FormatDuration(t.MtbfSeconds);
        ws.Cell(row, totalCol + 6).Value = FormatDuration(t.LongestOutageSeconds > 0 ? t.LongestOutageSeconds : null);
        WritePercent(ws.Cell(row, totalCol + 7), t.CoveragePct, "0.0%");
        ws.Range(row, totalCol + 4, row, totalCol + 6).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
    }

    private static void WritePeriodMetrics(IXLWorksheet ws, int row, int col, AvailabilityMetrics m)
    {
        WriteUptime(ws.Cell(row, col), m);
        WriteNumber(ws.Cell(row, col + 1), m.DowntimeMinutes, "0.0");
        if (m.HasData || m.DownEvents > 0)
        {
            ws.Cell(row, col + 2).Value = m.DownEvents;
        }
        else
        {
            WriteMissing(ws.Cell(row, col + 2));
        }

        WriteNumber(ws.Cell(row, col + 3), m.AvgRttMs, "0.0");
    }

    private static void StyleSummaryRow(IXLRange range, XLColor fill)
    {
        range.Style.Font.Bold = true;
        range.Style.Fill.BackgroundColor = fill;
    }

    // ── Hourly pivot: one sheet per endpoint (plus all endpoints combined) ─────────────────────
    private static void BuildHourlySheets(XLWorkbook workbook, AvailabilityReport report)
    {
        var usedNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Summary" };

        BuildHourlySheet(
            workbook.Worksheets.Add(UniqueSheetName("All endpoints", usedNames)),
            report,
            "All endpoints",
            $"{report.Groups.Sum(g => g.Endpoints.Count)} endpoints",
            report.Overall);

        foreach (ReportEndpointRow endpoint in report.Groups.SelectMany(g => g.Endpoints))
        {
            BuildHourlySheet(
                workbook.Worksheets.Add(UniqueSheetName(endpoint.Name, usedNames)),
                report,
                endpoint.Name,
                $"{endpoint.Host} · {endpoint.GroupName} · currently {endpoint.CurrentStatus}",
                endpoint);
        }
    }

    private static void BuildHourlySheet(IXLWorksheet ws, AvailabilityReport report, string title, string subtitle, ReportMetricsRow metrics)
    {
        // Pivot the hourly periods into date × hour cells (Add, so a repeated DST hour merges instead of overwriting).
        var cells = new SortedDictionary<DateTime, AvailabilityMetrics[]>();
        for (int i = 0; i < report.Periods.Count; i++)
        {
            DateTime local = report.Periods[i].LocalStart;
            if (!cells.TryGetValue(local.Date, out AvailabilityMetrics[]? hours))
            {
                hours = Enumerable.Range(0, 24).Select(_ => new AvailabilityMetrics()).ToArray();
                cells[local.Date] = hours;
            }

            hours[local.Hour].Add(metrics.PerPeriod[i]);
        }

        const int lastCol = 26; // Date + 24 hours + Day
        ws.Cell(TitleRow, 1).Value = title;
        ws.Cell(TitleRow, 1).Style.Font.Bold = true;
        ws.Cell(TitleRow, 1).Style.Font.FontSize = 15;
        ws.Cell(SubtitleRow, 1).Value = string.Create(
            CultureInfo.InvariantCulture,
            $"{subtitle} · {report.FromDate:dd MMM yyyy} – {report.ToDate:dd MMM yyyy} · Hourly · {report.TimeZoneName}");
        ws.Cell(SubtitleRow, 1).Style.Font.FontColor = MutedFont;

        int row = HeaderRow;
        foreach ((string tableTitle, Func<AvailabilityMetrics, double?> value, string format, bool isUptime) in HourlyTables)
        {
            WriteSectionTitle(ws, row++, tableTitle);
            int headerRow = row;
            ws.Cell(row, 1).Value = "Date";
            for (int h = 0; h < 24; h++)
            {
                ws.Cell(row, h + 2).Value = $"{h:00}:00";
            }

            ws.Cell(row, lastCol).Value = "Day";
            StyleHeader(ws.Range(row, 1, row, lastCol));
            ws.Cell(row, lastCol).Style.Fill.BackgroundColor = TotalHeaderFill;
            row++;

            foreach ((DateTime date, AvailabilityMetrics[] hours) in cells)
            {
                ws.Cell(row, 1).Value = date.ToString("ddd dd MMM yyyy", CultureInfo.InvariantCulture);
                var day = new AvailabilityMetrics();
                for (int h = 0; h < 24; h++)
                {
                    day.Add(hours[h]);
                    WriteHourlyCell(ws.Cell(row, h + 2), hours[h], value, format, isUptime);
                }

                WriteHourlyCell(ws.Cell(row, lastCol), day, value, format, isUptime);
                ws.Cell(row, lastCol).Style.Font.Bold = true;
                row++;
            }

            ApplyTableBorders(ws.Range(headerRow, 1, Math.Max(headerRow, row - 1), lastCol));
            ws.Range(headerRow, lastCol, Math.Max(headerRow, row - 1), lastCol).Style.Border.LeftBorder = XLBorderStyleValues.Medium;
            row += 2;
        }

        ws.Column(1).Width = 18;
        ws.Columns(2, lastCol).Width = 8;
        ws.Column(lastCol).Width = 9;
        ws.SheetView.Freeze(SubtitleRow, 1);
    }

    private static void WriteHourlyCell(IXLCell cell, AvailabilityMetrics m, Func<AvailabilityMetrics, double?> value, string format, bool isUptime)
    {
        if (isUptime)
        {
            WriteUptime(cell, m);
        }
        else
        {
            WriteNumber(cell, value(m), format);
        }
    }

    // ── Shared cell helpers ────────────────────────────────────────────────────────────────────
    private static void WriteTitle(IXLWorksheet ws, AvailabilityReport report, string title, int mergeWidth)
    {
        ws.Cell(TitleRow, 1).Value = title;
        ws.Cell(TitleRow, 1).Style.Font.Bold = true;
        ws.Cell(TitleRow, 1).Style.Font.FontSize = 15;
        ws.Range(TitleRow, 1, TitleRow, Math.Max(1, mergeWidth)).Merge();

        ws.Cell(SubtitleRow, 1).Value = string.Create(
            CultureInfo.InvariantCulture,
            $"Report for {report.FromDate:dd MMM yyyy} to {report.ToDate:dd MMM yyyy} · {IntervalLabel(report.Interval)} · " +
            $"{report.TimeZoneName} · Generated {report.GeneratedAt.ToOffset(TimeZoneOffset(report)):dd MMM yyyy HH:mm}");
        ws.Cell(SubtitleRow, 1).Style.Font.FontColor = MutedFont;
        ws.Range(SubtitleRow, 1, SubtitleRow, Math.Max(1, mergeWidth)).Merge();
    }

    private static TimeSpan TimeZoneOffset(AvailabilityReport report)
    {
        ReportPeriod? first = report.Periods.FirstOrDefault();
        return first != null ? first.LocalStart - first.StartUtc.UtcDateTime : TimeSpan.Zero;
    }

    private static void WriteSectionTitle(IXLWorksheet ws, int row, string title)
    {
        ws.Cell(row, 1).Value = title;
        ws.Cell(row, 1).Style.Font.Bold = true;
        ws.Cell(row, 1).Style.Font.FontSize = 12;
    }

    private static void WriteHeaderCells(IXLWorksheet ws, int row, string[] headers)
    {
        for (int i = 0; i < headers.Length; i++)
        {
            ws.Cell(row, i + 1).Value = headers[i];
        }

        StyleHeader(ws.Range(row, 1, row, headers.Length));
    }

    private static void StyleHeader(IXLRange range)
    {
        range.Style.Font.Bold = true;
        range.Style.Fill.BackgroundColor = HeaderFill;
        range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
    }

    private static void ApplyTableBorders(IXLRange range)
    {
        range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        range.Style.Border.InsideBorder = XLBorderStyleValues.Hair;
    }

    private static void WriteUptime(IXLCell cell, AvailabilityMetrics m)
    {
        double? pct = m.UptimePct;
        if (!pct.HasValue)
        {
            WriteMissing(cell);
            return;
        }

        cell.Value = pct.Value / 100.0;
        cell.Style.NumberFormat.Format = "0.00%";
        cell.Style.Fill.BackgroundColor = pct.Value >= GoodUptimePct ? GoodFill : pct.Value >= WarnUptimePct ? WarnFill : BadFill;
    }

    private static void WritePercent(IXLCell cell, double? pct, string format)
    {
        if (!pct.HasValue)
        {
            WriteMissing(cell);
            return;
        }

        cell.Value = pct.Value / 100.0;
        cell.Style.NumberFormat.Format = format;
    }

    private static void WriteNumber(IXLCell cell, double? value, string format)
    {
        if (!value.HasValue)
        {
            WriteMissing(cell);
            return;
        }

        cell.Value = value.Value;
        cell.Style.NumberFormat.Format = format;
    }

    private static void WriteMissing(IXLCell cell)
    {
        cell.Value = "—";
        cell.Style.Font.FontColor = MutedFont;
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
    }

    private static void WriteStatus(IXLCell cell, string status)
    {
        cell.Value = status;
        cell.Style.Font.Bold = true;
        cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        cell.Style.Font.FontColor = status switch
        {
            "UP" => XLColor.FromHtml("#2E7D32"),
            "DOWN" => XLColor.FromHtml("#C62828"),
            _ => MutedFont
        };
    }

    private static string UniqueSheetName(string name, HashSet<string> used)
    {
        char[] invalid = { ':', '\\', '/', '?', '*', '[', ']' };
        string clean = new string(name.Select(c => invalid.Contains(c) ? '_' : c).ToArray()).Trim('\'').Trim();
        if (clean.Length == 0)
        {
            clean = "Endpoint";
        }

        string candidate = clean.Length > 31 ? clean[..31] : clean;
        for (int n = 2; !used.Add(candidate); n++)
        {
            string suffix = $" ({n})";
            candidate = (clean.Length + suffix.Length > 31 ? clean[..(31 - suffix.Length)] : clean) + suffix;
        }

        return candidate;
    }
}
