using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using NUnit.Framework;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services.Reports;

namespace ThingConnect.Pulse.Tests;

[TestFixture]
public class ReportDataServiceTests
{
    // Fixed +05:30 zone (no DST) so period boundaries are deterministic on any machine.
    private static readonly TimeZoneInfo Ist = TimeZoneInfo.CreateCustomTimeZone("IST", TimeSpan.FromMinutes(330), "IST", "IST");

    private static readonly DateOnly Sep1 = new(2026, 9, 1);
    private static readonly DateOnly Sep2 = new(2026, 9, 2);

    // Well after the test ranges, so coverage is not clipped unless a test sets Now explicitly.
    private static readonly DateTimeOffset Later = new(2026, 12, 1, 0, 0, 0, TimeSpan.Zero);

    private PulseDbContext _context = default!;
    private ReportDataService _service = default!;

    private Guid _plcId;
    private Guid _hmiId;
    private Guid _switchId;

    [SetUp]
    public void SetUp()
    {
        DbContextOptions<PulseDbContext> options = new DbContextOptionsBuilder<PulseDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new PulseDbContext(options);
        _service = new ReportDataService(_context, NullLogger<ReportDataService>.Instance);

        var line1 = new Group { Id = "line-1", Name = "Line 1", SortOrder = 1 };
        var network = new Group { Id = "network", Name = "Network", SortOrder = 2 };
        _context.Groups.AddRange(line1, network);

        _plcId = Guid.NewGuid();
        _hmiId = Guid.NewGuid();
        _switchId = Guid.NewGuid();

        _context.Endpoints.AddRange(
            NewEndpoint(_plcId, "PLC-01", line1.Id, "10.0.1.10", UpDown.up),
            NewEndpoint(_hmiId, "HMI-01", line1.Id, "10.0.1.20", UpDown.down),
            NewEndpoint(_switchId, "Core Switch", network.Id, "10.0.0.1", UpDown.up),
            new Endpoint
            {
                Id = Guid.NewGuid(), Name = "Disabled", GroupId = network.Id, Type = ProbeType.icmp, Host = "10.0.0.99",
                IntervalSeconds = 30, TimeoutMs = 2000, Retries = 1, Enabled = false
            });

        _context.SaveChanges();
    }

    [TearDown]
    public void TearDown() => _context.Dispose();

    // ── Period building ───────────────────────────────────────────────────────────────────────

    [Test]
    public void BuildPeriods_DailyUsesLocalMidnights()
    {
        List<ReportPeriod> periods = ReportDataService.BuildPeriods(Sep1, Sep2, ReportInterval.Day, Ist);

        Assert.That(periods, Has.Count.EqualTo(2));
        Assert.That(periods[0].Label, Is.EqualTo("01 Sep 2026"));
        Assert.That(periods[0].StartUtc, Is.EqualTo(new DateTimeOffset(2026, 8, 31, 18, 30, 0, TimeSpan.Zero)));
        Assert.That(periods[1].EndUtc, Is.EqualTo(new DateTimeOffset(2026, 9, 2, 18, 30, 0, TimeSpan.Zero)));
    }

    [Test]
    public void BuildPeriods_WeeklyStartsMondayAndClipsToRange()
    {
        // Wed 2 Sep .. Tue 15 Sep 2026
        List<ReportPeriod> periods = ReportDataService.BuildPeriods(new DateOnly(2026, 9, 2), new DateOnly(2026, 9, 15), ReportInterval.Week, Ist);

        Assert.That(periods.Select(p => p.LocalStart.Date), Is.EqualTo(new[]
        {
            new DateTime(2026, 9, 2), new DateTime(2026, 9, 7), new DateTime(2026, 9, 14)
        }));
        Assert.That(periods[0].Label, Is.EqualTo("02 Sep – 06 Sep 2026"));
        Assert.That(periods[2].Label, Is.EqualTo("14 Sep – 15 Sep 2026"));
    }

    [Test]
    public void BuildPeriods_MonthlyLabelsFullAndPartialMonths()
    {
        List<ReportPeriod> periods = ReportDataService.BuildPeriods(new DateOnly(2026, 8, 15), new DateOnly(2026, 10, 31), ReportInterval.Month, Ist);

        Assert.That(periods.Select(p => p.Label), Is.EqualTo(new[] { "15 Aug – 31 Aug 2026", "Sep 2026", "Oct 2026" }));
    }

