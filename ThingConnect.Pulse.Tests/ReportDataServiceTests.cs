using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using NUnit.Framework;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services.Reports;

namespace ThingConnect.Pulse.Tests;

[TestFixture]
public class ReportDataServiceTests
{
    private static readonly DateTimeOffset From = new(2026, 9, 1, 0, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset To = new(2026, 9, 3, 0, 0, 0, TimeSpan.Zero);

    private PulseDbContext _context = default!;
    private ReportDataService _service = default!;

    private Guid _epUpId;
    private Guid _epDegradedId;
    private Guid _epDownId;

    [SetUp]
    public void SetUp()
    {
        DbContextOptions<PulseDbContext> options = new DbContextOptionsBuilder<PulseDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new PulseDbContext(options);
        _service = new ReportDataService(_context, NullLogger<ReportDataService>.Instance);

        SeedData();
    }

    [TearDown]
    public void TearDown()
    {
        _context.Dispose();
    }

    private void SeedData()
    {
        var groupLine1 = new Group { Id = "line-1", Name = "Line 1" };
        var groupLine2 = new Group { Id = "line-2", Name = "Line 2" };
        _context.Groups.AddRange(groupLine1, groupLine2);

        _epUpId = Guid.NewGuid();
        _epDegradedId = Guid.NewGuid();
        _epDownId = Guid.NewGuid();

        var epUp = new Endpoint
        {
            Id = _epUpId,
            Name = "EP-UP",
            GroupId = groupLine1.Id,
            Type = ProbeType.icmp,
            Host = "10.0.0.1",
            IntervalSeconds = 30,
            TimeoutMs = 2000,
            Retries = 2,
            Enabled = true,
            ExpectedRttMs = 20,
            LastStatus = UpDown.up
        };

        var epDegraded = new Endpoint
        {
            Id = _epDegradedId,
            Name = "EP-DEGRADED",
            GroupId = groupLine1.Id,
            Type = ProbeType.icmp,
            Host = "10.0.0.2",
            IntervalSeconds = 30,
            TimeoutMs = 2000,
            Retries = 2,
            Enabled = true,
            ExpectedRttMs = 10,
            LastStatus = UpDown.up
        };

        var epDown = new Endpoint
        {
            Id = _epDownId,
            Name = "EP-DOWN",
            GroupId = groupLine2.Id,
            Type = ProbeType.tcp,
            Port = 502,
            Host = "10.0.0.3",
            IntervalSeconds = 30,
            TimeoutMs = 2000,
            Retries = 2,
            Enabled = true,
            LastStatus = UpDown.down
        };

        _context.Endpoints.AddRange(epUp, epDegraded, epDown);

        long day1 = UnixTimestamp.ToUnixDate(DateOnly.FromDateTime(From.Date));
        long day2 = UnixTimestamp.ToUnixDate(DateOnly.FromDateTime(From.Date.AddDays(1)));

        _context.RollupsDaily.AddRange(
            new RollupDaily { EndpointId = _epUpId, BucketDate = day1, UpPct = 100, AvgRttMs = 8, DownEvents = 0 },
            new RollupDaily { EndpointId = _epUpId, BucketDate = day2, UpPct = 99, AvgRttMs = 9, DownEvents = 1 },
            new RollupDaily { EndpointId = _epDegradedId, BucketDate = day1, UpPct = 100, AvgRttMs = 48, DownEvents = 0 },
            new RollupDaily { EndpointId = _epDegradedId, BucketDate = day2, UpPct = 97.4, AvgRttMs = 50, DownEvents = 2 },
            new RollupDaily { EndpointId = _epDownId, BucketDate = day1, UpPct = 80, AvgRttMs = null, DownEvents = 3 },
            new RollupDaily { EndpointId = _epDownId, BucketDate = day2, UpPct = 60, AvgRttMs = null, DownEvents = 2 });

        long fromUnix = UnixTimestamp.ToUnixSeconds(From);
        long toUnix = UnixTimestamp.ToUnixSeconds(To);

        // Fully contained outage: 8 minutes (480s) on day 1.
        _context.Outages.Add(new Outage
        {
            EndpointId = _epDownId,
            StartedTs = day1 + (8 * 3600),
            EndedTs = day1 + (8 * 3600) + 480
        });

        // Ongoing outage starting 100s before the report window ends — clipped to `to`, not `now`.
        _context.Outages.Add(new Outage
        {
            EndpointId = _epDegradedId,
            StartedTs = toUnix - 100,
            EndedTs = null
        });

        _context.SaveChanges();
    }

    [Test]
    public async Task GetMachineAvailabilityAsync_ClassifiesUpDegradedDown()
    {
        List<MachineAvailabilityRowDto> rows = await _service.GetMachineAvailabilityAsync(From, To, null);

        MachineAvailabilityRowDto up = rows.Single(r => r.EndpointId == _epUpId);
        MachineAvailabilityRowDto degraded = rows.Single(r => r.EndpointId == _epDegradedId);
        MachineAvailabilityRowDto down = rows.Single(r => r.EndpointId == _epDownId);

        Assert.That(up.Status, Is.EqualTo("up"));
        Assert.That(up.UptimePct, Is.EqualTo(99.5).Within(0.01));
        Assert.That(up.PacketLossPct, Is.EqualTo(0.5).Within(0.01));

        Assert.That(degraded.Status, Is.EqualTo("degraded"), "up but period AvgRttMs (49) breaches ExpectedRttMs (10)");
        Assert.That(degraded.AvgRttMs, Is.EqualTo(49).Within(0.01));

        Assert.That(down.Status, Is.EqualTo("down"), "LastStatus=down always reports down regardless of RTT/uptime");
        Assert.That(down.AvgRttMs, Is.Null, "no RTT samples in the period");
    }

    [Test]
    public async Task GetMachineAvailabilityAsync_ClipsOutageDurationToReportWindow()
    {
        List<MachineAvailabilityRowDto> rows = await _service.GetMachineAvailabilityAsync(From, To, null);

        MachineAvailabilityRowDto down = rows.Single(r => r.EndpointId == _epDownId);
        MachineAvailabilityRowDto degraded = rows.Single(r => r.EndpointId == _epDegradedId);

        Assert.That(down.DowntimeSeconds, Is.EqualTo(480), "fully-contained 8-minute outage");
        Assert.That(degraded.DowntimeSeconds, Is.EqualTo(100), "ongoing outage clipped to the 'to' bound, not 'now'");
    }

    [Test]
    public async Task GetMachineAvailabilityAsync_FiltersByGroup()
    {
        List<MachineAvailabilityRowDto> rows = await _service.GetMachineAvailabilityAsync(From, To, new List<string> { "line-2" });

        Assert.That(rows, Has.Count.EqualTo(1));
        Assert.That(rows[0].EndpointId, Is.EqualTo(_epDownId));
    }

    [Test]
    public async Task GetExecutiveSummaryAsync_AggregatesOrgWideTotals()
    {
        ExecutiveSummaryDto summary = await _service.GetExecutiveSummaryAsync(From, To, null);

        Assert.That(summary.EndpointsMonitored, Is.EqualTo(3));
        Assert.That(summary.EndpointsWithOutage, Is.EqualTo(2), "EP-DOWN and EP-DEGRADED both have downtime > 0");
        Assert.That(summary.TotalDownEvents, Is.EqualTo(1 + 2 + 5));
        Assert.That(summary.TotalDowntimeHours, Is.EqualTo((480 + 100) / 3600.0).Within(0.01));
        Assert.That(summary.OverallUptimePct, Is.EqualTo((99.5 + 98.7 + 70) / 3.0).Within(0.01));
    }

    [Test]
    public async Task GetExecutiveSummaryAsync_ByGroupPicksWorstEndpointPerGroup()
    {
        ExecutiveSummaryDto summary = await _service.GetExecutiveSummaryAsync(From, To, null);

        GroupSummaryRowDto line1 = summary.ByGroup.Single(g => g.GroupName == "Line 1");
        GroupSummaryRowDto line2 = summary.ByGroup.Single(g => g.GroupName == "Line 2");

        Assert.That(line1.WorstEndpointName, Is.EqualTo("EP-DEGRADED"), "lower uptime (98.7) than EP-UP (99.5)");
        Assert.That(line1.DownEvents, Is.EqualTo(1 + 2));

        Assert.That(line2.WorstEndpointName, Is.EqualTo("EP-DOWN"));
        Assert.That(line2.AvgRttMs, Is.Null, "no RTT samples for this endpoint in the period");
    }

    [Test]
    public void GetMachineAvailabilityAsync_ThrowsWhenFromIsNotBeforeTo()
    {
        Assert.ThrowsAsync<ArgumentException>(async () => await _service.GetMachineAvailabilityAsync(To, From, null));
    }
}
