using ThingConnect.Pulse.Server.Data;

namespace ThingConnect.Pulse.Server.Models;

public record NotificationDto(
    string Id,
    string Type,
    string Priority,
    string Title,
    string Message,
    string? ActionUrl,
    string? ActionText,
    DateTime ValidFrom,
    DateTime ValidUntil,
    bool IsRead,
    bool IsShown,
    DateTime Created
);

public record NotificationResponseDto(
    string Version,
    DateTime LastUpdated,
    List<RemoteNotificationDto> Notifications
);

public record RemoteNotificationDto(
    string Id,
    string Type,
    string Priority,
    string Title,
    string Message,
    string? ActionUrl,
    string? ActionText,
    DateTime ValidFrom,
    DateTime ValidUntil,
    string[]? TargetVersions,
    bool ShowOnce
);

public record MarkNotificationReadRequest(string NotificationId);

public record NotificationSettingsDto(
    string NotificationEndpoint,
    int CheckIntervalHours,
    bool EnableNotifications
);