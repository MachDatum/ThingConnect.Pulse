// ThingConnect Pulse - EF Core Entities & DbContext (v1)
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;

public enum ProbeType { icmp, tcp, http }
public enum UpDown { up, down }

public record GroupVm(string Id, string Name, string? ParentId, string? Color);
public record EndpointVm(Guid Id, string Name, GroupVm Group, ProbeType Type, string Host,
                         int? Port, string? HttpPath, string? HttpMatch,
                         int IntervalSeconds, int TimeoutMs, int Retries, bool Enabled);

public sealed class Group
{
    public string Id { get; set; } = default!;
    public string Name { get; set; } = default!;
    public string? ParentId { get; set; }
    public string? Color { get; set; }
    public int? SortOrder { get; set; }
    public ICollection<Endpoint> Endpoints { get; set; } = new List<Endpoint>();
}

public sealed class Endpoint
{
    public Guid Id { get; set; }
    public string Name { get; set; } = default!;
    public string GroupId { get; set; } = default!;
    public Group Group { get; set; } = default!;
    public ProbeType Type { get; set; }
    public string Host { get; set; } = default!;
    public int? Port { get; set; }
    public string? HttpPath { get; set; }
    public string? HttpMatch { get; set; }
    public int IntervalSeconds { get; set; }
    public int TimeoutMs { get; set; }
    public int Retries { get; set; }
    public int? ExpectedRttMs { get; set; }
    public bool Enabled { get; set; } = true;
    public string? Notes { get; set; }
    public DateTimeOffset? LastChangeTs { get; set; }
    public UpDown? LastStatus { get; set; }
    public double? LastRttMs { get; set; }
}

public sealed class CheckResultRaw
{
    public long Id { get; set; }
    public Guid EndpointId { get; set; }
    public Endpoint Endpoint { get; set; } = default!;
    public DateTimeOffset Ts { get; set; }
    public UpDown Status { get; set; }
    public double? RttMs { get; set; }
    public string? Error { get; set; }
}

public sealed class Outage
{
    public long Id { get; set; }
    public Guid EndpointId { get; set; }
    public Endpoint Endpoint { get; set; } = default!;
    public DateTimeOffset StartedTs { get; set; }
    public DateTimeOffset? EndedTs { get; set; }
    public int? DurationSeconds { get; set; }
    public string? LastError { get; set; }
}

public sealed class Rollup15m
{
    public Guid EndpointId { get; set; }
    public Endpoint Endpoint { get; set; } = default!;
    public DateTimeOffset BucketTs { get; set; }
    public double UpPct { get; set; }
    public double? AvgRttMs { get; set; }
    public int DownEvents { get; set; }
}

public sealed class RollupDaily
{
    public Guid EndpointId { get; set; }
    public Endpoint Endpoint { get; set; } = default!;
    public DateOnly BucketDate { get; set; }
    public double UpPct { get; set; }
    public double? AvgRttMs { get; set; }
    public int DownEvents { get; set; }
}

public sealed class Setting
{
    public string K { get; set; } = default!;
    public string V { get; set; } = default!;
}

public sealed class ConfigVersion
{
    public string Id { get; set; } = default!;
    public DateTimeOffset AppliedTs { get; set; }
    public string FileHash { get; set; } = default!;
    public string FilePath { get; set; } = default!;
    public string? Actor { get; set; }
    public string? Note { get; set; }
}

public sealed class PulseDbContext : DbContext
{
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Endpoint> Endpoints => Set<Endpoint>();
    public DbSet<CheckResultRaw> CheckResultsRaw => Set<CheckResultRaw>();
    public DbSet<Outage> Outages => Set<Outage>();
    public DbSet<Rollup15m> Rollups15m => Set<Rollup15m>();
    public DbSet<RollupDaily> RollupsDaily => Set<RollupDaily>();
    public DbSet<Setting> Settings => Set<Setting>();
    public DbSet<ConfigVersion> ConfigVersions => Set<ConfigVersion>();

    public PulseDbContext(DbContextOptions<PulseDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder b)
    {
        var isSqlite = Database.ProviderName?.Contains("Sqlite", StringComparison.OrdinalIgnoreCase) == true;
        var dateOnlyToString = new ValueConverter<DateOnly, string>(d => d.ToString("yyyy-MM-dd"), s => DateOnly.Parse(s));

        b.Entity<Group>(e =>
        {
            e.ToTable("group");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.Property(x => x.Color).HasMaxLength(7);
            e.HasMany(x => x.Endpoints).WithOne(x => x.Group).HasForeignKey(x => x.GroupId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Endpoint>(e =>
        {
            e.ToTable("endpoint");
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.Property(x => x.GroupId).IsRequired().HasMaxLength(64);
            e.Property(x => x.Type).HasConversion<string>().IsRequired();
            e.Property(x => x.Host).IsRequired().HasMaxLength(253);
            e.Property(x => x.HttpPath).HasMaxLength(512);
            e.Property(x => x.HttpMatch).HasMaxLength(256);
            e.HasIndex(x => new { x.GroupId, x.Name });
            e.HasIndex(x => x.Host);
        });

        b.Entity<CheckResultRaw>(e =>
        {
            e.ToTable("check_result_raw");
            e.HasKey(x => x.Id);
            e.Property(x => x.Status).HasConversion<string>().IsRequired();
            e.Property(x => x.RttMs).HasColumnType("double precision");
            e.HasIndex(x => new { x.EndpointId, x.Ts });
            if (!isSqlite)
                e.HasIndex(x => new { x.EndpointId, x.Ts })
                 .HasDatabaseName("ix_raw_down_only")
                 .HasFilter("status = 'down'");
        });

        b.Entity<Outage>(e =>
        {
            e.ToTable("outage");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.EndpointId, x.StartedTs });
            e.HasIndex(x => new { x.EndpointId, x.EndedTs });
        });

        b.Entity<Rollup15m>(e =>
        {
            e.ToTable("rollup_15m");
            e.HasKey(x => new { x.EndpointId, x.BucketTs });
            e.HasIndex(x => x.BucketTs);
            e.Property(x => x.AvgRttMs).HasColumnType("double precision");
        });

        b.Entity<RollupDaily>(e =>
        {
            e.ToTable("rollup_daily");
            e.HasKey(x => new { x.EndpointId, x.BucketDate });
            if (isSqlite) e.Property(x => x.BucketDate).HasConversion(dateOnlyToString);
            e.HasIndex(x => x.BucketDate);
            e.Property(x => x.AvgRttMs).HasColumnType("double precision");
        });

        b.Entity<Setting>(e =>
        {
            e.ToTable("setting");
            e.HasKey(x => x.K);
            e.Property(x => x.K).HasMaxLength(100);
        });

        b.Entity<ConfigVersion>(e =>
        {
            e.ToTable("config_version");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(40);
            e.HasIndex(x => x.AppliedTs);
        });
    }
}
