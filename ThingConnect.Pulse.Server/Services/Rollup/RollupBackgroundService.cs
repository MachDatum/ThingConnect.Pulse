namespace ThingConnect.Pulse.Server.Services.Rollup;

/// <summary>
/// Background service that processes rollups every 5 minutes.
/// </summary>
public sealed class RollupBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RollupBackgroundService> _logger;
    private readonly TimeSpan _rollupInterval = TimeSpan.FromMinutes(5);

    public RollupBackgroundService(IServiceProvider serviceProvider, ILogger<RollupBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("RollupBackgroundService starting. Rollup interval: {Interval}", _rollupInterval);

        // Wait a bit before starting to let the application fully initialize
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessRollupsAsync(stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in rollup background service");
            }

            // Wait for next rollup cycle
            try
            {
                await Task.Delay(_rollupInterval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                // Expected when cancellation is requested
                break;
            }
        }

        _logger.LogInformation("RollupBackgroundService stopping");
    }

    private async Task ProcessRollupsAsync(CancellationToken cancellationToken)
    {
        using IServiceScope scope = _serviceProvider.CreateScope();
        IRollupService rollupService = scope.ServiceProvider.GetRequiredService<IRollupService>();

        try
        {
            // Process 15-minute rollups
            await rollupService.ProcessRollup15mAsync(cancellationToken);

            // Process daily rollups (less frequent, but check each cycle)
            await rollupService.ProcessRollupDailyAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process rollups");
            throw;
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("RollupBackgroundService stop requested");
        await base.StopAsync(cancellationToken);
        _logger.LogInformation("RollupBackgroundService stopped");
    }
}
