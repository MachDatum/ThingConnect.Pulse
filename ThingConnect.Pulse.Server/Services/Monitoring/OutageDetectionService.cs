using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Handles outage detection with flap damping and state management.
/// Maintains in-memory state per endpoint and persists outages to database.
/// </summary>
public sealed class OutageDetectionService : IOutageDetectionService
{
    private readonly PulseDbContext _context;
    private readonly ILogger<OutageDetectionService> _logger;
    private readonly ConcurrentDictionary<Guid, MonitorState> _states = new();

    public OutageDetectionService(PulseDbContext context, ILogger<OutageDetectionService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<bool> ProcessCheckResultAsync(CheckResult result, CancellationToken cancellationToken = default)
    {
        MonitorState state = GetOrCreateMonitorState(result.EndpointId);
        bool stateChanged = false;

        // Save current streak state for potential rollback
        int originalSuccessStreak = state.SuccessStreak;
        int originalFailStreak = state.FailStreak;
        
        try
        {
            _logger.LogDebug("Processing check for endpoint {EndpointId}: Status={Status}, SuccessStreak={SuccessStreak}, FailStreak={FailStreak}",
            result.EndpointId, result.Status, state.SuccessStreak, state.FailStreak);

            // Update streak counters based on result
            if (result.Status == UpDown.up)
            {
                state.RecordSuccess();
                _logger.LogDebug("Endpoint {EndpointId} recorded SUCCESS: SuccessStreak={SuccessStreak}, FailStreak={FailStreak}",
                    result.EndpointId, state.SuccessStreak, state.FailStreak);
            }
            else
            {
                state.RecordFailure();
                _logger.LogDebug("Endpoint {EndpointId} recorded FAILURE: FailStreak={FailStreak}, SuccessStreak={SuccessStreak}",
                    result.EndpointId, state.FailStreak, state.SuccessStreak);
            }

            // Validate state machine logic (debug build only)
            #if DEBUG
            if (!state.ValidateTransitionMutualExclusivity())
            {
                _logger.LogError("CRITICAL: State machine violation for endpoint {EndpointId} - " +
                    "both UP and DOWN transitions are true simultaneously. " +
                    "LastStatus={LastStatus}, SuccessStreak={SuccessStreak}, FailStreak={FailStreak}",
                    result.EndpointId, state.LastPublicStatus, state.SuccessStreak, state.FailStreak);
                throw new InvalidOperationException($"State machine mutual exclusivity violation for endpoint {result.EndpointId}");
            }
            #endif

            // Check for DOWN transition
            if (state.ShouldTransitionToDown())
            {
                await TransitionToDownAsync(result.EndpointId, state, UnixTimestamp.ToUnixSeconds(result.Timestamp), result.Error, cancellationToken);
                stateChanged = true;
                _logger.LogWarning("Endpoint {EndpointId} transitioned to DOWN after {FailStreak} consecutive failures",
                    result.EndpointId, state.FailStreak);
            }
            // Check for UP transition
            else if (state.ShouldTransitionToUp())
            {
                await TransitionToUpAsync(result.EndpointId, state, UnixTimestamp.ToUnixSeconds(result.Timestamp), cancellationToken);
                stateChanged = true;
                _logger.LogInformation("Endpoint {EndpointId} transitioned to UP after {SuccessStreak} consecutive successes",
                    result.EndpointId, state.SuccessStreak);
            }

            // Save the raw check result to database (independent of transitions)
            await SaveCheckResultAsync(result, cancellationToken);

            return stateChanged;
        }
        catch (Exception ex)
        {
            // If transition fails, restore original streak counters to maintain consistency
            _logger.LogError(ex, "Failed to process check result for endpoint {EndpointId}, reverting state changes", result.EndpointId);
            
            // Restore original streak state using thread-safe method
            state.RestoreStreakCounters(originalSuccessStreak, originalFailStreak);
            
            throw;
        }
    }

    public MonitorState GetOrCreateMonitorState(Guid endpointId)
    {
        return _states.GetOrAdd(endpointId, _ => new MonitorState());
    }

    public MonitorState? GetMonitorState(Guid endpointId)
    {
        _states.TryGetValue(endpointId, out MonitorState? state);
        return state;
    }

    public void ClearAllStates()
    {
        _states.Clear();
        _logger.LogInformation("Cleared all monitor states");
    }

    /// <summary>
    /// Initializes monitor states from database on service startup.
    /// Loads last known status, handles monitoring gaps, and starts new monitoring session.
    /// </summary>
    public async Task InitializeStatesFromDatabaseAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            long now = UnixTimestamp.Now();

            // Check for monitoring gap (when was the last monitoring session)
            MonitoringSession? lastSession = await _context.MonitoringSessions
                .OrderByDescending(s => s.StartedTs)
                .FirstOrDefaultAsync(cancellationToken);

            long? lastMonitoringTime = lastSession?.EndedTs ?? lastSession?.StartedTs;
            
            // Load endpoints once for both gap analysis and state initialization
            List<Data.Endpoint> endpoints = await _context.Endpoints
                .Where(e => e.Enabled)
                .ToListAsync(cancellationToken);
                
            if (lastMonitoringTime.HasValue)
            {
                long gapDuration = now - lastMonitoringTime.Value;
                
                var endpointsWithGaps = await AnalyzeMonitoringGapsAsync(endpoints, gapDuration, cancellationToken);
                
                if (endpointsWithGaps.Count > 0)
                {
                    _logger.LogWarning("Detected monitoring gap of {GapDuration}s since {LastMonitoringTime}. " +
                        "Affects {AffectedCount} of {TotalCount} endpoints.", 
                        gapDuration, UnixTimestamp.FromUnixSeconds(lastMonitoringTime.Value), 
                        endpointsWithGaps.Count, endpoints.Count);

                    await HandleMonitoringGapAsync(lastMonitoringTime.Value, now, endpointsWithGaps, cancellationToken);
                }
                else
                {
                    _logger.LogInformation("Service restart gap of {GapDuration}s detected, but no endpoints affected " +
                        "(gap shorter than monitoring intervals)", gapDuration);
                }
            }

            // Start new monitoring session
            var newSession = new MonitoringSession
            {
                StartedTs = now,
                Version = GetType().Assembly.GetName().Version?.ToString()
            };

            _context.MonitoringSessions.Add(newSession);
            await _context.SaveChangesAsync(cancellationToken);

            List<Outage> openOutages = await _context.Outages
                .Where(o => o.EndedTs == null)
                .ToListAsync(cancellationToken);

            var openOutagesByEndpoint = openOutages.ToDictionary(o => o.EndpointId, o => o.Id);

            int initializedCount = 0;
            int inconsistenciesFixed = 0;
            
            foreach (Data.Endpoint? endpoint in endpoints)
            {
                // Check for state inconsistencies during initialization
                bool hasOpenOutage = openOutagesByEndpoint.TryGetValue(endpoint.Id, out long outageId);
                UpDown? endpointStatus = endpoint.LastStatus;
                
                // Validate and fix inconsistent states
                var (correctedStatus, correctedOutageId, wasInconsistent) = await ValidateAndFixStateConsistencyAsync(
                    endpoint.Id, endpointStatus, hasOpenOutage ? outageId : null, cancellationToken);

                if (wasInconsistent)
                {
                    inconsistenciesFixed++;
                    _logger.LogWarning("Fixed state inconsistency for endpoint {EndpointId}: Status={OriginalStatus}→{CorrectedStatus}, OutageId={OutageId}",
                        endpoint.Id, endpointStatus, correctedStatus, correctedOutageId);
                    
                    // Update endpoint in database with corrected status
                    endpoint.LastStatus = correctedStatus;
                    endpoint.LastChangeTs = now;
                }

                var state = new MonitorState
                {
                    LastPublicStatus = correctedStatus,
                    LastChangeTs = endpoint.LastChangeTs,
                    OpenOutageId = correctedOutageId
                };

                if (_states.TryAdd(endpoint.Id, state))
                {
                    initializedCount++;
                }
            }

            // Save any endpoint status corrections
            if (inconsistenciesFixed > 0)
            {
                await _context.SaveChangesAsync(cancellationToken);
            }

            if (inconsistenciesFixed > 0)
            {
                _logger.LogInformation("Started monitoring session {SessionId}, initialized {Count} states, fixed {InconsistencyCount} state inconsistencies",
                    newSession.Id, initializedCount, inconsistenciesFixed);
            }
            else
            {
                _logger.LogInformation("Started monitoring session {SessionId}, initialized {Count} states",
                    newSession.Id, initializedCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize monitor states from database");
        }
    }

    /// <summary>
    /// Analyzes which endpoints are affected by monitoring gap based on their individual intervals.
    /// Returns list of endpoints where gap duration exceeds their monitoring interval significantly.
    /// </summary>
    private async Task<List<Data.Endpoint>> AnalyzeMonitoringGapsAsync(List<Data.Endpoint> endpoints, long gapDuration, CancellationToken cancellationToken)
    {
        var affectedEndpoints = new List<Data.Endpoint>();
        
        foreach (var endpoint in endpoints)
        {
            // Consider gap significant if it's longer than 2.5x the endpoint's monitoring interval
            // This allows for some service startup time and avoids false positives
            double gapThreshold = endpoint.IntervalSeconds * 2.5;
            
            if (gapDuration > gapThreshold)
            {
                int missedChecks = (int)(gapDuration / endpoint.IntervalSeconds);
                
                _logger.LogDebug("Endpoint {EndpointId} ({Name}) affected by gap: " +
                    "{GapDuration}s gap > {Threshold}s threshold ({IntervalSeconds}s interval), " +
                    "missed ~{MissedChecks} checks",
                    endpoint.Id, endpoint.Name, gapDuration, gapThreshold, endpoint.IntervalSeconds, missedChecks);
                
                affectedEndpoints.Add(endpoint);
            }
        }
        
        return affectedEndpoints;
    }

    private async Task HandleMonitoringGapAsync(long lastMonitoringTime,
        long now, List<Data.Endpoint> affectedEndpoints, CancellationToken cancellationToken)
    {
        // Get affected endpoint IDs for filtering
        var affectedEndpointIds = affectedEndpoints.Select(e => e.Id).ToHashSet();
        
        // Handle open outages only for affected endpoints
        List<Outage> outagesForAffectedEndpoints = await _context.Outages
            .Where(o => o.EndedTs == null && 
                       o.StartedTs < lastMonitoringTime && 
                       affectedEndpointIds.Contains(o.EndpointId))
            .ToListAsync(cancellationToken);

        foreach (Outage? outage in outagesForAffectedEndpoints)
        {
            // Mark outage as having monitoring gap and close it at last known monitoring time
            outage.EndedTs = lastMonitoringTime;
            outage.DurationSeconds = (int)(lastMonitoringTime - outage.StartedTs);
            outage.MonitoringStoppedTs = lastMonitoringTime;
            outage.HasMonitoringGap = true;
            outage.LastError = "Monitoring gap detected - actual end time unknown";

            _logger.LogWarning("Closed outage {OutageId} for endpoint {EndpointId} ({Name}) due to monitoring gap. " +
                "Gap {GapDuration}s exceeded interval {IntervalSeconds}s. Actual outage may have been shorter.", 
                outage.Id, outage.EndpointId, 
                affectedEndpoints.First(e => e.Id == outage.EndpointId).Name,
                (now - lastMonitoringTime),
                affectedEndpoints.First(e => e.Id == outage.EndpointId).IntervalSeconds);
        }

        // Reset endpoint statuses to null only for affected endpoints since we don't know their current state
        foreach (Data.Endpoint? endpoint in affectedEndpoints)
        {
            endpoint.LastStatus = null; // Unknown status after monitoring gap
            endpoint.LastChangeTs = now;
            
            _logger.LogDebug("Reset status to unknown for endpoint {EndpointId} ({Name}) due to monitoring gap",
                endpoint.Id, endpoint.Name);
        }

        await _context.SaveChangesAsync(cancellationToken);
        
        _logger.LogInformation("Handled monitoring gap: closed {OutageCount} outages and reset {EndpointCount} endpoint statuses",
            outagesForAffectedEndpoints.Count, affectedEndpoints.Count);
    }

    /// <summary>
    /// Handles graceful shutdown by closing the current monitoring session and marking open outages.
    /// </summary>
    public async Task HandleGracefulShutdownAsync(string? shutdownReason = null, CancellationToken cancellationToken = default)
    {
        try
        {
            long now = UnixTimestamp.Now();

            // Close current monitoring session
            MonitoringSession? currentSession = await _context.MonitoringSessions
                .Where(s => s.EndedTs == null)
                .OrderByDescending(s => s.StartedTs)
                .FirstOrDefaultAsync(cancellationToken);

            if (currentSession != null)
            {
                currentSession.EndedTs = now;
                currentSession.ShutdownReason = shutdownReason ?? "Graceful shutdown";

                _logger.LogInformation("Closed monitoring session {SessionId}", currentSession.Id);
            }

            // Mark all open outages with monitoring stop time (but don't close them yet)
            List<Outage> openOutages = await _context.Outages
                .Where(o => o.EndedTs == null && o.MonitoringStoppedTs == null)
                .ToListAsync(cancellationToken);

            foreach (Outage? outage in openOutages)
            {
                outage.MonitoringStoppedTs = now;
            }

            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Gracefully shut down monitoring, marked {Count} open outages", openOutages.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to handle graceful shutdown");
        }
    }

