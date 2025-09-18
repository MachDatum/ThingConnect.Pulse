# ThingConnect Pulse Notification System

## Overview

The ThingConnect Pulse notification system allows you to push notifications to all running instances of the application through a simple JSON file hosted on AWS S3. The system automatically fetches notifications every 6 hours and displays them to users.

## Architecture

```
S3 Bucket (thingconnect-pulse.s3.ap-south-1.amazonaws.com)
    └── notifications/
        └── latest.json
                ↓
    ThingConnect Pulse App (Background Service)
                ↓
    Local SQLite Database
                ↓
    Frontend UI (Bell Icon → Popover)
```

## S3 Setup and File Structure

### S3 Bucket Configuration

**Bucket Details:**
- **Bucket Name**: `thingconnect-pulse`
- **Region**: `ap-south-1` (Asia Pacific - Mumbai)
- **Endpoint**: `https://thingconnect-pulse.s3.ap-south-1.amazonaws.com/notifications/latest.json`

**Required S3 Permissions:**
The S3 bucket must allow public read access for the notifications file:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::thingconnect-pulse/notifications/*"
        }
    ]
}
```

**CORS Configuration:**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### Notification File Format

The notification file must be named `latest.json` and placed in the `notifications/` folder of the S3 bucket.

**File Path**: `s3://thingconnect-pulse/notifications/latest.json`

**JSON Schema:**

```json
{
    "version": "1.0.0",
    "lastUpdated": "2024-01-15T10:30:00Z",
    "notifications": [
        {
            "id": "new-unique-notification-id",
            "type": "release|maintenance|warning|info",
            "priority": "low|medium|high|critical",
            "title": "Notification Title",
            "message": "Detailed notification message",
            "actionUrl": "https://example.com/action",
            "actionText": "View Details",
            "validFrom": "2024-01-15T00:00:00Z",
            "validUntil": "2024-01-30T23:59:59Z",
            "targetVersions": [">=1.0.0"],
            "showOnce": false
        }
    ]
}
```

## Notification Properties

### Root Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `version` | string | Yes | Version of the notification format |
| `lastUpdated` | string (ISO 8601) | Yes | Timestamp when the file was last updated |
| `notifications` | array | Yes | Array of notification objects |

### Notification Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the notification |
| `type` | enum | Yes | Notification type: `release`, `maintenance`, `warning`, `info` |
| `priority` | enum | Yes | Priority level: `low`, `medium`, `high`, `critical` |
| `title` | string | Yes | Short notification title (max 100 chars) |
| `message` | string | Yes | Detailed notification message |
| `actionUrl` | string | No | URL to open when action button is clicked |
| `actionText` | string | No | Text for the action button (default: "Learn More") |
| `validFrom` | string (ISO 8601) | Yes | When the notification becomes active |
| `validUntil` | string (ISO 8601) | Yes | When the notification expires |
| `targetVersions` | array | No | Version patterns this notification targets |
| `showOnce` | boolean | No | Whether to show only once per user (default: false) |

### Notification Types and Visual Styling

| Type | Icon | Color Theme | Use Case |
|------|------|-------------|----------|
| `release` | Download | Green | New version releases, feature announcements |
| `maintenance` | Settings | Blue | Scheduled maintenance, system updates |
| `warning` | Alert Triangle | Yellow/Orange | Important warnings, deprecations |
| `info` | Info | Blue | General information, tips |

### Priority Levels and Behavior

| Priority | Badge Color | Behavior |
|----------|-------------|----------|
| `low` | Gray | Normal notification |
| `medium` | Blue | Normal notification |
| `high` | Orange | Highlighted notification |
| `critical` | Red | Top bar notification + highlighted |

### Version Targeting

The `targetVersions` array supports flexible version patterns:

- `"1.2.0"` - Exact version match
- `">=1.0.0"` - Minimum version requirement
- `"1.2.*"` - Wildcard pattern matching
- `null` or `[]` - Show to all versions

## Example Notification File

```json
{
    "version": "1.0.0",
    "lastUpdated": "2024-01-15T10:30:00Z",
    "notifications": [
        {
            "id": "new-release-v1.2.0",
            "type": "release",
            "priority": "medium",
            "title": "ThingConnect Pulse v1.2.0 Released",
            "message": "New features include enhanced monitoring capabilities, improved dashboard, and performance optimizations.",
            "actionUrl": "https://github.com/MachDatum/ThingConnect.Pulse/releases/tag/v1.2.0",
            "actionText": "View Release Notes",
            "validFrom": "2024-01-15T00:00:00Z",
            "validUntil": "2024-02-15T23:59:59Z",
            "targetVersions": [">=1.0.0"],
            "showOnce": false
        },
        {
            "id": "new-maintenance-jan-2024",
            "type": "maintenance",
            "priority": "high",
            "title": "Scheduled Maintenance",
            "message": "Our notification service will undergo maintenance on January 20th from 2:00 AM to 4:00 AM UTC.",
            "actionUrl": "https://status.thingconnect.io",
            "actionText": "View Status Page",
            "validFrom": "2024-01-18T00:00:00Z",
            "validUntil": "2024-01-21T00:00:00Z",
            "targetVersions": [],
            "showOnce": false
        },
        {
            "id": "new-critical-security-update",
            "type": "warning",
            "priority": "critical",
            "title": "Security Update Required",
            "message": "A critical security vulnerability has been discovered. Please update to the latest version immediately.",
            "actionUrl": "https://github.com/MachDatum/ThingConnect.Pulse/releases/latest",
            "actionText": "Download Update",
            "validFrom": "2024-01-10T00:00:00Z",
            "validUntil": "2024-02-10T23:59:59Z",
            "targetVersions": ["<1.1.5"],
            "showOnce": true
        }
    ]
}
```

## How to Update Notifications

### Step 1: Prepare the JSON File

1. Create or edit the `latest.json` file following the schema above
2. Validate the JSON format using a JSON validator
3. Ensure all required fields are present
4. Verify date formats are in ISO 8601 format

### Step 2: Upload to S3

**Using AWS Console:**
1. Log into the AWS S3 Console
2. Navigate to the `thingconnect-pulse` bucket
3. Go to the `notifications/` folder
4. Upload or replace the `latest.json` file
5. Ensure the file has public read permissions

**Using AWS CLI:**
```bash
aws s3 cp latest.json s3://thingconnect-pulse/notifications/latest.json --acl public-read
```

**Using AWS SDK (Node.js example):**
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3();

const params = {
    Bucket: 'thingconnect-pulse',
    Key: 'notifications/latest.json',
    Body: JSON.stringify(notificationData),
    ContentType: 'application/json',
    ACL: 'public-read'
};

s3.upload(params, (err, data) => {
    if (err) console.error(err);
    else console.log('File uploaded successfully');
});
```

### Step 3: Verify the Update

1. **Check S3 URL**: Visit `https://thingconnect-pulse.s3.ap-south-1.amazonaws.com/notifications/latest.json`
2. **Test in Application**:
   - Use the manual refresh button in the About page
   - Or wait for the automatic 6-hour sync
3. **Monitor Logs**: Check server logs for any fetch errors

## Testing Notifications

### Local Testing

For testing during development, you can modify the endpoint URL in the configuration:

**File**: `ThingConnect.Pulse.Server/Services/NotificationBackgroundService.cs`

```csharp
public class NotificationFetchOptions
{
    public string NotificationEndpoint { get; set; } = "http://localhost:3000/test-notifications.json"; // For testing
    public int CheckIntervalHours { get; set; } = 6;
    public bool EnableNotifications { get; set; } = true;
    public int TimeoutSeconds { get; set; } = 30;
}
```

### Testing Scenarios

1. **Valid Notifications**: Upload a valid JSON file and verify it appears
2. **Invalid JSON**: Upload malformed JSON and check error handling
3. **Expired Notifications**: Test with past `validUntil` dates
4. **Version Targeting**: Test with different `targetVersions` patterns
5. **Priority Levels**: Test different priority levels and visual styling
6. **Action URLs**: Test clicking notification action buttons

## Backend Implementation Files

### Core Files

| File | Purpose | Description |
|------|---------|-------------|
| `Services/NotificationBackgroundService.cs` | Background sync | Fetches notifications every 6 hours |
| `Controllers/NotificationController.cs` | API endpoints | REST API for frontend |
| `Data/Entities.cs` | Database models | EF Core entities for notifications |
| `Models/NotificationDtos.cs` | Data transfer objects | API request/response models |

### Database Schema

The notifications are stored locally in SQLite with these tables:

**Notifications Table:**
- `Id` (string, primary key)
- `Type` (enum: release, maintenance, warning, info)
- `Priority` (enum: low, medium, high, critical)
- `Title`, `Message`, `ActionUrl`, `ActionText`
- `ValidFromTs`, `ValidUntilTs` (Unix timestamps)
- `IsRead`, `IsShown` (tracking user interaction)
- `CreatedTs`, `ReadTs`, `ShownTs` (timestamps)

**NotificationFetches Table:**
- Tracks fetch attempts, success/failure, error messages
- Used for monitoring and debugging

## Frontend Implementation Files

### Core Components

| File | Purpose | Description |
|------|---------|-------------|
| `components/notifications/NotificationBellSimple.tsx` | Bell icon | Shows in top-right corner |
| `components/notifications/NotificationCenterSimple.tsx` | Notification list | Popover content |
| `components/notifications/NotificationBannerSimple.tsx` | Individual notification | Single notification display |
| `components/notifications/NotificationTopBar.tsx` | Critical notifications | Top bar for critical alerts |
| `hooks/useNotifications.ts` | Data fetching | React Query hooks |

### UI Locations

1. **Notification Bell**: Top-right corner floating actions
2. **Notification Popover**: Dropdown from bell icon
3. **Demo Page**: `/settings/notifications` (admin only)
4. **About Page**: Manual refresh section

## Configuration

### Backend Configuration

The notification system is configured via these options:

```csharp
public class NotificationFetchOptions
{
    public string NotificationEndpoint { get; set; } = "https://thingconnect-pulse.s3.ap-south-1.amazonaws.com/notifications/latest.json";
    public int CheckIntervalHours { get; set; } = 6;
    public bool EnableNotifications { get; set; } = true;
    public int TimeoutSeconds { get; set; } = 30;
}
```

**Configuration via appsettings.json:**
```json
{
    "Notifications": {
        "NotificationEndpoint": "https://your-custom-endpoint.com/notifications.json",
        "CheckIntervalHours": 6,
        "EnableNotifications": true,
        "TimeoutSeconds": 30
    }
}
```

### Disabling Notifications

To disable the notification system:

1. Set `EnableNotifications: false` in configuration
2. Or remove the background service registration from `Program.cs`

## Manual Refresh API

Users with admin privileges can manually trigger a notification refresh:

**Endpoint**: `POST /api/notification/refresh`
**Authorization**: Admin only
**Response**: Success/error message

**Frontend Usage**:
- Available on the About page
- Button labeled "Refresh Notifications"
- Shows loading state and success/error feedback

## Monitoring and Troubleshooting

### Logs

The notification system logs important events:

- Successful fetches: `Successfully fetched X notifications`
- Network errors: `Network error fetching notifications`
- JSON errors: `JSON parsing error`
- Processing errors: `Error processing notifications`

### Common Issues

1. **Notifications not appearing**:
   - Check S3 file is publicly accessible
   - Verify JSON format is valid
   - Check `validFrom`/`validUntil` dates
   - Ensure target versions match

2. **Fetch errors**:
   - Network connectivity issues
   - S3 bucket permissions
   - CORS configuration
   - Timeout settings

3. **Popover positioning issues**:
   - Check CSS z-index conflicts
   - Verify Chakra UI version compatibility

### Health Check

You can monitor notification system health via:

1. **Database**: Check `NotificationFetches` table for recent successful fetches
2. **API**: Call `/api/notification/stats` for current status
3. **Logs**: Monitor application logs for fetch attempts
4. **Manual Test**: Use refresh button on About page

## Security Considerations

1. **Public S3 Access**: The notification file is publicly readable
2. **Content Safety**: Ensure notification content is safe and appropriate
3. **URL Validation**: Action URLs should be trusted domains only
4. **Version Targeting**: Use carefully to avoid information disclosure
5. **Input Validation**: Backend validates all notification data

## Best Practices

1. **Testing**: Always test notifications in a staging environment first
2. **Scheduling**: Update notifications during low-usage periods
3. **Versioning**: Use semantic versioning for targeting
4. **Urgency**: Use critical priority sparingly for true emergencies
5. **Expiration**: Set reasonable expiration dates to avoid clutter
6. **Clarity**: Write clear, actionable notification messages
7. **Monitoring**: Regularly check fetch logs for issues

## Future Enhancements

Potential improvements to consider:

1. **Multiple Channels**: Different notification types for different user roles
2. **Rich Content**: Support for HTML formatting or images
3. **Localization**: Multi-language support
4. **Analytics**: Track notification engagement metrics
5. **Scheduling**: Advanced scheduling and timezone support
6. **Templates**: Predefined notification templates
7. **Approval Workflow**: Review process before publishing notifications