    [Test]
    public void BuildPeriods_HourlyCoversEachLocalHour()
    {
        List<ReportPeriod> periods = ReportDataService.BuildPeriods(Sep1, Sep1, ReportInterval.Hour, Ist);

        Assert.That(periods, Has.Count.EqualTo(24));
        Assert.That(periods[0].LocalStart, Is.EqualTo(new DateTime(2026, 9, 1, 0, 0, 0)));
        Assert.That(periods[23].LocalStart.Hour, Is.EqualTo(23));
    }

    // ── Metrics ───────────────────────────────────────────────────────────────────────────────

    [Test]
    public async Task Daily_AttributesBucketsToLocalDayNotUtcDay()
    {
        // 2026-09-01 19:00 UTC is 2 Sep 00:30 IST — it must land on 2 Sep, not on the UTC date (1 Sep).
        AddRollup(_plcId, new DateTimeOffset(2026, 9, 1, 19, 0, 0, TimeSpan.Zero), 0);
        await _context.SaveChangesAsync();

        AvailabilityReport report = await RunAsync(Sep1, Sep2, ReportInterval.Day);
        ReportEndpointRow plc = Endpoint(report, "PLC-01");

        Assert.That(plc.PerPeriod[0].HasData, Is.False);
        Assert.That(plc.PerPeriod[1].UptimePct, Is.EqualTo(0));
    }

    [Test]
    public async Task UptimeAndDowntimeAreWeightedByMonitoredTime()
    {
        DateTimeOffset start = LocalMidnightUtc(Sep1);
        AddRollup(_plcId, start, 100);
        AddRollup(_plcId, start.AddMinutes(15), 100);
        AddRollup(_plcId, start.AddMinutes(30), 50, rtt: 10);
        AddRollup(_plcId, start.AddMinutes(45), 0, rtt: 30);
        await _context.SaveChangesAsync();

        AvailabilityReport report = await RunAsync(Sep1, Sep1, ReportInterval.Day);
        AvailabilityMetrics day = Endpoint(report, "PLC-01").PerPeriod[0];

        Assert.That(day.UptimePct, Is.EqualTo(62.5).Within(1e-9));
        Assert.That(day.DowntimeMinutes, Is.EqualTo(22.5).Within(1e-9));
        Assert.That(day.AvgRttMs, Is.EqualTo(20).Within(1e-9));
        Assert.That(day.CoveragePct, Is.EqualTo(100.0 * 4 / 96).Within(1e-9));
    }

    [Test]
    public async Task CoverageStopsAtNowForAPeriodInProgress()
    {
        DateTimeOffset start = LocalMidnightUtc(Sep1);
        for (int i = 0; i < 8; i++)
        {
            AddRollup(_plcId, start.AddMinutes(15 * i), 100);
        }

        await _context.SaveChangesAsync();

        // "Now" is 4 hours into the day: 16 buckets expected, 8 present.
        AvailabilityReport report = await RunAsync(Sep1, Sep1, ReportInterval.Day, now: start.AddHours(4));

        Assert.That(Endpoint(report, "PLC-01").PerPeriod[0].CoveragePct, Is.EqualTo(50).Within(1e-9));
    }

    [Test]
    public async Task OutagesDriveDownEventsMttrAndLongestOutage()
    {
        DateTimeOffset day1 = LocalMidnightUtc(Sep1);
        DateTimeOffset day2 = LocalMidnightUtc(Sep2);

        // Started before the range: not counted as an event, but its in-range part (2h) counts for "longest".
        AddOutage(_hmiId, day1.AddHours(-1), day1.AddHours(2));

        // Two resolved outages on day 1 (10 min, 30 min) and one ongoing outage on day 2.
        AddOutage(_hmiId, day1.AddHours(5), day1.AddHours(5).AddMinutes(10));
        AddOutage(_hmiId, day1.AddHours(9), day1.AddHours(9).AddMinutes(30));
        AddOutage(_hmiId, day2.AddHours(23), null);
        await _context.SaveChangesAsync();

        AvailabilityReport report = await RunAsync(Sep1, Sep2, ReportInterval.Day);
        ReportEndpointRow hmi = Endpoint(report, "HMI-01");

        Assert.That(hmi.PerPeriod[0].DownEvents, Is.EqualTo(2));
        Assert.That(hmi.PerPeriod[1].DownEvents, Is.EqualTo(1));
        Assert.That(hmi.Total.DownEvents, Is.EqualTo(3));
        Assert.That(hmi.Total.MttrSeconds, Is.EqualTo(20 * 60).Within(1e-9));
        Assert.That(hmi.Total.LongestOutageSeconds, Is.EqualTo(2 * 3600).Within(1e-9));
    }

