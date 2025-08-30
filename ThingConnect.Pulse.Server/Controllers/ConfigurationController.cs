using Microsoft.AspNetCore.Mvc;
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
    /// <param name="yamlContent">Full YAML contents</param>
    /// <returns>Apply result with counts of changes made</returns>
    [HttpPost("apply")]
    public async Task<ActionResult<ApplyResultDto>> ApplyAsync()
    {
        try
        {
            using StreamReader reader = new StreamReader(Request.Body);
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

            ApplyResultDto result = await _configurationService.ApplyConfigurationAsync(
                yamlContent,
                Request.Headers["X-Actor"].FirstOrDefault(),
                Request.Headers["X-Note"].FirstOrDefault());

            return Ok(result);
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
}
