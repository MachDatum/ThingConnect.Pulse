using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class NotificationController : ControllerBase
{
    private readonly PulseDbContext _context;
    private readonly ILogger<NotificationController> _logger;
    private readonly INotificationService _notificationService;

    public NotificationController(PulseDbContext context, ILogger<NotificationController> logger, INotificationService notificationService)
    {
        _context = context;
        _logger = logger;
        _notificationService = notificationService;
    }

    /// <summary>
    /// Get active notifications for the current user.
    /// </summary>
    /// <param name="includeRead">Whether to include already read notifications.</param>
    /// <returns>List of active notifications.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<NotificationDto>>> GetNotificationsAsync(
        [FromQuery] bool includeRead = false)
    {
        try
        {
            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            var query = _context.Notifications
                .Where(n => n.ValidFromTs <= now && n.ValidUntilTs >= now);

            if (!includeRead)
            {
                query = query.Where(n => !n.IsRead);
            }

            var notifications = await query
                .OrderByDescending(n => n.Priority)
                .ThenByDescending(n => n.CreatedTs)
                .Select(n => new NotificationDto(
                    n.Id,
                    n.Type.ToString(),
                    n.Priority.ToString(),
                    n.Title,
                    n.Message,
                    n.ActionUrl,
                    n.ActionText,
                    DateTimeOffset.FromUnixTimeSeconds(n.ValidFromTs).DateTime,
                    DateTimeOffset.FromUnixTimeSeconds(n.ValidUntilTs).DateTime,
                    n.IsRead,
                    n.IsShown,
                    DateTimeOffset.FromUnixTimeSeconds(n.CreatedTs).DateTime
                ))
                .ToListAsync();

            _logger.LogDebug("Retrieved {Count} notifications (includeRead: {IncludeRead})",
                notifications.Count, includeRead);

            return Ok(notifications);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notifications");
            return StatusCode(500, new { message = "Internal server error while retrieving notifications" });
        }
    }

    /// <summary>
    /// Mark a notification as read.
    /// </summary>
    /// <param name="request">The notification ID to mark as read.</param>
    /// <returns>Success response.</returns>
    [HttpPost("mark-read")]
    public async Task<ActionResult> MarkNotificationReadAsync([FromBody] MarkNotificationReadRequest request)
    {
        try
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == request.NotificationId);

            if (notification == null)
            {
                return NotFound(new { message = "Notification not found" });
            }

            if (!notification.IsRead)
            {
                notification.IsRead = true;
                notification.ReadTs = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

                await _context.SaveChangesAsync();

                _logger.LogDebug("Marked notification as read: {NotificationId}", request.NotificationId);
            }

            return Ok(new { message = "Notification marked as read" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as read: {NotificationId}", request.NotificationId);
            return StatusCode(500, new { message = "Internal server error while marking notification as read" });
        }
    }

    /// <summary>
    /// Mark a notification as shown (for tracking purposes).
    /// </summary>
    /// <param name="notificationId">The notification ID to mark as shown.</param>
    /// <returns>Success response.</returns>
    [HttpPost("{notificationId}/mark-shown")]
    public async Task<ActionResult> MarkNotificationShownAsync(string notificationId)
    {
        try
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId);

            if (notification == null)
            {
                return NotFound(new { message = "Notification not found" });
            }

            if (!notification.IsShown)
            {
                notification.IsShown = true;
                notification.ShownTs = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

                await _context.SaveChangesAsync();

                _logger.LogDebug("Marked notification as shown: {NotificationId}", notificationId);
            }

            return Ok(new { message = "Notification marked as shown" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error marking notification as shown: {NotificationId}", notificationId);
            return StatusCode(500, new { message = "Internal server error while marking notification as shown" });
        }
    }

    /// <summary>
    /// Get notification statistics and settings.
    /// </summary>
    /// <returns>Notification statistics.</returns>
    [HttpGet("stats")]
    public async Task<ActionResult> GetNotificationStatsAsync()
    {
        try
        {
            var now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            var activeCount = await _context.Notifications
                .CountAsync(n => n.ValidFromTs <= now && n.ValidUntilTs >= now);

            var unreadCount = await _context.Notifications
                .CountAsync(n => n.ValidFromTs <= now && n.ValidUntilTs >= now && !n.IsRead);

            var lastFetch = await _context.NotificationFetches
                .OrderByDescending(f => f.FetchTs)
                .FirstOrDefaultAsync();

            var stats = new
            {
                ActiveNotifications = activeCount,
                UnreadNotifications = unreadCount,
                LastFetch = lastFetch != null
                    ? DateTimeOffset.FromUnixTimeSeconds(lastFetch.FetchTs).DateTime
                    : (DateTime?)null,
                LastFetchSuccess = lastFetch?.Success ?? false,
                LastFetchError = lastFetch?.Error
            };

            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notification stats");
            return StatusCode(500, new { message = "Internal server error while retrieving notification stats" });
        }
    }

    /// <summary>
    /// Force refresh notifications from remote server (admin only).
    /// </summary>
    /// <returns>Success response.</returns>
    [HttpPost("refresh")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> ForceRefreshNotificationsAsync()
    {
        try
        {
            _logger.LogInformation("Manual notification refresh requested by admin");

            // Trigger the background service to fetch immediately
            await _notificationService.TriggerManualFetchAsync();

            return Ok(new { message = "Notification refresh completed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error triggering notification refresh");
            return StatusCode(500, new { message = "Internal server error while refreshing notifications" });
        }
    }
}