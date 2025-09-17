using Microsoft.AspNetCore.Identity;

namespace ThingConnect.Pulse.Server.Data;

public sealed class ApplicationUser : IdentityUser
{
    public string Role { get; set; } = "User";
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public static class UserRoles
{
    public const string Administrator = "Administrator";
    public const string User = "User";

    public static readonly string[] AllRoles = { Administrator, User };
}
