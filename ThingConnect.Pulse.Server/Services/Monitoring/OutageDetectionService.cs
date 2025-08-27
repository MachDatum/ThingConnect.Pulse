using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
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

        // Update streak counters based on result
        if (result.Status == UpDown.up)
        {
            state.RecordSuccess();
        }
        else
        {
            state.RecordFailure();
        }

        // Check for DOWN transition
        if (state.ShouldTransitionToDown())
        {
            await TransitionToDownAsync(result.EndpointId, state, result.Timestamp, result.Error, cancellationToken);
            stateChanged = true;
            _logger.LogWarning("Endpoint {EndpointId} transitioned to DOWN after {FailStreak} consecutive failures",
                result.EndpointId, state.FailStreak);
        }
        // Check for UP transition
        else if (state.ShouldTransitionToUp())
        {
            await TransitionToUpAsync(result.EndpointId, state, result.Timestamp, cancellationToken);
            stateChanged = true;
            _logger.LogInformation("Endpoint {EndpointId} transitioned to UP after {SuccessStreak} consecutive successes",
                result.EndpointId, state.SuccessStreak);
        }

        // Save the raw check result to database
        await SaveCheckResultAsync(result, cancellationToken);

        return stateChanged;
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
            DateTimeOffset now = DateTimeOffset.UtcNow;
            
            // Check for monitoring gap (when was the last monitoring session)
            var lastSession = await _context.MonitoringSessions
                .OrderByDescending(s => s.StartedTs)
                .FirstOrDefaultAsync(cancellationToken);

            DateTimeOffset? lastMonitoringTime = lastSession?.EndedTs ?? lastSession?.StartedTs;
            bool hasMonitoringGap = lastMonitoringTime.HasValue && 
                                   (now - lastMonitoringTime.Value).TotalMinutes > 5;

            if (hasMonitoringGap)
            {
                _logger.LogWarning("Detected monitoring gap since {LastMonitoringTime}. " +
                    "Handling open outages with uncertainty.", lastMonitoringTime);
                
                await HandleMonitoringGapAsync(lastMonitoringTime.Value, now, cancellationToken);
            }

            // Start new monitoring session
            var newSession = new MonitoringSession
            {
                StartedTs = now,
                Version = GetType().Assembly.GetName().Version?.ToString()
            };
            
            _context.MonitoringSessions.Add(newSession);
            await _context.SaveChangesAsync(cancellationToken);
            
            // Load endpoints and current states
            var endpoints = await _context.Endpoints
                .Where(e => e.Enabled)
                .ToListAsync(cancellationToken);

            var openOutages = await _context.Outages
                .Where(o => o.EndedTs == null)
                .ToListAsync(cancellationToken);

            var openOutagesByEndpoint = openOutages.ToDictionary(o => o.EndpointId, o => o.Id);

            int initializedCount = 0;
            foreach (var endpoint in endpoints)
            {
                var state = new MonitorState
                {
                    LastPublicStatus = endpoint.LastStatus,
                    LastChangeTs = endpoint.LastChangeTs,
                    OpenOutageId = openOutagesByEndpoint.GetValueOrDefault(endpoint.Id)
                };

                if (_states.TryAdd(endpoint.Id, state))
                {
                    initializedCount++;
                }
            }

            _logger.LogInformation("Started monitoring session {SessionId}, initialized {Count} states", 
                newSession.Id, initializedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize monitor states from database");
        }
    }

    private async Task HandleMonitoringGapAsync(DateTimeOffset lastMonitoringTime, 
        DateTimeOffset now, CancellationToken cancellationToken)
    {
        // Handle open outages that span the monitoring gap
        var openOutages = await _context.Outages
            .Where(o => o.EndedTs == null && o.StartedTs < lastMonitoringTime)
            .ToListAsync(cancellationToken);

        foreach (var outage in openOutages)
        {
            // Mark outage as having monitoring gap and close it at last known monitoring time
            outage.EndedTs = lastMonitoringTime;
            outage.DurationSeconds = (int)(lastMonitoringTime - outage.StartedTs).TotalSeconds;
            outage.MonitoringStoppedTs = lastMonitoringTime;
            outage.HasMonitoringGap = true;
            outage.LastError = "Monitoring gap detected - actual end time unknown";

            _logger.LogWarning("Closed outage {OutageId} for endpoint {EndpointId} due to monitoring gap. " +
                "Actual outage may have been shorter.", outage.Id, outage.EndpointId);
        }

        // Reset endpoint statuses to null since we don't know their current state
        var endpoints = await _context.Endpoints
            .Where(e => e.Enabled)
            .ToListAsync(cancellationToken);

        foreach (var endpoint in endpoints)
        {
            endpoint.LastStatus = null; // Unknown status after monitoring gap
            endpoint.LastChangeTs = now;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    /// <summary>
    /// Handles graceful shutdown by closing the current monitoring session and marking open outages.
    /// </summary>
    public async Task HandleGracefulShutdownAsync(string? shutdownReason = null, CancellationToken cancellationToken = default)
    {
        try
        {
            DateTimeOffset now = DateTimeOffset.UtcNow;

            // Close current monitoring session
            var currentSession = await _context.MonitoringSessions
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
            var openOutages = await _context.Outages
                .Where(o => o.EndedTs == null && o.MonitoringStoppedTs == null)
                .ToListAsync(cancellationToken);

            foreach (var outage in openOutages)
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

    private async Task TransitionToDownAsync(Guid endpointId, MonitorState state, DateTimeOffset timestamp,
        string? error, CancellationToken cancellationToken)
    {
        // Create new outage record
        Outage outage = new Outage
        {
            EndpointId = endpointId,
            StartedTs = timestamp,
            LastError = error
        };

        _context.Outages.Add(outage);
        await _context.SaveChangesAsync(cancellationToken);

        // Update monitor state
        state.TransitionToDown(timestamp, outage.Id);

        // Update endpoint's last status and change timestamp
        await UpdateEndpointStatusAsync(endpointId, UpDown.down, timestamp, cancellationToken);

        _logger.LogWarning("Created outage {OutageId} for endpoint {EndpointId}", outage.Id, endpointId);
    }

    private async Task TransitionToUpAsync(Guid endpointId, MonitorState state, DateTimeOffset timestamp,
        CancellationToken cancellationToken)
    {
        // Close existing outage if any
        if (state.OpenOutageId.HasValue)
        {
            Outage? outage = await _context.Outages.FindAsync([state.OpenOutageId.Value], cancellationToken);
            if (outage != null)
            {
                outage.EndedTs = timestamp;
                outage.DurationSeconds = (int)(timestamp - outage.StartedTs).TotalSeconds;
                _logger.LogInformation("Closed outage {OutageId} for endpoint {EndpointId}, duration: {DurationSeconds}s",
                    outage.Id, endpointId, outage.DurationSeconds);
            }
        }

        // Update monitor state
        state.TransitionToUp(timestamp);

        // Update endpoint's last status and change timestamp
        await UpdateEndpointStatusAsync(endpointId, UpDown.up, timestamp, cancellationToken);

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task UpdateEndpointStatusAsync(Guid endpointId, UpDown status, DateTimeOffset timestamp,
        CancellationToken cancellationToken)
    {
        Data.Endpoint? endpoint = await _context.Endpoints.FindAsync([endpointId], cancellationToken);
        if (endpoint != null)
        {
            endpoint.LastStatus = status;
            endpoint.LastChangeTs = timestamp;
        }
    }

    private async Task SaveCheckResultAsync(CheckResult result, CancellationToken cancellationToken)
    {
        CheckResultRaw rawResult = new CheckResultRaw
        {
            EndpointId = result.EndpointId,
            Ts = result.Timestamp,
            Status = result.Status,
            RttMs = result.RttMs,
            Error = result.Error
        };

        _context.CheckResultsRaw.Add(rawResult);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