    private async Task TransitionToDownAsync(Guid endpointId, MonitorState state, long timestamp,
        string? error, CancellationToken cancellationToken)
    {
        // Use database transaction to ensure atomicity of all changes
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        
        try
        {
            // Create new outage record
            var outage = new Outage
            {
                EndpointId = endpointId,
                StartedTs = timestamp,
                LastError = error
            };

            _context.Outages.Add(outage);
            
            // Update endpoint's last status and change timestamp in same transaction
            await UpdateEndpointStatusAsync(endpointId, UpDown.down, timestamp, cancellationToken);
            
            // Save all changes atomically
            await _context.SaveChangesAsync(cancellationToken);
            
            // Commit transaction - all database changes are now permanent
            await transaction.CommitAsync(cancellationToken);
            
            // Update in-memory state ONLY after successful database commit
            state.TransitionToDown(timestamp, outage.Id);

            _logger.LogWarning("Created outage {OutageId} for endpoint {EndpointId}", outage.Id, endpointId);
        }
        catch (Exception ex)
        {
            // Transaction will auto-rollback on disposal
            _logger.LogError(ex, "Failed to transition endpoint {EndpointId} to DOWN, transaction rolled back", endpointId);
            throw;
        }
    }

    private async Task TransitionToUpAsync(Guid endpointId, MonitorState state, long timestamp,
        CancellationToken cancellationToken)
    {
        // Use database transaction to ensure atomicity of all changes
        using var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
        
        try
        {
            // Close existing outage if any
            long? closedOutageId = null;
            int? outageDurationSeconds = null;
            
            if (state.OpenOutageId.HasValue)
            {
                Outage? outage = await _context.Outages.FindAsync([state.OpenOutageId.Value], cancellationToken);
                if (outage != null)
                {
                    outage.EndedTs = timestamp;
                    outage.DurationSeconds = (int)(timestamp - outage.StartedTs);
                    closedOutageId = outage.Id;
                    outageDurationSeconds = outage.DurationSeconds;
                }
            }

            // Update endpoint's last status and change timestamp in same transaction
            await UpdateEndpointStatusAsync(endpointId, UpDown.up, timestamp, cancellationToken);
            
            // Save all changes atomically
            await _context.SaveChangesAsync(cancellationToken);
            
            // Commit transaction - all database changes are now permanent
            await transaction.CommitAsync(cancellationToken);
            
            // Update in-memory state ONLY after successful database commit
            state.TransitionToUp(timestamp);
            
            if (closedOutageId.HasValue)
            {
                _logger.LogInformation("Closed outage {OutageId} for endpoint {EndpointId}, duration: {DurationSeconds}s",
                    closedOutageId.Value, endpointId, outageDurationSeconds);
            }
        }
        catch (Exception ex)
        {
            // Transaction will auto-rollback on disposal
            _logger.LogError(ex, "Failed to transition endpoint {EndpointId} to UP, transaction rolled back", endpointId);
            throw;
        }
    }

