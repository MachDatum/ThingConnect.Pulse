using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;

namespace ThingConnect.Pulse.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = UserRoles.Administrator)]
public sealed class UserManagementController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<UserManagementController> _logger;

    public UserManagementController(
        UserManager<ApplicationUser> userManager,
        ILogger<UserManagementController> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    /// <summary>
    /// Get all users with pagination
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<PagedResult<UserInfoDto>>> GetUsersAsync(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null)
    {
        try
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            var query = _userManager.Users.AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(u => 
                    u.UserName!.ToLower().Contains(searchLower) || 
                    u.Email!.ToLower().Contains(searchLower));
            }

            if (!string.IsNullOrWhiteSpace(role))
            {
                query = query.Where(u => u.Role == role);
            }

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();
            
            var users = await query
                .OrderBy(u => u.UserName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserInfoDto
                {
                    Id = u.Id,
                    Username = u.UserName!,
                    Email = u.Email!,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt,
                    LastLoginAt = u.LastLoginAt,
                    IsActive = u.IsActive
                })
                .ToListAsync();

            var result = new PagedResult<UserInfoDto>
            {
                Items = users,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            };

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users list");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<UserInfoDto>> GetUserByIdAsync(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new UserInfoDto
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                IsActive = user.IsActive
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Create a new user
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<UserInfoDto>> CreateUserAsync([FromBody] CreateUserDto request)
    {
        try
        {
            // Validate role
            if (!UserRoles.AllRoles.Contains(request.Role))
            {
                return BadRequest(new { message = $"Invalid role. Allowed roles: {string.Join(", ", UserRoles.AllRoles)}" });
            }

            // Check if username or email already exists
            var existingUser = await _userManager.FindByNameAsync(request.Username);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Username already exists" });
            }

            existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already exists" });
            }

            var user = new ApplicationUser
            {
                UserName = request.Username,
                Email = request.Email,
                Role = request.Role,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsActive = true
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("User creation failed for {Username}: {Errors}", request.Username, string.Join(", ", errors));
                return BadRequest(new { message = "User creation failed", errors });
            }

            var currentUser = await _userManager.GetUserAsync(User);
            _logger.LogInformation("User created: {Username} (ID: {UserId}) by admin {AdminId}", 
                user.UserName, user.Id, currentUser?.Id);

            return CreatedAtAction(nameof(GetUserByIdAsync), new { id = user.Id }, new UserInfoDto
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                IsActive = user.IsActive
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user {Username}", request.Username);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Update user details
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<UserInfoDto>> UpdateUserAsync(string id, [FromBody] UpdateUserDto request)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Prevent admin from deactivating themselves
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser != null && id == currentUser.Id && request.IsActive == false)
            {
                return BadRequest(new { message = "Cannot deactivate your own account" });
            }

            var changes = new List<string>();

            if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.UserName)
            {
                // Check if new username already exists
                var existingUser = await _userManager.FindByNameAsync(request.Username);
                if (existingUser != null && existingUser.Id != id)
                {
                    return BadRequest(new { message = "Username already exists" });
                }
                
                changes.Add($"Username: {user.UserName} -> {request.Username}");
                user.UserName = request.Username;
            }

            if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
            {
                // Check if new email already exists
                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null && existingUser.Id != id)
                {
                    return BadRequest(new { message = "Email already exists" });
                }
                
                changes.Add($"Email: {user.Email} -> {request.Email}");
                user.Email = request.Email;
            }

            if (request.IsActive.HasValue && request.IsActive != user.IsActive)
            {
                changes.Add($"IsActive: {user.IsActive} -> {request.IsActive}");
                user.IsActive = request.IsActive.Value;
            }

            if (changes.Any())
            {
                user.UpdatedAt = DateTimeOffset.UtcNow;
                var result = await _userManager.UpdateAsync(user);
                
                if (!result.Succeeded)
                {
                    var errors = result.Errors.Select(e => e.Description).ToList();
                    _logger.LogWarning("User update failed for {UserId}: {Errors}", id, string.Join(", ", errors));
                    return BadRequest(new { message = "User update failed", errors });
                }

                _logger.LogInformation("User {UserId} updated by admin {AdminId}. Changes: {Changes}", 
                    id, currentUser?.Id, string.Join("; ", changes));
            }

            return Ok(new UserInfoDto
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                IsActive = user.IsActive
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user {UserId}", id);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Change user role
    /// </summary>
    [HttpPut("{id}/role")]
    public async Task<ActionResult<UserInfoDto>> ChangeUserRoleAsync(string id, [FromBody] ChangeRoleDto request)
    {
        try
        {
            if (!UserRoles.AllRoles.Contains(request.Role))
            {
                return BadRequest(new { message = $"Invalid role. Allowed roles: {string.Join(", ", UserRoles.AllRoles)}" });
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Prevent admin from changing their own role if they're the only admin
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser != null && id == currentUser.Id && user.Role == UserRoles.Administrator && request.Role != UserRoles.Administrator)
            {
                var adminCount = await _userManager.Users.CountAsync(u => u.Role == UserRoles.Administrator && u.IsActive);
                if (adminCount <= 1)
                {
                    return BadRequest(new { message = "Cannot change role - you are the only active administrator" });
                }
            }

            var oldRole = user.Role;
            user.Role = request.Role;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Role change failed for user {UserId}: {Errors}", id, string.Join(", ", errors));
                return BadRequest(new { message = "Role change failed", errors });
            }

            _logger.LogInformation("User {UserId} role changed from {OldRole} to {NewRole} by admin {AdminId}", 
                id, oldRole, request.Role, currentUser?.Id);

            return Ok(new UserInfoDto
            {
                Id = user.Id,
                Username = user.UserName!,
                Email = user.Email!,
                Role = user.Role,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt,
                IsActive = user.IsActive
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing role for user {UserId}", id);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Reset user password (admin only)
    /// </summary>
    [HttpPost("{id}/reset-password")]
    public async Task<IActionResult> ResetPasswordAsync(string id, [FromBody] ResetPasswordDto request)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Remove current password and set new one
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
            
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Password reset failed for user {UserId}: {Errors}", id, string.Join(", ", errors));
                return BadRequest(new { message = "Password reset failed", errors });
            }

            user.UpdatedAt = DateTimeOffset.UtcNow;
            await _userManager.UpdateAsync(user);

            var currentUser = await _userManager.GetUserAsync(User);
            _logger.LogInformation("Password reset for user {UserId} by admin {AdminId}", 
                id, currentUser?.Id);

            return Ok(new { message = "Password reset successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for user {UserId}", id);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Delete user (soft delete - deactivate)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUserAsync(string id)
    {
        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            // Prevent admin from deleting themselves
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser != null && id == currentUser.Id)
            {
                return BadRequest(new { message = "Cannot delete your own account" });
            }

            // Check if this is the only active admin
            if (user.Role == UserRoles.Administrator && user.IsActive)
            {
                var adminCount = await _userManager.Users.CountAsync(u => u.Role == UserRoles.Administrator && u.IsActive);
                if (adminCount <= 1)
                {
                    return BadRequest(new { message = "Cannot delete the only active administrator" });
                }
            }

            // Soft delete - just deactivate the user
            user.IsActive = false;
            user.UpdatedAt = DateTimeOffset.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("User deletion failed for {UserId}: {Errors}", id, string.Join(", ", errors));
                return BadRequest(new { message = "User deletion failed", errors });
            }

            _logger.LogInformation("User {UserId} ({Username}) deactivated by admin {AdminId}", 
                id, user.UserName, currentUser?.Id);

            return Ok(new { message = "User deactivated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user {UserId}", id);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}

public sealed class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }
}