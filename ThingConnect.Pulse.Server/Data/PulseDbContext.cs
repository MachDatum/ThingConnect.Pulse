// ThingConnect Pulse - EF Core DbContext (v1)
namespace ThingConnect.Pulse.Server.Data;

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
        bool isSqlite = Database.ProviderName?.Contains("Sqlite", StringComparison.OrdinalIgnoreCase) == true;
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
            {
                e.HasIndex(x => new { x.EndpointId, x.Ts })
                 .HasDatabaseName("ix_raw_down_only")
                 .HasFilter("status = 'down'");
            }
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
            if (isSqlite)
            {
                e.Property(x => x.BucketDate).HasConversion(dateOnlyToString);
            }

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
