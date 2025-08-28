using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Per-endpoint in-memory state for outage detection and flap damping.
/// Tracks success/fail streaks and manages state transitions.
/// </summary>
public sealed class MonitorState
{
    /// <summary>
    /// The last publicly reported status (UP/DOWN). Null if never determined.
    /// </summary>
    public UpDown? LastPublicStatus { get; set; }

    /// <summary>
    /// Current consecutive failure count. Reset to 0 on success.
    /// </summary>
    public int FailStreak { get; set; }

    /// <summary>
    /// Current consecutive success count. Reset to 0 on failure.
    /// </summary>
    public int SuccessStreak { get; set; }

    /// <summary>
    /// Timestamp of the last status change (UP→DOWN or DOWN→UP).
    /// </summary>
    public long? LastChangeTs { get; set; }

    /// <summary>
    /// ID of the currently open outage record. Null if endpoint is UP.
    /// </summary>
    public long? OpenOutageId { get; set; }

    /// <summary>
    /// Evaluates if the current state should transition to DOWN based on fail streak.
    /// If never initialized (startup), transitions immediately on first failure.
    /// Otherwise requires threshold consecutive failures (default: 2).
    /// </summary>
    public bool ShouldTransitionToDown(int threshold = 2)
    {
        // If never initialized, transition immediately on first failure
        if (LastPublicStatus == null && FailStreak >= 1)
            return true;
        
        // Otherwise require threshold for state change from UP to DOWN
        return LastPublicStatus != UpDown.down && FailStreak >= threshold;
    }

    /// <summary>
    /// Evaluates if the current state should transition to UP based on success streak.
    /// If never initialized (startup), transitions immediately on first success.
    /// Otherwise requires threshold consecutive successes (default: 2).
    /// </summary>
    public bool ShouldTransitionToUp(int threshold = 2)
    {
        // If never initialized, transition immediately on first success
        if (LastPublicStatus == null && SuccessStreak >= 1)
            return true;
        
        // Otherwise require threshold for state change from DOWN to UP
        return LastPublicStatus != UpDown.up && SuccessStreak >= threshold;
    }

    /// <summary>
    /// Records a successful check result and updates streaks.
    /// </summary>
    public void RecordSuccess()
    {
        SuccessStreak++;
        FailStreak = 0;
    }

    /// <summary>
    /// Records a failed check result and updates streaks.
    /// </summary>
    public void RecordFailure()
    {
        FailStreak++;
        SuccessStreak = 0;
    }

    /// <summary>
    /// Transitions the state to DOWN and records the change timestamp.
    /// </summary>
    public void TransitionToDown(long timestamp, long outageId)
    {
        LastPublicStatus = UpDown.down;
        LastChangeTs = timestamp;
        OpenOutageId = outageId;
    }

    /// <summary>
    /// Transitions the state to UP and records the change timestamp.
    /// </summary>
    public void TransitionToUp(long timestamp)
    {
        LastPublicStatus = UpDown.up;
        LastChangeTs = timestamp;
        OpenOutageId = null;
    }
}
