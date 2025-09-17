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
    Task<bool> ProcessCheckResultAsync(CheckResult result, CancellationToken cancellationToken = default);

    /// <summary>
    /// Initializes monitor states from database on service startup.
    /// Loads last known status and any open outages to maintain state across restarts.
    /// </summary>
    Task InitializeStatesFromDatabaseAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Handles graceful shutdown by closing monitoring session and marking open outages.
    /// </summary>
    Task HandleGracefulShutdownAsync(string? shutdownReason = null, CancellationToken cancellationToken = default);
}
