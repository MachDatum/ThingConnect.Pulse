namespace ThingConnect.Pulse.Server.Services.Prune;

public sealed class PruneBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PruneBackgroundService> _logger;

    public PruneBackgroundService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<PruneBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Wait until the first 02:00 local time before running, then repeat every intervalHours
        int intervalHours = _configuration.GetValue<int>("Data:Pruning:IntervalHours", 24);
        bool enabled = _configuration.GetValue<bool>("Data:Pruning:Enabled", true);

        if (!enabled)
        {
            _logger.LogInformation("Pruning is disabled via configuration");
            return;
        }

        // Initial delay: time until next 02:00 local
        TimeSpan initialDelay = TimeUntilNextRun(TimeSpan.FromHours(2));
        _logger.LogInformation(
            "Prune background service scheduled. First run in {Delay:hh\\:mm\\:ss}, then every {IntervalHours}h",
            initialDelay, intervalHours);

        try
        {
            await Task.Delay(initialDelay, stoppingToken);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        while (!stoppingToken.IsCancellationRequested)
        {
            await RunPruneAsync(stoppingToken);

            try
            {
                await Task.Delay(TimeSpan.FromHours(intervalHours), stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }

    private async Task RunPruneAsync(CancellationToken ct)
    {
        _logger.LogInformation("Starting scheduled raw data prune");
        var sw = System.Diagnostics.Stopwatch.StartNew();

        try
        {
            using IServiceScope scope = _serviceProvider.CreateScope();
            IPruneService pruneService = scope.ServiceProvider.GetRequiredService<IPruneService>();

            int deleted = await pruneService.PruneRawDataAsync(dryRun: false, ct);

            _logger.LogInformation(
                "Scheduled prune complete: deleted {Deleted} raw check results in {Elapsed}ms",
                deleted, sw.ElapsedMilliseconds);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Scheduled prune failed after {Elapsed}ms", sw.ElapsedMilliseconds);
        }
    }

    private static TimeSpan TimeUntilNextRun(TimeSpan targetTimeOfDay)
    {
        DateTimeOffset now = DateTimeOffset.Now;
        DateTimeOffset next = now.Date + targetTimeOfDay;
        if (next <= now) next = next.AddDays(1);
        return next - now;
    }
}