    private async Task UpdateEndpointStatusAsync(Guid endpointId, UpDown status, long timestamp,
        CancellationToken cancellationToken)
    {
        Data.Endpoint? endpoint = await _context.Endpoints.FindAsync([endpointId], cancellationToken);
        if (endpoint != null)
        {
            endpoint.LastStatus = status;
            endpoint.LastChangeTs = timestamp;
        }
    }

    /// <summary>
    /// Validates and fixes state inconsistencies between endpoint status and outage records.
    /// Returns corrected status, outage ID, and whether inconsistency was found.
    /// </summary>
    private async Task<(UpDown? correctedStatus, long? correctedOutageId, bool wasInconsistent)> ValidateAndFixStateConsistencyAsync(
        Guid endpointId, UpDown? endpointStatus, long? openOutageId, CancellationToken cancellationToken)
    {
        bool hasOpenOutage = openOutageId.HasValue;
        
        // Case 1: Consistent states - no changes needed
        if ((endpointStatus == UpDown.down && hasOpenOutage) ||     // DOWN with outage ✓
            (endpointStatus == UpDown.up && !hasOpenOutage) ||       // UP without outage ✓  
            (endpointStatus == null))                                 // Unknown status (first time) ✓
        {
            return (endpointStatus, openOutageId, false);
        }
        
        // Case 2: UP status but has open outage (inconsistent)
        if (endpointStatus == UpDown.up && hasOpenOutage)
        {
            _logger.LogWarning("Endpoint {EndpointId} shows UP but has open outage {OutageId}. Resolving by closing outage.", 
                endpointId, openOutageId);
                
            // Close the outage - assume endpoint recovered during service downtime
            Outage? outage = await _context.Outages.FindAsync([openOutageId.Value], cancellationToken);
            if (outage != null)
            {
                long now = UnixTimestamp.Now();
                outage.EndedTs = now;
                outage.DurationSeconds = (int)(now - outage.StartedTs);
                outage.LastError = "Auto-resolved: Endpoint status was UP during service restart";
            }
            
            return (UpDown.up, null, true);
        }
        
        // Case 3: DOWN status but no open outage (inconsistent)  
        if (endpointStatus == UpDown.down && !hasOpenOutage)
        {
            _logger.LogWarning("Endpoint {EndpointId} shows DOWN but has no open outage. Resolving by creating outage.", 
                endpointId);
                
            // Create new outage - assume endpoint went down during service downtime
            long now = UnixTimestamp.Now();
            var outage = new Outage
            {
                EndpointId = endpointId,
                StartedTs = now,
                LastError = "Auto-created: Endpoint status was DOWN during service restart"
            };
            
            _context.Outages.Add(outage);
            await _context.SaveChangesAsync(cancellationToken); // Need ID for return
            
            return (UpDown.down, outage.Id, true);
        }
        
        // Should not reach here, but return original values if we do
        return (endpointStatus, openOutageId, false);
    }

    private async Task SaveCheckResultAsync(CheckResult result, CancellationToken cancellationToken)
    {
        var rawResult = new CheckResultRaw
        {
            EndpointId = result.EndpointId,
            Ts = UnixTimestamp.ToUnixSeconds(result.Timestamp),
            Status = result.Status,
            RttMs = result.RttMs,
            Error = result.Error
        };

        _context.CheckResultsRaw.Add(rawResult);
        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Batch save multiple check results in a single transaction for better performance
    /// </summary>
    public async Task SaveCheckResultsBatchAsync(IEnumerable<CheckResult> results, CancellationToken cancellationToken = default)
    {
        var rawResults = results.Select(result => new CheckResultRaw
        {
            EndpointId = result.EndpointId,
            Ts = UnixTimestamp.ToUnixSeconds(result.Timestamp),
            Status = result.Status,
            RttMs = result.RttMs,
            Error = result.Error
        }).ToList();

        if (rawResults.Count > 0)
        {
            _context.CheckResultsRaw.AddRange(rawResults);
            await _context.SaveChangesAsync(cancellationToken);

            _logger.LogDebug("Batch saved {Count} check results", rawResults.Count);
        }
    }
}
