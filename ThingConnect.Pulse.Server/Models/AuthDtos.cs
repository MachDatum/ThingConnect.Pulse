using System.ComponentModel.DataAnnotations;

namespace ThingConnect.Pulse.Server.Models;

public sealed class LoginRequestDto
{
    [Required]
    [StringLength(256)]
    public string Username { get; set; } = default!;
    
    [Required]
    [StringLength(100)]
    public string Password { get; set; } = default!;
}

public sealed class LoginResponseDto
{
    public string Token { get; set; } = default!;
    public DateTime ExpiresAt { get; set; }
    public UserInfoDto User { get; set; } = default!;
}

public sealed class RegisterRequestDto
{
    [Required]
    [StringLength(256)]
    public string Username { get; set; } = default!;
    
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = default!;
    
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = default!;
    
    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = default!;
}

public sealed class UserInfoDto
{
    public string Id { get; set; } = default!;
    public string Username { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Role { get; set; } = default!;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
    public bool IsActive { get; set; }
}

public sealed class CreateUserDto
{
    [Required]
    [StringLength(256)]
    public string Username { get; set; } = default!;
    
    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = default!;
    
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string Password { get; set; } = default!;
    
    [Required]
    public string Role { get; set; } = default!;
}

public sealed class UpdateUserDto
{
    [StringLength(256)]
    public string? Username { get; set; }
    
    [EmailAddress]
    [StringLength(256)]
    public string? Email { get; set; }
    
    public bool? IsActive { get; set; }
}

public sealed class ChangeRoleDto
{
    [Required]
    public string Role { get; set; } = default!;
}

public sealed class ResetPasswordDto
{
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = default!;
}

public sealed class ChangePasswordDto
{
    [Required]
    public string CurrentPassword { get; set; } = default!;
    
    [Required]
    [StringLength(100, MinimumLength = 8)]
    public string NewPassword { get; set; } = default!;
    
    [Required]
    [Compare("NewPassword")]
    public string ConfirmPassword { get; set; } = default!;
}