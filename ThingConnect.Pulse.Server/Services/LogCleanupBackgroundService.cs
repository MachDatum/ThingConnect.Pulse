using Microsoft.Extensions.Options;

namespace ThingConnect.Pulse.Server.Services;

public class LogRetentionOptions
{
    public int DaysToKeep { get; set; } = 60;
    public int MaxTotalSizeMB { get; set; } = 1000;
    public string CleanupSchedule { get; set; } = "02:00:00";
}

public sealed class LogCleanupBackgroundService : BackgroundService
{
    private readonly ILogger<LogCleanupBackgroundService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _logsDirectory;
    private readonly LogRetentionOptions _options;

    public LogCleanupBackgroundService(
        ILogger<LogCleanupBackgroundService> logger,
        IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
        
        // Default to ProgramData logs directory, fall back to local logs for development
        _logsDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "ThingConnect.Pulse", "logs");
        
        if (!Directory.Exists(_logsDirectory))
        {
            _logsDirectory = Path.Combine(AppContext.BaseDirectory, "logs");
        }
        
        _options = new LogRetentionOptions();
        configuration.GetSection("Logging:Retention").Bind(_options);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Log cleanup service started. Directory: {LogsDirectory}, Retention: {Days} days", 
            _logsDirectory, _options.DaysToKeep);
        
        // Run cleanup immediately on startup
        await CleanupOldLogFilesAsync();
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var nextRun = GetNextCleanupTime();
                var delay = nextRun - DateTime.Now;
                
                if (delay > TimeSpan.Zero)
                {
                    _logger.LogDebug("Next log cleanup scheduled for {NextRun}", nextRun);
                    await Task.Delay(delay, stoppingToken);
                }
                else
                {
                    // If we missed the scheduled time, run in 1 hour
                    _logger.LogDebug("Missed scheduled cleanup time, running in 1 hour");
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
                
                if (!stoppingToken.IsCancellationRequested)
                {
                    await CleanupOldLogFilesAsync();
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Expected when service is stopping
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during log cleanup scheduling");
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }
        
        _logger.LogInformation("Log cleanup service stopped");
    }

    private DateTime GetNextCleanupTime()
    {
        if (!TimeSpan.TryParse(_options.CleanupSchedule, out var cleanupTime))
        {
            cleanupTime = TimeSpan.FromHours(2); // Default to 2 AM
        }
        
        var today = DateTime.Today;
        var nextRun = today.Add(cleanupTime);
        
        // If the time has already passed today, schedule for tomorrow
        if (nextRun <= DateTime.Now)
        {
            nextRun = nextRun.AddDays(1);
        }
        
        return nextRun;
    }

    private async Task CleanupOldLogFilesAsync()
    {
        try
        {
            if (!Directory.Exists(_logsDirectory))
            {
                _logger.LogWarning("Logs directory does not exist: {LogsDirectory}", _logsDirectory);
                return;
            }
            
            var cutoffDate = DateTime.UtcNow.AddDays(-_options.DaysToKeep);
            _logger.LogDebug("Starting log cleanup for files older than {CutoffDate}", cutoffDate);
            
            var logFiles = Directory.GetFiles(_logsDirectory, "pulse*.log", SearchOption.TopDirectoryOnly)
                                   .Select(f => new FileInfo(f))
                                   .Where(f => f.CreationTimeUtc < cutoffDate)
                                   .OrderBy(f => f.CreationTimeUtc)
                                   .ToList();
            
            if (logFiles.Count == 0)
            {
                _logger.LogDebug("No log files found that need cleanup");
                return;
            }
            
            var deletedCount = 0;
            var totalSizeDeleted = 0L;
            
            foreach (var file in logFiles)
            {
                try
                {
                    var fileSize = file.Length;
                    file.Delete();
                    
                    deletedCount++;
                    totalSizeDeleted += fileSize;
                    
                    _logger.LogInformation("Deleted expired log file: {FileName} ({SizeMB:F2} MB)", 
                        file.Name, fileSize / (1024.0 * 1024.0));
                }
                catch (UnauthorizedAccessException ex)
                {
                    _logger.LogWarning("Access denied deleting log file {FileName}: {Error}", 
                        file.Name, ex.Message);
                }
                catch (IOException ex)
                {
                    _logger.LogWarning("IO error deleting log file {FileName}: {Error}", 
                        file.Name, ex.Message);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Unexpected error deleting log file: {FileName}", file.Name);
                }
            }
            
            if (deletedCount > 0)
            {
                _logger.LogInformation("Log cleanup completed: {DeletedCount} files removed, {TotalSizeMB:F2} MB freed", 
                    deletedCount, totalSizeDeleted / (1024.0 * 1024.0));
                
                // Check total size after cleanup
                await CheckTotalLogSizeAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during log file cleanup");
        }
    }

    private async Task CheckTotalLogSizeAsync()
    {
        try
        {
            var logFiles = Directory.GetFiles(_logsDirectory, "pulse*.log", SearchOption.TopDirectoryOnly);
            var totalSize = logFiles.Sum(f => new FileInfo(f).Length);
            var totalSizeMB = totalSize / (1024.0 * 1024.0);
            
            _logger.LogDebug("Current total log size: {TotalSizeMB:F2} MB ({FileCount} files)", 
                totalSizeMB, logFiles.Length);
            
            if (totalSizeMB > _options.MaxTotalSizeMB)
            {
                _logger.LogWarning("Total log size ({TotalSizeMB:F2} MB) exceeds limit ({MaxSizeMB} MB). " +
                    "Consider reducing retention days or increasing size limit.", 
                    totalSizeMB, _options.MaxTotalSizeMB);
                
                // Optional: Force cleanup of oldest files if over size limit
                await ForceCleanupOldestFilesAsync(totalSize);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking total log size");
        }
    }

    private Task ForceCleanupOldestFilesAsync(long currentTotalSize)
    {
        try
        {
            var maxSizeBytes = (long)_options.MaxTotalSizeMB * 1024 * 1024;
            var targetSizeBytes = (long)(maxSizeBytes * 0.8); // Clean up to 80% of limit
            var sizeToFree = currentTotalSize - targetSizeBytes;
            
            if (sizeToFree <= 0)
            {
                return Task.CompletedTask;
            }
            
            var logFiles = Directory.GetFiles(_logsDirectory, "pulse*.log", SearchOption.TopDirectoryOnly)
                                   .Select(f => new FileInfo(f))
                                   .OrderBy(f => f.CreationTimeUtc)
                                   .ToList();
            
            var freedSize = 0L;
            var deletedCount = 0;
            
            foreach (var file in logFiles)
            {
                if (freedSize >= sizeToFree)
                {
                    break;
                }
                
                try
                {
                    var fileSize = file.Length;
                    file.Delete();
                    
                    freedSize += fileSize;
                    deletedCount++;
                    
                    _logger.LogWarning("Force deleted log file to reduce size: {FileName} ({SizeMB:F2} MB)", 
                        file.Name, fileSize / (1024.0 * 1024.0));
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error force deleting log file: {FileName}", file.Name);
                }
            }
            
            if (deletedCount > 0)
            {
                _logger.LogWarning("Force cleanup completed: {DeletedCount} files removed to reduce total size", 
                    deletedCount);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during force log cleanup");
        }
        
        return Task.CompletedTask;
    }
}