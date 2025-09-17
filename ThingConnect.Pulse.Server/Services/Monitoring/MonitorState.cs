using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Per-endpoint in-memory state for outage detection and flap damping.
/// Tracks success/fail streaks and manages state transitions.
/// Thread-safe with internal locking.
/// </summary>
public sealed class MonitorState
{
    private readonly object _lock = new();

    /// <summary>
    /// Gets or sets the last publicly reported status (UP/DOWN). Null if never determined.
    /// </summary>
    public UpDown? LastPublicStatus { get; set; }

    /// <summary>
    /// Gets or sets current consecutive failure count. Reset to 0 on success.
    /// </summary>
    public int FailStreak { get; set; }

    /// <summary>
    /// Gets or sets current consecutive success count. Reset to 0 on failure.
    /// </summary>
    public int SuccessStreak { get; set; }

    /// <summary>
    /// Gets or sets timestamp of the last status change (UP→DOWN or DOWN→UP).
    /// </summary>
    public long? LastChangeTs { get; set; }

    /// <summary>
    /// Gets or sets iD of the currently open outage record. Null if endpoint is UP.
    /// </summary>
    public long? OpenOutageId { get; set; }

    /// <summary>
    /// Evaluates if the current state should transition to DOWN based on fail streak.
    /// Always requires at least 2 consecutive failures regardless of initialization state.
    /// </summary>
    /// <returns></returns>
    public bool ShouldTransitionToDown(int threshold = 2)
    {
        lock (_lock)
        {
            // Always require at least 2 consecutive failures
            int requiredFailures = Math.Max(1, threshold);
            if (FailStreak < requiredFailures)
            {
                return false;
            }

            // New endpoints (null) or UP endpoints can transition to DOWN
            // DOWN endpoints cannot transition to DOWN (already DOWN)
            return LastPublicStatus != UpDown.down;
        }
    }

    /// <summary>
    /// Evaluates if the current state should transition to UP based on success streak.
    /// Always requires at least 2 consecutive successes regardless of initialization state.
    /// </summary>
    /// <returns></returns>
    public bool ShouldTransitionToUp(int threshold = 2)
    {
        lock (_lock)
        {
            // Always require at least 2 consecutive successes
            int requiredSuccesses = Math.Max(1, threshold);
            if (SuccessStreak < requiredSuccesses)
            {
                return false;
            }

            // New endpoints (null) or DOWN endpoints can transition to UP
            // UP endpoints cannot transition to UP (already UP)
            return LastPublicStatus != UpDown.up;
        }
    }

    /// <summary>
    /// Records a successful check result and updates streaks.
    /// </summary>
    public void RecordSuccess()
    {
        lock (_lock)
        {
            SuccessStreak++;
            FailStreak = 0;
        }
    }

    /// <summary>
    /// Records a failed check result and updates streaks.
    /// </summary>
    public void RecordFailure()
    {
        lock (_lock)
        {
            FailStreak++;
            SuccessStreak = 0;
        }
    }

    /// <summary>
    /// Transitions the state to DOWN and records the change timestamp.
    /// </summary>
    public void TransitionToDown(long timestamp, long outageId)
    {
        lock (_lock)
        {
            LastPublicStatus = UpDown.down;
            LastChangeTs = timestamp;
            OpenOutageId = outageId;
        }
    }

    /// <summary>
    /// Transitions the state to UP and records the change timestamp.
    /// </summary>
    public void TransitionToUp(long timestamp)
    {
        lock (_lock)
        {
            LastPublicStatus = UpDown.up;
            LastChangeTs = timestamp;
            OpenOutageId = null;
        }
    }

    /// <summary>
    /// Restores streak counters to previous values (used for rollback on transaction failures).
    /// </summary>
    public void RestoreStreakCounters(int successStreak, int failStreak)
    {
        lock (_lock)
        {
            SuccessStreak = successStreak;
            FailStreak = failStreak;
        }
    }
}
