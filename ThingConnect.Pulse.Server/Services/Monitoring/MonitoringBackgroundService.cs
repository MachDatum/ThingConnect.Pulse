using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Helpers;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

/// <summary>
/// Background service that continuously monitors all enabled endpoints with concurrency control.
/// </summary>
public sealed class MonitoringBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<MonitoringBackgroundService> _logger;
    private readonly SemaphoreSlim _concurrencySemaphore;
    private readonly ConcurrentDictionary<Guid, Timer> _endpointTimers = new();
    private readonly ConcurrentDictionary<Guid, bool> _probeExecuting = new();
    private readonly int _maxConcurrentProbes;

    public MonitoringBackgroundService(IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<MonitoringBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;

        // Read concurrency limit from configuration
        _maxConcurrentProbes = configuration.GetValue<int>("Monitoring:MaxConcurrentProbes", 100);
        _concurrencySemaphore = new SemaphoreSlim(_maxConcurrentProbes, _maxConcurrentProbes);

        _logger.LogInformation("Monitoring service initialized with max concurrent probes: {MaxConcurrentProbes}",
            _maxConcurrentProbes);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Monitoring background service started");

        // Initialize monitor states from database on startup
        using (IServiceScope scope = _serviceProvider.CreateScope())
        {
            IOutageDetectionService outageService = scope.ServiceProvider.GetRequiredService<IOutageDetectionService>();
            await outageService.InitializeStatesFromDatabaseAsync(stoppingToken);
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RefreshEndpointsAsync(stoppingToken);
                await UpdateHeartbeatAsync(stoppingToken);
                await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken); // Check for endpoint changes every minute
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in monitoring background service");
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken); // Brief delay on error
            }
        }

        // Handle graceful shutdown with cancellation support
        try
        {
            using (IServiceScope scope = _serviceProvider.CreateScope())
            {
                IOutageDetectionService outageService = scope.ServiceProvider.GetRequiredService<IOutageDetectionService>();

                // Create a timeout for graceful shutdown (30 seconds max)
                // This allows force shutdown while giving reasonable time for data safety
                using var shutdownCts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
                using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken, shutdownCts.Token);

                await outageService.HandleGracefulShutdownAsync("Service stopping", combinedCts.Token);

                _logger.LogInformation("Graceful shutdown completed successfully");
            }
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            _logger.LogWarning("Graceful shutdown was cancelled - service forced to stop");
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Graceful shutdown timed out (30s) - proceeding with forced shutdown");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during graceful shutdown - proceeding with forced shutdown");
        }

        // Clean up timers gracefully with cancellation support
        var timerCleanupTasks = new List<Task>();
        foreach (KeyValuePair<Guid, Timer> kvp in _endpointTimers.ToList()) // ToList to avoid modification during enumeration
        {
            timerCleanupTasks.Add(StopTimerGracefullyAsync(kvp.Value, kvp.Key));
        }

        try
        {
            // Create timeout for timer cleanup (30 seconds max) while respecting external cancellation
            using var timerCleanupCts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
            using var combinedCleanupCts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken, timerCleanupCts.Token);

            // Wait for all timers to shutdown gracefully (with timeout and cancellation)
            await Task.WhenAll(timerCleanupTasks).WaitAsync(combinedCleanupCts.Token);

            _logger.LogInformation("All timers stopped gracefully");
        }
        catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
        {
            _logger.LogWarning("Timer cleanup was cancelled - service forced to stop");
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Timer cleanup timed out (30s) - some timers may not have stopped cleanly");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during timer cleanup");
        }

        _endpointTimers.Clear();

        _logger.LogInformation("Monitoring background service stopped");
    }

    private async Task RefreshEndpointsAsync(CancellationToken cancellationToken)
    {
        using IServiceScope scope = _serviceProvider.CreateScope();
        PulseDbContext context = scope.ServiceProvider.GetRequiredService<PulseDbContext>();

        // Get all enabled endpoints
        List<Data.Endpoint> endpoints = await context.Endpoints
            .Where(e => e.Enabled)
            .ToListAsync(cancellationToken);

        var currentEndpointIds = endpoints.Select(e => e.Id).ToHashSet();
        var existingEndpointIds = _endpointTimers.Keys.ToHashSet();

        // Remove timers for endpoints that no longer exist or are disabled
        IEnumerable<Guid> endpointsToRemove = existingEndpointIds.Except(currentEndpointIds);
        foreach (Guid endpointId in endpointsToRemove)
        {
            if (_endpointTimers.TryRemove(endpointId, out Timer? timer))
            {
                await StopTimerGracefullyAsync(timer, endpointId);
                _probeExecuting.TryRemove(endpointId, out _); // Clean up execution tracking
                _logger.LogInformation("Stopped monitoring endpoint: {EndpointId}", endpointId);
            }
        }

        // Add or update timers for current endpoints
        foreach (Data.Endpoint? endpoint in endpoints)
        {
            int intervalMs = endpoint.IntervalSeconds * 1000;

            if (_endpointTimers.TryGetValue(endpoint.Id, out Timer? existingTimer))
            {
                // Stop timer to prevent race condition, then restart with new interval
                existingTimer.Change(Timeout.Infinite, Timeout.Infinite);

                // Wait briefly if probe is currently executing to avoid immediate restart
                if (_probeExecuting.TryGetValue(endpoint.Id, out bool isExecuting) && isExecuting)
                {
                    await Task.Delay(100); // Brief delay to let current execution complete
                }

                // Restart with new interval
                existingTimer.Change(TimeSpan.Zero, TimeSpan.FromMilliseconds(intervalMs));
            }
            else
            {
                // Create new timer for new endpoint
                var timer = new Timer(
                    callback: async _ => await ProbeEndpointAsync(endpoint.Id),
                    state: null,
                    dueTime: TimeSpan.Zero, // Start immediately
                    period: TimeSpan.FromMilliseconds(intervalMs)
                );

                _endpointTimers.TryAdd(endpoint.Id, timer);
                _logger.LogInformation("Started monitoring endpoint: {EndpointId} ({Name}) every {IntervalSeconds}s",
                    endpoint.Id, endpoint.Name, endpoint.IntervalSeconds);
            }
        }

        _logger.LogDebug("Refreshed monitoring for {EndpointCount} endpoints", endpoints.Count);
    }

    private async Task ProbeEndpointAsync(Guid endpointId)
    {
        // Respect concurrency limit
        if (!await _concurrencySemaphore.WaitAsync(100)) // Quick timeout to avoid blocking
        {
            _logger.LogWarning("Concurrency limit reached, skipping probe for endpoint: {EndpointId}", endpointId);
            return;
        }

        // Mark probe as executing to prevent timer race conditions
        _probeExecuting.TryAdd(endpointId, true);

        try
        {
            using IServiceScope scope = _serviceProvider.CreateScope();
            PulseDbContext context = scope.ServiceProvider.GetRequiredService<PulseDbContext>();
            IProbeService probeService = scope.ServiceProvider.GetRequiredService<IProbeService>();
            IOutageDetectionService outageService = scope.ServiceProvider.GetRequiredService<IOutageDetectionService>();

            // Get endpoint details
            Data.Endpoint? endpoint = await context.Endpoints.FindAsync(endpointId);
            if (endpoint == null || !endpoint.Enabled)
            {
                return; // Endpoint was deleted or disabled
            }

            // Perform the probe
            Models.CheckResult result = await probeService.ProbeAsync(endpoint);

            // Process result for outage detection
            bool stateChanged = await outageService.ProcessCheckResultAsync(result);

            if (stateChanged)
            {
                _logger.LogInformation("State change detected for endpoint {EndpointId} ({Name}): {Status}",
                    endpointId, endpoint.Name, result.Status);
            }
            else
            {
                _logger.LogTrace("Probed endpoint {EndpointId} ({Name}): {Status} in {RttMs}ms",
                    endpointId, endpoint.Name, result.Status, result.RttMs?.ToString("F1") ?? "N/A");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to probe endpoint: {EndpointId}", endpointId);
        }
        finally
        {
            // Clear execution flag
            _probeExecuting.TryRemove(endpointId, out _);
            _concurrencySemaphore.Release();
        }
    }

    /// <summary>
    /// Gracefully stops a timer by disabling it, waiting for current execution to complete, then disposing.
    /// </summary>
    private async Task StopTimerGracefullyAsync(Timer timer, Guid endpointId)
    {
        try
        {
            // Stop the timer from firing again
            timer.Change(Timeout.Infinite, Timeout.Infinite);

            // Wait for current probe execution to complete (with timeout)
            int maxWaitMs = 30000; // 30 seconds max wait
            int waitedMs = 0;
            const int checkIntervalMs = 100;

            while (waitedMs < maxWaitMs && _probeExecuting.TryGetValue(endpointId, out bool isExecuting) && isExecuting)
            {
                await Task.Delay(checkIntervalMs);
                waitedMs += checkIntervalMs;
            }

            if (waitedMs >= maxWaitMs)
            {
                _logger.LogWarning("Timeout waiting for probe execution to complete for endpoint: {EndpointId}", endpointId);
            }

            // Now safe to dispose
            timer.Dispose();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during graceful timer shutdown for endpoint: {EndpointId}", endpointId);
            timer.Dispose(); // Force dispose on error
        }
    }

    /// <summary>
    /// Updates the LastActivityTs field in the current monitoring session to provide heartbeat signal.
    /// </summary>
    private async Task UpdateHeartbeatAsync(CancellationToken cancellationToken)
    {
        try
        {
            using IServiceScope scope = _serviceProvider.CreateScope();
            PulseDbContext context = scope.ServiceProvider.GetRequiredService<PulseDbContext>();

            // Find the current active monitoring session
            MonitoringSession? currentSession = await context.MonitoringSessions
                .Where(s => s.EndedTs == null)
                .OrderByDescending(s => s.StartedTs)
                .FirstOrDefaultAsync(cancellationToken);

            if (currentSession != null)
            {
                currentSession.LastActivityTs = UnixTimestamp.Now();
                await context.SaveChangesAsync(cancellationToken);
                _logger.LogTrace("Updated monitoring session heartbeat for session {SessionId}", currentSession.Id);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to update monitoring session heartbeat");
            // Don't throw - heartbeat failure shouldn't stop monitoring
        }
    }

    public override void Dispose()
    {
        _concurrencySemaphore?.Dispose();

        // Force dispose all remaining timers (should already be cleaned up in ExecuteAsync)
        foreach (Timer timer in _endpointTimers.Values)
        {
            try
            {
                // Stop timer first, then dispose (no graceful wait in synchronous dispose)
                timer.Change(Timeout.Infinite, Timeout.Infinite);
                timer.Dispose();
            }
            catch (Exception ex)
            {
                // Log but don't throw during disposal
                _logger?.LogWarning(ex, "Error disposing timer during service disposal");
            }
        }

        base.Dispose();
    }
}
