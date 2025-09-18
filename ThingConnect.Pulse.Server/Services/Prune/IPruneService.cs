namespace ThingConnect.Pulse.Server.Services.Prune;

/// <summary>
/// Service for pruning old raw data while preserving rollups.
/// </summary>
public interface IPruneService
{
    /// <summary>
    /// Prune raw check results older than the configured retention period.
    /// </summary>
    /// <param name="dryRun">If true, only count records that would be deleted without actually deleting them.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Number of records deleted (or would be deleted in dry-run mode).</returns>
    Task<int> PruneRawDataAsync(bool dryRun = false, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get the current retention period in days.
    /// </summary>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Retention period in days (default: 60).</returns>
    Task<int> GetRetentionDaysAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Set the retention period in days.
    /// </summary>
    /// <param name="days">Number of days to retain raw data.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
    Task SetRetentionDaysAsync(int days, CancellationToken cancellationToken = default);
}
