namespace ThingConnect.Pulse.Server.Services.Rollup;

/// <summary>
/// Service for computing data rollups from raw check results.
/// </summary>
public interface IRollupService
{
    /// <summary>
    /// Process 15-minute rollups from raw check results since last watermark.
    /// </summary>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
    Task ProcessRollup15mAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Process daily rollups from raw check results since last watermark.
    /// </summary>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
    Task ProcessRollupDailyAsync(CancellationToken cancellationToken = default);
}
