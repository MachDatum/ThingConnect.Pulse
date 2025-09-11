using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;

namespace ThingConnect.Pulse.Server.Services.Prune;

/// <summary>
/// Service for pruning old raw data while preserving rollups
/// </summary>
public sealed class PruneService : IPruneService
{
    private readonly PulseDbContext _db;
    private readonly ISettingsService _settingsService;
    private readonly ILogger<PruneService> _logger;

    private const string RetentionDaysKey = "prune.retentionDays";
    private const int DefaultRetentionDays = 60;

    public PruneService(
        PulseDbContext db,
        ISettingsService settingsService,
        ILogger<PruneService> logger)
    {
        _db = db;
        _settingsService = settingsService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<int> PruneRawDataAsync(bool dryRun = false, CancellationToken cancellationToken = default)
    {
        int retentionDays = await GetRetentionDaysAsync(cancellationToken);
        long cutoffDate = UnixTimestamp.Subtract(UnixTimestamp.Now(), TimeSpan.FromDays(retentionDays));

        _logger.LogInformation(
            "Starting raw data prune (dryRun={DryRun}) with {RetentionDays}d retention. Cutoff: {CutoffDate}",
            dryRun, retentionDays, UnixTimestamp.FromUnixSeconds(cutoffDate));

        try
        {
            if (dryRun)
            {
                // Count records that would be deleted
                // Load all data and filter in-memory for SQLite compatibility
                List<long> allRecords = await _db.CheckResultsRaw
                    .Select(c => c.Ts)
                    .ToListAsync(cancellationToken);

                int countToDelete = allRecords.Count(ts => ts < cutoffDate);

                _logger.LogInformation(
                    "DRY RUN: Would delete {Count} raw check results older than {CutoffDate} (out of {Total})",
                    countToDelete, UnixTimestamp.FromUnixSeconds(cutoffDate), allRecords.Count);

                return countToDelete;
            }
            else
            {
                // Use EF Core 7+ ExecuteDeleteAsync for optimal bulk delete performance
                int totalDeleted = await _db.CheckResultsRaw
                    .Where(c => c.Ts < cutoffDate)
                    .ExecuteDeleteAsync(cancellationToken);

                // Analyze database after large deletion to optimize query planner
                if (totalDeleted > 10000)
                {
                    await _db.Database.ExecuteSqlRawAsync("ANALYZE check_result_raw", cancellationToken);
                    _logger.LogInformation("Analyzed check_result_raw table after deleting {Count} records", totalDeleted);
                }

                _logger.LogInformation(
                    "Successfully deleted {TotalDeleted} raw check results older than {CutoffDate}",
                    totalDeleted, UnixTimestamp.FromUnixSeconds(cutoffDate));

                return totalDeleted;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during raw data prune operation (dryRun={DryRun})", dryRun);
            throw;
        }
    }

    /// <inheritdoc />
    public async Task<int> GetRetentionDaysAsync(CancellationToken cancellationToken = default)
    {
        string? setting = await _settingsService.GetAsync(RetentionDaysKey);

        if (setting == null)
        {
            // Set default value if not configured
            await SetRetentionDaysAsync(DefaultRetentionDays, cancellationToken);
            return DefaultRetentionDays;
        }

        if (int.TryParse(setting, out int days) && days > 0)
        {
            return days;
        }

        _logger.LogWarning(
            "Invalid retention days setting: {Value}. Using default: {DefaultDays}",
            setting, DefaultRetentionDays);

        return DefaultRetentionDays;
    }

    /// <inheritdoc />
    public async Task SetRetentionDaysAsync(int days, CancellationToken cancellationToken = default)
    {
        if (days <= 0)
        {
            throw new ArgumentException("Retention days must be greater than 0", nameof(days));
        }

        await _settingsService.SetAsync(RetentionDaysKey, days.ToString());

        _logger.LogInformation("Set raw data retention period to {Days} days", days);
    }
}