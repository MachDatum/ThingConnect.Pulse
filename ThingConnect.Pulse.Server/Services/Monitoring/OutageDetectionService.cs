using System.Collections.Concurrent;
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

    private async Task TransitionToDownAsync(Guid endpointId, MonitorState state, DateTimeOffset timestamp,
        string? error, CancellationToken cancellationToken)
    {
        // Create new outage record
        var outage = new Outage
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
        var rawResult = new CheckResultRaw
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
