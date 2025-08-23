using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;

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

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await RefreshEndpointsAsync(stoppingToken);
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Check for endpoint changes every minute
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in monitoring background service");
                await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken); // Brief delay on error
            }
        }

        // Clean up timers
        foreach (var timer in _endpointTimers.Values)
        {
            timer.Dispose();
        }
        _endpointTimers.Clear();

        _logger.LogInformation("Monitoring background service stopped");
    }

    private async Task RefreshEndpointsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PulseDbContext>();

        // Get all enabled endpoints
        var endpoints = await context.Endpoints
            .Where(e => e.Enabled)
            .ToListAsync(cancellationToken);

        var currentEndpointIds = endpoints.Select(e => e.Id).ToHashSet();
        var existingEndpointIds = _endpointTimers.Keys.ToHashSet();

        // Remove timers for endpoints that no longer exist or are disabled
        var endpointsToRemove = existingEndpointIds.Except(currentEndpointIds);
        foreach (var endpointId in endpointsToRemove)
        {
            if (_endpointTimers.TryRemove(endpointId, out var timer))
            {
                timer.Dispose();
                _logger.LogInformation("Stopped monitoring endpoint: {EndpointId}", endpointId);
            }
        }

        // Add or update timers for current endpoints
        foreach (var endpoint in endpoints)
        {
            var intervalMs = endpoint.IntervalSeconds * 1000;
            
            if (_endpointTimers.TryGetValue(endpoint.Id, out var existingTimer))
            {
                // Update existing timer if interval changed
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

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<PulseDbContext>();
            var probeService = scope.ServiceProvider.GetRequiredService<IProbeService>();
            var outageService = scope.ServiceProvider.GetRequiredService<IOutageDetectionService>();

            // Get endpoint details
            var endpoint = await context.Endpoints.FindAsync(endpointId);
            if (endpoint == null || !endpoint.Enabled)
            {
                return; // Endpoint was deleted or disabled
            }

            // Perform the probe
            var result = await probeService.ProbeAsync(endpoint);
            
            // Process result for outage detection
            var stateChanged = await outageService.ProcessCheckResultAsync(result);
            
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
            _concurrencySemaphore.Release();
        }
    }

    public override void Dispose()
    {
        _concurrencySemaphore?.Dispose();
        
        foreach (var timer in _endpointTimers.Values)
        {
            timer.Dispose();
        }
        
        base.Dispose();
    }
}