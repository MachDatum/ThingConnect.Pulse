using ThingConnect.Pulse.Server.Data;

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
        DateTimeOffset cutoffDate = DateTimeOffset.UtcNow.AddDays(-retentionDays);

        _logger.LogInformation(
            "Starting raw data prune (dryRun={DryRun}) with {RetentionDays}d retention. Cutoff: {CutoffDate}",
            dryRun, retentionDays, cutoffDate);

        try
        {
            if (dryRun)
            {
                // Count records that would be deleted
                // Load all data and filter in-memory for SQLite compatibility
                var allRecords = await _db.CheckResultsRaw
                    .Select(c => c.Ts)
                    .ToListAsync(cancellationToken);

                int countToDelete = allRecords.Count(ts => ts < cutoffDate);

                _logger.LogInformation(
                    "DRY RUN: Would delete {Count} raw check results older than {CutoffDate} (out of {Total})",
                    countToDelete, cutoffDate, allRecords.Count);

                return countToDelete;
            }
            else
            {
                // For actual deletion, load records in batches and delete client-side
                int batchSize = 1000;
                int totalDeleted = 0;

                while (true)
                {
                    // Load a batch of records with their IDs to avoid EF tracking issues
                    var batch = await _db.CheckResultsRaw
                        .Select(c => new { c.Id, c.Ts })
                        .Take(batchSize)
                        .ToListAsync(cancellationToken);

                    if (batch.Count == 0)
                    {
                        break;
                    }

                    // Filter client-side to find records older than cutoff
                    var idsToDelete = batch
                        .Where(r => r.Ts < cutoffDate)
                        .Select(r => r.Id)
                        .ToList();

                    if (idsToDelete.Count == 0)
                    {
                        // If no records in this batch need deletion, we're done
                        break;
                    }

                    // Delete the filtered records
                    await _db.Database.ExecuteSqlRawAsync(
                        "DELETE FROM check_result_raw WHERE Id IN ({0})",
                        cancellationToken,
                        string.Join(",", idsToDelete));

                    totalDeleted += idsToDelete.Count;

                    _logger.LogDebug("Deleted batch of {Count} raw check results", idsToDelete.Count);

                    // Small delay between batches to avoid blocking other operations
                    if (batch.Count == batchSize)
                    {
                        await Task.Delay(100, cancellationToken);
                    }
                }

                _logger.LogInformation(
                    "Successfully deleted {TotalDeleted} raw check results older than {CutoffDate}",
                    totalDeleted, cutoffDate);

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