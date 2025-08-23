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
    /// Gets the current monitor state for an endpoint. Creates initial state if not exists.
    /// </summary>
    MonitorState GetOrCreateMonitorState(Guid endpointId);

    /// <summary>
    /// Gets the current monitor state for an endpoint. Returns null if not exists.
    /// </summary>
    MonitorState? GetMonitorState(Guid endpointId);

    /// <summary>
    /// Clears all monitor states. Used for testing or configuration changes.
    /// </summary>
    void ClearAllStates();
}