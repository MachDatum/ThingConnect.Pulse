using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Data;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ConfigurationController : ControllerBase
{
    private readonly IConfigurationService _configurationService;

    public ConfigurationController(IConfigurationService configurationService)
    {
        _configurationService = configurationService;
    }

    /// <summary>
    /// Validate and apply YAML configuration
    /// </summary>
    /// <param name="dryRun">If true, only validate and preview changes without applying</param>
    /// <returns>Apply result with counts of changes made or preview of changes</returns>
    [HttpPost("apply")]
    [Authorize(Roles = UserRoles.Administrator)]
    public async Task<ActionResult<ApplyResultDto>> ApplyAsync([FromQuery] bool dryRun = false)
    {
        try
        {
            using var reader = new StreamReader(Request.Body);
            string yamlContent = await reader.ReadToEndAsync();

            if (string.IsNullOrWhiteSpace(yamlContent))
            {
                return BadRequest(new ValidationErrorsDto
                {
                    Message = "YAML content is required",
                    Errors = new List<ValidationError>
                    {
                        new() { Path = "", Message = "YAML content cannot be empty", Value = null }
                    }
                });
            }

            ApplyResultDto result;
            if (dryRun)
            {
                result = await _configurationService.PreviewChangesAsync(yamlContent);
            }
            else
            {
                result = await _configurationService.ApplyConfigurationAsync(
                    yamlContent,
                    Request.Headers["X-Actor"].FirstOrDefault(),
                    Request.Headers["X-Note"].FirstOrDefault());
            }

            return Ok(result);
        }
        catch (ConfigurationValidationException ex)
        {
            return BadRequest(ex.ValidationErrors);
        }
        catch (InvalidOperationException ex) when (ex.Message.StartsWith("Validation failed"))
        {
            return BadRequest(new ValidationErrorsDto
            {
                Message = ex.Message,
                Errors = new List<ValidationError>
                {
                    new() { Path = "", Message = ex.Message, Value = null }
                }
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new ValidationErrorsDto
            {
                Message = "Internal server error while applying configuration",
                Errors = new List<ValidationError>
                {
                    new() { Path = "", Message = ex.Message, Value = null }
                }
            });
        }
    }

    /// <summary>
    /// List all configuration versions
    /// </summary>
    /// <returns>List of configuration versions ordered by applied timestamp descending</returns>
    [HttpGet("versions")]
    [Authorize]
    public async Task<ActionResult<List<ConfigurationVersionDto>>> GetVersionsAsync()
    {
        try
        {
            List<ConfigurationVersionDto> versions = await _configurationService.GetVersionsAsync();
            return Ok(versions);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve configuration versions", error = ex.Message });
        }
    }

    /// <summary>
    /// Download a specific configuration version as YAML
    /// </summary>
    /// <param name="id">Configuration version ID</param>
    /// <returns>Plain YAML content</returns>
    [HttpGet("versions/{id}")]
    [Authorize]
    public async Task<ActionResult> GetVersionAsync(string id)
    {
        try
        {
            string? content = await _configurationService.GetVersionContentAsync(id);
            if (content == null)
            {
                return NotFound(new { message = "Configuration version not found" });
            }

            return Content(content, "text/plain");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve configuration version", error = ex.Message });
        }
    }

    /// <summary>
    /// Get the current active configuration as YAML
    /// </summary>
    /// <returns>Plain YAML content of the active configuration</returns>
    [HttpGet("current")]
    [Authorize]
    public async Task<ActionResult> GetCurrentAsync()
    {
        try
        {
            string? content = await _configurationService.GetCurrentConfigurationAsync();
            if (content == null)
            {
                return NotFound(new { message = "No configuration found and no sample configuration available" });
            }

            return Content(content, "text/plain");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve current configuration", error = ex.Message });
        }
    }
}
