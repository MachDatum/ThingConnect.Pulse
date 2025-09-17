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
        lock (_lock)
        {
            return ShouldTransitionToDownUnsafe(threshold);
        }
    }

    /// <summary>
    /// Internal unsafe version of ShouldTransitionToDown that assumes lock is already held.
    /// </summary>
    private bool ShouldTransitionToDownUnsafe(int threshold = 2)
    {
        // Must have enough failures to trigger transition
        if (FailStreak < Math.Max(1, threshold))
            return false;

        // Handle null status (never initialized) - transition on first failure
        if (LastPublicStatus == null)
            return FailStreak >= 1;

        // Only transition if currently UP (not already DOWN)
        return LastPublicStatus == UpDown.up;
    }

    /// <summary>
    /// Evaluates if the current state should transition to UP based on success streak.
    /// If never initialized (startup), transitions immediately on first success.
    /// Otherwise requires threshold consecutive successes (default: 2).
    /// </summary>
    public bool ShouldTransitionToUp(int threshold = 2)
    {
        lock (_lock)
        {
            return ShouldTransitionToUpUnsafe(threshold);
        }
    }

    /// <summary>
    /// Internal unsafe version of ShouldTransitionToUp that assumes lock is already held.
    /// </summary>
    private bool ShouldTransitionToUpUnsafe(int threshold = 2)
    {
        // Must have enough successes to trigger transition
        if (SuccessStreak < Math.Max(1, threshold))
            return false;

        // Handle null status (never initialized) - transition on first success
        if (LastPublicStatus == null)
            return SuccessStreak >= 1;

        // Only transition if currently DOWN (not already UP)
        return LastPublicStatus == UpDown.down;
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

    /// <summary>
    /// Validates that transition logic maintains mutual exclusivity.
    /// This is used for debugging and ensuring state machine correctness.
    /// </summary>
    public bool ValidateTransitionMutualExclusivity(int threshold = 2)
    {
        lock (_lock)
        {
            bool shouldTransitionDown = ShouldTransitionToDownUnsafe(threshold);
            bool shouldTransitionUp = ShouldTransitionToUpUnsafe(threshold);

            // Both transitions should never be true simultaneously
            return !(shouldTransitionDown && shouldTransitionUp);
        }
    }
}
