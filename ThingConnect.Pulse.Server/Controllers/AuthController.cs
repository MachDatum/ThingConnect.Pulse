using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ILogger<AuthController> _logger;
    private readonly ISettingsService _settingsService;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        ILogger<AuthController> logger,
        ISettingsService settingsService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _logger = logger;
        _settingsService = settingsService;
    }

    /// <summary>
    /// User login - creates authentication cookie
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<UserInfoDto>> LoginAsync([FromBody] LoginRequestDto request)
    {
        try
        {
            ApplicationUser? user = await _userManager.FindByNameAsync(request.Username);
            if (user == null)
            {
                _logger.LogWarning("Login attempt for non-existent user: {Username}", request.Username);
                return Unauthorized(new { message = "Invalid username or password" });
            }

            if (!user.IsActive)
            {
                _logger.LogWarning("Login attempt for inactive user: {Username}", request.Username);
                return Unauthorized(new { message = "Account is inactive" });
            }

            Microsoft.AspNetCore.Identity.SignInResult result = await _signInManager.PasswordSignInAsync(user, request.Password, isPersistent: true, lockoutOnFailure: true);

            if (!result.Succeeded)
            {
                if (result.IsLockedOut)
                {
                    _logger.LogWarning("Account locked out for user: {Username}", request.Username);
                    return Unauthorized(new { message = "Account is locked due to multiple failed login attempts" });
                }

                _logger.LogWarning("Invalid login attempt for user: {Username}", request.Username);
                return Unauthorized(new { message = "Invalid username or password" });
            }

            // Update last login time
            user.LastLoginAt = DateTimeOffset.UtcNow;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Successful login for user: {Username} (ID: {UserId})", user.UserName, user.Id);

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
            _logger.LogError(ex, "Error during login for user: {Username}", request.Username);
            return StatusCode(500, new { message = "Internal server error during login" });
        }
    }

    /// <summary>
    /// Initial user registration - only allows admin creation if no users exist
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<UserInfoDto>> RegisterAsync([FromBody] RegisterRequestDto request)
    {
        try
        {
            // Only allow registration if no users exist (initial admin setup)
            int userCount = _userManager.Users.Count();
            if (userCount > 0)
            {
                _logger.LogWarning("Registration attempt when users already exist");
                return BadRequest(new { message = "Registration is not allowed. Contact an administrator to create accounts." });
            }

            var user = new ApplicationUser
            {
                UserName = request.Username,
                Email = request.Email,
                Role = UserRoles.Administrator, // First user is always admin
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
                IsActive = true
            };

            IdentityResult result = await _userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Registration failed for {Username}: {Errors}", request.Username, string.Join(", ", errors));
                return BadRequest(new { message = "Registration failed", errors });
            }

            // Sign in the user immediately after successful registration
            await _signInManager.SignInAsync(user, isPersistent: true);
            
            // Update last login time since we just signed them in
            user.LastLoginAt = DateTimeOffset.UtcNow;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Initial admin user created and signed in: {Username} (ID: {UserId})", user.UserName, user.Id);

            return Ok(new UserInfoDto
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
            _logger.LogError(ex, "Error during registration for user: {Username}", request.Username);
            return StatusCode(500, new { message = "Internal server error during registration" });
        }
    }

    /// <summary>
    /// Check if initial setup is needed
    /// </summary>
    [HttpGet("setup-required")]
    public ActionResult<bool> IsSetupRequired()
    {
        try
        {
            int userCount = _userManager.Users.Count();
            return Ok(userCount == 0);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking setup requirement");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get current user session information
    /// </summary>
    [HttpGet("session")]
    [Authorize]
    public async Task<ActionResult<UserInfoDto>> GetSessionAsync()
    {
        try
        {
            ApplicationUser? user = await _userManager.GetUserAsync(User);
            if (user == null || !user.IsActive)
            {
                return Unauthorized(new { message = "Session invalid or user inactive" });
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
            _logger.LogError(ex, "Error getting session info");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Change user's own password
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePasswordAsync([FromBody] ChangePasswordDto request)
    {
        try
        {
            ApplicationUser? user = await _userManager.GetUserAsync(User);
            if (user == null || !user.IsActive)
            {
                return Unauthorized(new { message = "Session invalid or user inactive" });
            }

            IdentityResult result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = result.Errors.Select(e => e.Description).ToList();
                _logger.LogWarning("Password change failed for user {UserId}: {Errors}", user.Id, string.Join(", ", errors));
                return BadRequest(new { message = "Password change failed", errors });
            }

            user.UpdatedAt = DateTimeOffset.UtcNow;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Password changed successfully for user {UserId}", user.Id);
            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Logout - removes authentication cookie
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> LogoutAsync()
    {
        try
        {
            ApplicationUser? user = await _userManager.GetUserAsync(User);
            await _signInManager.SignOutAsync();

            if (user != null)
            {
                _logger.LogInformation("User {Username} (ID: {UserId}) logged out", user.UserName, user.Id);
            }

            return Ok(new { message = "Logged out successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Save telemetry consent settings during onboarding
    /// </summary>
    [HttpPost("telemetry-consent")]
    public async Task<IActionResult> SaveTelemetryConsentAsync([FromBody] TelemetryConsentDto request)
    {
        try
        {
            // Save telemetry consent settings
            await _settingsService.SetAsync("telemetry_error_diagnostics", request.ErrorDiagnostics.ToString().ToLowerInvariant());
            await _settingsService.SetAsync("telemetry_usage_analytics", request.UsageAnalytics.ToString().ToLowerInvariant());
            await _settingsService.SetAsync("telemetry_consent_timestamp", DateTimeOffset.UtcNow);

            _logger.LogInformation("Telemetry consent saved: ErrorDiagnostics={ErrorDiagnostics}, UsageAnalytics={UsageAnalytics}",
                request.ErrorDiagnostics, request.UsageAnalytics);

            return Ok(new { message = "Telemetry consent saved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving telemetry consent");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    /// <summary>
    /// Get current telemetry consent settings
    /// </summary>
    [HttpGet("telemetry-consent")]
    public async Task<ActionResult<TelemetryConsentDto>> GetTelemetryConsentAsync()
    {
        try
        {
            string? errorDiagnostics = await _settingsService.GetAsync("telemetry_error_diagnostics");
            string? usageAnalytics = await _settingsService.GetAsync("telemetry_usage_analytics");

            return Ok(new TelemetryConsentDto
            {
                ErrorDiagnostics = bool.TryParse(errorDiagnostics, out bool errorValue) && errorValue,
                UsageAnalytics = bool.TryParse(usageAnalytics, out bool usageValue) && usageValue
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting telemetry consent");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}