using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Service for detecting outages and managing endpoint state transitions with flap damping.
/// </summary>
public interface IOutageDetectionService
{
    /// <summary>
    /// Processes a check result and handles state transitions and outage management.
    /// Returns true if a state transition occurred.
    /// </summary>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
    Task<bool> ProcessCheckResultAsync(CheckResult result, CancellationToken cancellationToken = default);

    /// <summary>
    /// Initializes monitor states from database on service startup.
    /// Loads last known status and any open outages to maintain state across restarts.
    /// </summary>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
    Task InitializeStatesFromDatabaseAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Handles graceful shutdown by closing monitoring session and marking open outages.
    /// </summary>
    /// <returns><placeholder>A <see cref="Task"/> representing the asynchronous operation.</placeholder></returns>
    Task HandleGracefulShutdownAsync(string? shutdownReason = null, CancellationToken cancellationToken = default);
}