    [Test]
    public async Task GroupAndOverallTotalsCombineEndpointsByTime()
    {
        DateTimeOffset start = LocalMidnightUtc(Sep1);
        AddRollup(_plcId, start, 100);
        AddRollup(_hmiId, start, 0);
        AddRollup(_hmiId, start.AddMinutes(15), 0);
        AddRollup(_switchId, start, 100);
        await _context.SaveChangesAsync();

        AvailabilityReport report = await RunAsync(Sep1, Sep1, ReportInterval.Day);

        // Line 1: 15 min up out of 45 min monitored; overall: 30 of 60.
        Assert.That(report.Groups.Select(g => g.GroupName), Is.EqualTo(new[] { "Line 1", "Network" }));
        Assert.That(report.Groups[0].Totals.Total.UptimePct, Is.EqualTo(100.0 / 3).Within(1e-9));
        Assert.That(report.Overall.Total.UptimePct, Is.EqualTo(50).Within(1e-9));
        Assert.That(report.Overall.PerPeriod[0].UptimePct, Is.EqualTo(50).Within(1e-9));
    }

    [Test]
    public async Task ExcludesDisabledEndpointsAndHonoursGroupFilter()
    {
        AvailabilityReport all = await RunAsync(Sep1, Sep1, ReportInterval.Day);
        AvailabilityReport network = await RunAsync(Sep1, Sep1, ReportInterval.Day, groupIds: new List<string> { "network" });

        Assert.That(all.Groups.SelectMany(g => g.Endpoints).Select(e => e.Name), Does.Not.Contain("Disabled"));
        Assert.That(all.Groups.SelectMany(g => g.Endpoints).Count(), Is.EqualTo(3));
        Assert.That(network.Groups.SelectMany(g => g.Endpoints).Select(e => e.Name), Is.EqualTo(new[] { "Core Switch" }));
    }

    [Test]
    public void RejectsInvalidRanges()
    {
        Assert.ThrowsAsync<ArgumentException>(() => RunAsync(Sep2, Sep1, ReportInterval.Day));
        Assert.ThrowsAsync<ArgumentException>(() => RunAsync(Sep1, Sep1.AddDays(ReportDataService.MaxHourlyDays), ReportInterval.Hour));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────────────────────

    private Task<AvailabilityReport> RunAsync(DateOnly from, DateOnly to, ReportInterval interval, DateTimeOffset? now = null, List<string>? groupIds = null)
        => _service.GetAvailabilityReportAsync(new AvailabilityReportRequest
        {
            FromDate = from,
            ToDate = to,
            Interval = interval,
            GroupIds = groupIds,
            TimeZone = Ist,
            Now = now ?? Later
        });

    private static ReportEndpointRow Endpoint(AvailabilityReport report, string name)
        => report.Groups.SelectMany(g => g.Endpoints).Single(e => e.Name == name);

    private static DateTimeOffset LocalMidnightUtc(DateOnly date)
        => new(TimeZoneInfo.ConvertTimeToUtc(date.ToDateTime(TimeOnly.MinValue), Ist), TimeSpan.Zero);

    private void AddRollup(Guid endpointId, DateTimeOffset bucket, double upPct, double? rtt = null)
        => _context.Rollups15m.Add(new Rollup15m { EndpointId = endpointId, BucketTs = bucket.ToUnixTimeSeconds(), UpPct = upPct, AvgRttMs = rtt });

    private void AddOutage(Guid endpointId, DateTimeOffset started, DateTimeOffset? ended)
        => _context.Outages.Add(new Outage
        {
            EndpointId = endpointId,
            StartedTs = started.ToUnixTimeSeconds(),
            EndedTs = ended?.ToUnixTimeSeconds(),
            DurationSeconds = ended.HasValue ? (int)(ended.Value - started).TotalSeconds : null
        });

    private static Endpoint NewEndpoint(Guid id, string name, string groupId, string host, UpDown status) => new()
    {
        Id = id,
        Name = name,
        GroupId = groupId,
        Type = ProbeType.icmp,
        Host = host,
        IntervalSeconds = 30,
        TimeoutMs = 2000,
        Retries = 1,
        Enabled = true,
        LastStatus = status
    };
}
