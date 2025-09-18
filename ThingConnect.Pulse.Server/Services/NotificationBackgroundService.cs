using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Services;

public interface INotificationService
{
    Task TriggerManualFetchAsync();
}

public class NotificationFetchOptions
{
    public string NotificationEndpoint { get; set; } = "https://thingconnect-pulse.s3.ap-south-1.amazonaws.com/notifications/latest.json";
    public int CheckIntervalHours { get; set; } = 6;
    public bool EnableNotifications { get; set; } = true;
    public int TimeoutSeconds { get; set; } = 30;
}

public sealed class NotificationBackgroundService : BackgroundService, INotificationService
{
    private readonly ILogger<NotificationBackgroundService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly HttpClient _httpClient;
    private readonly NotificationFetchOptions _options;

    public NotificationBackgroundService(
        ILogger<NotificationBackgroundService> logger,
        IServiceProvider serviceProvider,
        HttpClient httpClient,
        IConfiguration configuration)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _httpClient = httpClient;

        _options = new NotificationFetchOptions();
        configuration.GetSection("Notifications").Bind(_options);

        _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_options.EnableNotifications)
        {
            _logger.LogInformation("Notification fetching is disabled");
            return;
        }

        _logger.LogInformation("Notification background service started. Endpoint: {Endpoint}, Interval: {Hours} hours",
            _options.NotificationEndpoint, _options.CheckIntervalHours);

        // Wait a short time before first fetch to allow app to fully start
        await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);

        // Run initial fetch
        await FetchNotificationsAsync();

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                TimeSpan delay = TimeSpan.FromHours(_options.CheckIntervalHours);
                _logger.LogDebug("Next notification fetch scheduled in {Hours} hours", _options.CheckIntervalHours);

                await Task.Delay(delay, stoppingToken);

                if (!stoppingToken.IsCancellationRequested)
                {
                    await FetchNotificationsAsync();
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during notification fetch scheduling");
                await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }
        }

        _logger.LogInformation("Notification background service stopped");
    }

    public async Task TriggerManualFetchAsync()
    {
        _logger.LogInformation("Manual notification fetch triggered");
        await FetchNotificationsAsync();
    }

    private async Task FetchNotificationsAsync()
    {
        try
        {
            _logger.LogDebug("Fetching notifications from {Endpoint}", _options.NotificationEndpoint);

            var response = await _httpClient.GetStringAsync(_options.NotificationEndpoint);
            var notificationResponse = JsonSerializer.Deserialize<NotificationResponseDto>(response, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (notificationResponse == null)
            {
                _logger.LogWarning("Failed to deserialize notification response");
                await RecordFetchResult(false, "Failed to deserialize response", null, null, 0);
                return;
            }

            await ProcessNotificationsAsync(notificationResponse);

            _logger.LogInformation("Successfully fetched {Count} notifications from remote server",
                notificationResponse.Notifications.Count);
        }
        catch (HttpRequestException ex)
        {
            _logger.LogWarning("Network error fetching notifications: {Error}", ex.Message);
            await RecordFetchResult(false, $"Network error: {ex.Message}", null, null, 0);
        }
        catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
        {
            _logger.LogWarning("Timeout fetching notifications after {Timeout}s", _options.TimeoutSeconds);
            await RecordFetchResult(false, "Request timeout", null, null, 0);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning("JSON parsing error: {Error}", ex.Message);
            await RecordFetchResult(false, $"JSON error: {ex.Message}", null, null, 0);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error fetching notifications");
            await RecordFetchResult(false, $"Unexpected error: {ex.Message}", null, null, 0);
        }
    }

    private async Task ProcessNotificationsAsync(NotificationResponseDto response)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<PulseDbContext>();

        var currentAppVersion = GetCurrentAppVersion();
        var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var newNotifications = 0;
        var updatedNotifications = 0;

        try
        {
            foreach (var remoteNotification in response.Notifications)
            {
                // Skip notifications that don't target our version
                if (!IsNotificationForCurrentVersion(remoteNotification, currentAppVersion))
                {
                    continue;
                }

                var validFromTs = ((DateTimeOffset)remoteNotification.ValidFrom).ToUnixTimeSeconds();
                var validUntilTs = ((DateTimeOffset)remoteNotification.ValidUntil).ToUnixTimeSeconds();

                // Skip notifications that are not currently valid
                if (now < validFromTs || now > validUntilTs)
                {
                    continue;
                }

                var existingNotification = await context.Notifications
                    .FirstOrDefaultAsync(n => n.Id == remoteNotification.Id);

                if (existingNotification == null)
                {
                    // Create new notification
                    var notification = new Notification
                    {
                        Id = remoteNotification.Id,
                        Type = Enum.Parse<NotificationType>(remoteNotification.Type, true),
                        Priority = Enum.Parse<NotificationPriority>(remoteNotification.Priority, true),
                        Title = remoteNotification.Title,
                        Message = remoteNotification.Message,
                        ActionUrl = remoteNotification.ActionUrl,
                        ActionText = remoteNotification.ActionText,
                        ValidFromTs = validFromTs,
                        ValidUntilTs = validUntilTs,
                        TargetVersions = remoteNotification.TargetVersions != null
                            ? string.Join(",", remoteNotification.TargetVersions)
                            : null,
                        ShowOnce = remoteNotification.ShowOnce,
                        IsRead = false,
                        IsShown = false,
                        CreatedTs = now
                    };

                    context.Notifications.Add(notification);
                    newNotifications++;

                    _logger.LogDebug("Added new notification: {Id} - {Title}",
                        notification.Id, notification.Title);
                }
                else
                {
                    // Update existing notification if content changed
                    var hasChanges = false;

                    if (existingNotification.Title != remoteNotification.Title)
                    {
                        existingNotification.Title = remoteNotification.Title;
                        hasChanges = true;
                    }

                    if (existingNotification.Message != remoteNotification.Message)
                    {
                        existingNotification.Message = remoteNotification.Message;
                        hasChanges = true;
                    }

                    if (existingNotification.ActionUrl != remoteNotification.ActionUrl)
                    {
                        existingNotification.ActionUrl = remoteNotification.ActionUrl;
                        hasChanges = true;
                    }

                    if (hasChanges)
                    {
                        updatedNotifications++;
                        _logger.LogDebug("Updated notification: {Id} - {Title}",
                            existingNotification.Id, existingNotification.Title);
                    }
                }
            }

            // Remove expired notifications
            var expiredNotifications = await context.Notifications
                .Where(n => n.ValidUntilTs < now)
                .ToListAsync();

            if (expiredNotifications.Any())
            {
                context.Notifications.RemoveRange(expiredNotifications);
                _logger.LogDebug("Removed {Count} expired notifications", expiredNotifications.Count);
            }

            await context.SaveChangesAsync();

            await RecordFetchResult(true, null, response.Version,
                response.LastUpdated.ToString("O"), response.Notifications.Count);

            if (newNotifications > 0 || updatedNotifications > 0)
            {
                _logger.LogInformation("Processed notifications: {New} new, {Updated} updated, {Expired} expired",
                    newNotifications, updatedNotifications, expiredNotifications.Count);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing notifications");
            await RecordFetchResult(false, $"Processing error: {ex.Message}",
                response.Version, response.LastUpdated.ToString("O"), response.Notifications.Count);
            throw;
        }
    }

    private bool IsNotificationForCurrentVersion(RemoteNotificationDto notification, string currentVersion)
    {
        if (notification.TargetVersions == null || notification.TargetVersions.Length == 0)
        {
            return true; // No version restriction
        }

        foreach (var versionPattern in notification.TargetVersions)
        {
            if (IsVersionMatch(currentVersion, versionPattern))
            {
                return true;
            }
        }

        return false;
    }

    private bool IsVersionMatch(string currentVersion, string pattern)
    {
        // Simple version matching - you can make this more sophisticated
        // Supports patterns like ">=1.0.0", "1.2.*", "1.2.0"

        if (pattern.StartsWith(">="))
        {
            var minVersion = pattern.Substring(2);
            return string.Compare(currentVersion, minVersion, StringComparison.OrdinalIgnoreCase) >= 0;
        }

        if (pattern.EndsWith("*"))
        {
            var prefix = pattern.Substring(0, pattern.Length - 1);
            return currentVersion.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
        }

        return string.Equals(currentVersion, pattern, StringComparison.OrdinalIgnoreCase);
    }

    private string GetCurrentAppVersion()
    {
        try
        {
            var version = System.Reflection.Assembly.GetExecutingAssembly().GetName().Version;
            return version?.ToString() ?? "1.0.0";
        }
        catch
        {
            return "1.0.0";
        }
    }

    private async Task RecordFetchResult(bool success, string? error, string? remoteVersion,
        string? remoteLastUpdated, int notificationCount)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<PulseDbContext>();

            var fetchRecord = new NotificationFetch
            {
                FetchTs = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                RemoteVersion = remoteVersion ?? "unknown",
                RemoteLastUpdated = remoteLastUpdated ?? DateTime.UtcNow.ToString("O"),
                NotificationCount = notificationCount,
                Success = success,
                Error = error
            };

            context.NotificationFetches.Add(fetchRecord);
            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to record notification fetch result");
        }
    }
}