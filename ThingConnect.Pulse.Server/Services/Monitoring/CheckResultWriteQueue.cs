using System.Threading.Channels;
using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Services.Monitoring;

public interface ICheckResultWriteQueue
{
    void Enqueue(WriteQueueItem item);
}

public sealed record WriteQueueItem(
    CheckResultRaw RawResult,
    Guid? EndpointIdForRttUpdate,
    double? RttMs);

/// <summary>
/// Serializes all check_result_raw inserts through a single background writer, eliminating
/// the concurrent SaveChangesAsync flood that causes SQLite read timeouts under high probe rates.
/// </summary>
public sealed class CheckResultWriteQueue : BackgroundService, ICheckResultWriteQueue
{
    private readonly Channel<WriteQueueItem> _channel = Channel.CreateBounded<WriteQueueItem>(
        new BoundedChannelOptions(10_000) { FullMode = BoundedChannelFullMode.DropOldest });

    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<CheckResultWriteQueue> _logger;

    public CheckResultWriteQueue(IServiceProvider serviceProvider, ILogger<CheckResultWriteQueue> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public void Enqueue(WriteQueueItem item) => _channel.Writer.TryWrite(item);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Check result write queue started");

        var batch = new List<WriteQueueItem>(100);

        while (!stoppingToken.IsCancellationRequested)
        {
            batch.Clear();

            try
            {
                // Block until at least one item is available
                if (!await _channel.Reader.WaitToReadAsync(stoppingToken))
                {
                    break;
                }

                // Drain all ready items up to batch limit (no extra waiting)
                while (batch.Count < 100 && _channel.Reader.TryRead(out WriteQueueItem? item))
                {
                    batch.Add(item);
                }

                await FlushBatchAsync(batch, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error flushing check result batch of {Count} items", batch.Count);
                // Brief pause to avoid tight error loop, then continue
                await Task.Delay(1000, stoppingToken).ConfigureAwait(false);
            }
        }

        // Drain remaining items on shutdown
        batch.Clear();
        while (_channel.Reader.TryRead(out WriteQueueItem? item))
        {
            batch.Add(item);
        }

        if (batch.Count > 0)
        {
            try
            {
                await FlushBatchAsync(batch, CancellationToken.None);
                _logger.LogInformation("Flushed {Count} remaining check results on shutdown", batch.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to flush remaining {Count} check results on shutdown", batch.Count);
            }
        }

        _logger.LogInformation("Check result write queue stopped");
    }

    private async Task FlushBatchAsync(List<WriteQueueItem> batch, CancellationToken ct)
    {
        using IServiceScope scope = _serviceProvider.CreateScope();
        PulseDbContext context = scope.ServiceProvider.GetRequiredService<PulseDbContext>();

        context.CheckResultsRaw.AddRange(batch.Select(i => i.RawResult));

        // Update LastRttMs — one FindAsync per distinct endpoint, keep most recent value
        var rttUpdates = batch
            .Where(i => i.EndpointIdForRttUpdate.HasValue && i.RttMs.HasValue)
            .GroupBy(i => i.EndpointIdForRttUpdate!.Value)
            .Select(g => (EndpointId: g.Key, RttMs: g.Last().RttMs!.Value));

        foreach ((Guid endpointId, double rttMs) in rttUpdates)
        {
            Data.Endpoint? endpoint = await context.Endpoints.FindAsync([endpointId], ct);
            if (endpoint != null)
            {
                endpoint.LastRttMs = rttMs;
            }
        }

        await context.SaveChangesAsync(ct);

        _logger.LogDebug("Flushed batch of {Count} check results", batch.Count);
    }
}
