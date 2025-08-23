// ThingConnect Pulse - Database Seed Data for Testing (v1)
using Microsoft.EntityFrameworkCore;

namespace ThingConnect.Pulse.Server.Data;

public static class SeedData
{
    public static void Initialize(PulseDbContext context)
    {
        // Ensure database is created
        context.Database.EnsureCreated();

        // Check if data already exists
        if (context.Groups.Any())
        {
            return; // Database has been seeded
        }

        // Seed Groups
        var groups = new[]
        {
            new Group { Id = "servers", Name = "Servers", Color = "#2563eb" },
            new Group { Id = "network", Name = "Network Equipment", Color = "#059669" },
            new Group { Id = "services", Name = "Services", Color = "#dc2626" }
        };

        context.Groups.AddRange(groups);

        // Seed Endpoints
        var endpoints = new[]
        {
            new Endpoint
            {
                Id = Guid.NewGuid(),
                Name = "Google DNS",
                GroupId = "network",
                Type = ProbeType.icmp,
                Host = "8.8.8.8",
                IntervalSeconds = 30,
                TimeoutMs = 5000,
                Retries = 2,
                Enabled = true
            },
            new Endpoint
            {
                Id = Guid.NewGuid(),
                Name = "Google HTTPS",
                GroupId = "services",
                Type = ProbeType.http,
                Host = "www.google.com",
                Port = 443,
                HttpPath = "/",
                IntervalSeconds = 60,
                TimeoutMs = 10000,
                Retries = 2,
                Enabled = true
            },
            new Endpoint
            {
                Id = Guid.NewGuid(),
                Name = "Local SSH",
                GroupId = "servers",
                Type = ProbeType.tcp,
                Host = "localhost",
                Port = 22,
                IntervalSeconds = 60,
                TimeoutMs = 5000,
                Retries = 2,
                Enabled = false
            }
        };

        context.Endpoints.AddRange(endpoints);

        // Seed some test check results
        var now = DateTimeOffset.UtcNow;
        var checkResults = new List<CheckResultRaw>();

        foreach (var endpoint in endpoints)
        {
            for (int i = 0; i < 5; i++)
            {
                checkResults.Add(new CheckResultRaw
                {
                    EndpointId = endpoint.Id,
                    Ts = now.AddMinutes(-i * 5),
                    Status = i % 4 == 0 ? UpDown.down : UpDown.up,
                    RttMs = 10.5 + (i * 2.1)
                });
            }
        }

        context.CheckResultsRaw.AddRange(checkResults);

        // Seed Settings
        var settings = new[]
        {
            new Setting { K = "version", V = "1.0.0" },
            new Setting { K = "last_rollup_15m", V = now.ToString("O") },
            new Setting { K = "last_rollup_daily", V = DateOnly.FromDateTime(now.DateTime).ToString("yyyy-MM-dd") }
        };

        context.Settings.AddRange(settings);

        // Seed Config Version
        var configVersion = new ConfigVersion
        {
            Id = "test-config-001",
            AppliedTs = now,
            FileHash = "abcd1234",
            FilePath = @"C:\ProgramData\ThingConnect.Pulse\config.yaml",
            Actor = "system",
            Note = "Initial test configuration"
        };

        context.ConfigVersions.Add(configVersion);

        context.SaveChanges();
    }
}
