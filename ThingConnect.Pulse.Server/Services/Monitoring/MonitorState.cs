using ThingConnect.Pulse.Server.Data;

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
    public DateTimeOffset? LastChangeTs { get; set; }

    /// <summary>
    /// ID of the currently open outage record. Null if endpoint is UP.
    /// </summary>
    public long? OpenOutageId { get; set; }

    /// <summary>
    /// Evaluates if the current state should transition to DOWN based on fail streak.
    /// Default threshold: 2 consecutive failures.
    /// </summary>
    public bool ShouldTransitionToDown(int threshold = 2)
    {
        return LastPublicStatus != UpDown.down && FailStreak >= threshold;
    }

    /// <summary>
    /// Evaluates if the current state should transition to UP based on success streak.
    /// Default threshold: 2 consecutive successes.
    /// </summary>
    public bool ShouldTransitionToUp(int threshold = 2)
    {
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
    public void TransitionToDown(DateTimeOffset timestamp, long outageId)
    {
        LastPublicStatus = UpDown.down;
        LastChangeTs = timestamp;
        OpenOutageId = outageId;
    }

    /// <summary>
    /// Transitions the state to UP and records the change timestamp.
    /// </summary>
    public void TransitionToUp(DateTimeOffset timestamp)
    {
        LastPublicStatus = UpDown.up;
        LastChangeTs = timestamp;
        OpenOutageId = null;
    }
}