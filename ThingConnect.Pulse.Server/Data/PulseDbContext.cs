// ThingConnect Pulse - EF Core DbContext (v1)
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ThingConnect.Pulse.Server.Data;

public sealed class PulseDbContext : IdentityDbContext<ApplicationUser>
{
    public DbSet<Group> Groups => Set<Group>();
    public DbSet<Endpoint> Endpoints => Set<Endpoint>();
    public DbSet<CheckResultRaw> CheckResultsRaw => Set<CheckResultRaw>();
    public DbSet<Outage> Outages => Set<Outage>();
    public DbSet<Rollup15m> Rollups15m => Set<Rollup15m>();
    public DbSet<RollupDaily> RollupsDaily => Set<RollupDaily>();
    public DbSet<Setting> Settings => Set<Setting>();
    public DbSet<ConfigVersion> ConfigVersions => Set<ConfigVersion>();
    public DbSet<MonitoringSession> MonitoringSessions => Set<MonitoringSession>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<NotificationFetch> NotificationFetches => Set<NotificationFetch>();

    public PulseDbContext(DbContextOptions<PulseDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        bool isSqlite = Database.ProviderName?.Contains("Sqlite", StringComparison.OrdinalIgnoreCase) == true;

        b.Entity<ApplicationUser>(e =>
        {
            e.Property(x => x.Role).IsRequired().HasMaxLength(50);
            e.Property(x => x.IsActive).HasDefaultValue(true);
            e.HasIndex(x => x.Role);
            e.HasIndex(x => x.IsActive);
        });

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

            // New Fallback fields
            e.Property(x => x.FallbackAttempted);
            e.Property(x => x.FallbackStatus).HasConversion<string>();
            e.Property(x => x.FallbackRttMs).HasColumnType("double precision");
            e.Property(x => x.FallbackError);

            // Classification field
            e.Property(x => x.Classification)
            .HasConversion<int?>();

            e.HasIndex(x => new { x.EndpointId, x.Ts });
        });

        b.Entity<Outage>(e =>
        {
            e.ToTable("outage");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.EndpointId, x.StartedTs });
            e.HasIndex(x => new { x.EndpointId, x.EndedTs });

            // New Classification field
            e.Property(x => x.Classification)
            .HasConversion<int?>();
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

        b.Entity<MonitoringSession>(e =>
        {
            e.ToTable("monitoring_session");
            e.HasKey(x => x.Id);
            e.Property(x => x.ShutdownReason).HasMaxLength(200);
            e.Property(x => x.Version).HasMaxLength(50);
            e.HasIndex(x => x.StartedTs);
            e.HasIndex(x => x.EndedTs);
        });

        b.Entity<Notification>(e =>
        {
            e.ToTable("notification");
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.Property(x => x.Type).HasConversion<string>().IsRequired();
            e.Property(x => x.Priority).HasConversion<string>().IsRequired();
            e.Property(x => x.Title).IsRequired().HasMaxLength(200);
            e.Property(x => x.Message).IsRequired().HasMaxLength(1000);
            e.Property(x => x.ActionUrl).HasMaxLength(512);
            e.Property(x => x.ActionText).HasMaxLength(100);
            e.Property(x => x.TargetVersions).HasMaxLength(200);
            e.HasIndex(x => x.ValidFromTs);
            e.HasIndex(x => x.ValidUntilTs);
            e.HasIndex(x => new { x.IsRead, x.ValidFromTs });
            e.HasIndex(x => new { x.Priority, x.ValidFromTs });
        });

        b.Entity<NotificationFetch>(e =>
        {
            e.ToTable("notification_fetch");
            e.HasKey(x => x.Id);
            e.Property(x => x.RemoteVersion).IsRequired().HasMaxLength(50);
            e.Property(x => x.RemoteLastUpdated).IsRequired().HasMaxLength(50);
            e.Property(x => x.Error).HasMaxLength(500);
            e.HasIndex(x => x.FetchTs);
            e.HasIndex(x => x.Success);
        });
    }
}
