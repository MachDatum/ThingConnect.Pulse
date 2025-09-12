using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EndpointsController : ControllerBase
{
    private readonly IEndpointService _endpointService;
    private readonly ILogger<EndpointsController> _logger;

    public EndpointsController(
        IEndpointService endpointService, 
        ILogger<EndpointsController> logger)
    {
        _endpointService = endpointService;
        _logger = logger;
    }

    /// <summary>
    /// Retrieves details for a specific endpoint by its ID
    /// </summary>
    /// <param name="id">Unique identifier of the endpoint</param>
    /// <returns>Detailed endpoint information</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<EndpointDetailDto>> GetEndpointByIdAsync(
        [FromRoute] Guid id)
    {
        try 
        {
            _logger.LogInformation($"Attempting to retrieve endpoint details for ID: {id}");

            var endpointDetail = await _endpointService.GetEndpointByIdAsync(id);

            if (endpointDetail == null)
            {
                _logger.LogWarning($"Endpoint not found: {id}");
                return NotFound(new { 
                    message = "Endpoint not found", 
                    endpointId = id 
                });
            }

            return Ok(endpointDetail);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error retrieving endpoint details for {id}");
            return StatusCode(500, new { 
                message = "Internal server error", 
                endpointId = id,
                errorDetails = ex.Message
            });
        }
    }

    /// <summary>
    /// Lists all endpoints with basic information
    /// </summary>
    /// <returns>Collection of endpoint summaries</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<IEnumerable<EndpointSummaryDto>>> GetAllEndpointsAsync()
    {
        try 
        {
            _logger.LogInformation("Retrieving all endpoints");

            var endpoints = await _endpointService.GetAllEndpointsAsync();

            return Ok(endpoints);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all endpoints");
            return StatusCode(500, new { 
                message = "Internal server error retrieving endpoints",
                errorDetails = ex.Message
            });
        }
    }

    /// <summary>
    /// Creates a new endpoint
    /// </summary>
    /// <param name="endpointDto">Details of the endpoint to create</param>
    /// <returns>Created endpoint ID</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<Guid>> CreateEndpointAsync(
        [FromBody] EndpointDetailDto endpointDto)
    {
        try 
        {
            _logger.LogInformation($"Creating new endpoint: {endpointDto.Endpoint.Name}");

            var endpointId = await _endpointService.CreateEndpointAsync(endpointDto);

            return CreatedAtAction(
                nameof(GetEndpointByIdAsync), 
                new { id = endpointId }, 
                endpointId
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating endpoint: {endpointDto.Endpoint.Name}");
            return StatusCode(500, new { 
                message = "Internal server error creating endpoint",
                errorDetails = ex.Message
            });
        }
    }

    /// <summary>
    /// Updates an existing endpoint
    /// </summary>
    /// <param name="id">Unique identifier of the endpoint to update</param>
    /// <param name="endpointDto">Updated endpoint details</param>
    /// <returns>No content if successful</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> UpdateEndpointAsync(
        [FromRoute] Guid id, 
        [FromBody] EndpointDetailDto endpointDto)
    {
        try 
        {
            // Ensure the ID in the route matches the DTO
            if (id != endpointDto.Endpoint.Id)
            {
                return BadRequest(new { 
                    message = "Endpoint ID mismatch",
                    routeId = id,
                    dtoId = endpointDto.Endpoint.Id
                });
            }

            _logger.LogInformation($"Updating endpoint: {id}");

            var updated = await _endpointService.UpdateEndpointAsync(endpointDto);

            if (!updated)
            {
                return NotFound(new { 
                    message = "Endpoint not found", 
                    endpointId = id 
                });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error updating endpoint: {id}");
            return StatusCode(500, new { 
                message = "Internal server error updating endpoint",
                endpointId = id,
                errorDetails = ex.Message
            });
        }
    }

    /// <summary>
    /// Deletes an endpoint
    /// </summary>
    /// <param name="id">Unique identifier of the endpoint to delete</param>
    /// <returns>No content if successful</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> DeleteEndpointAsync(
        [FromRoute] Guid id)
    {
        try 
        {
            _logger.LogInformation($"Deleting endpoint: {id}");

            var deleted = await _endpointService.DeleteEndpointAsync(id);

            if (!deleted)
            {
                return NotFound(new { 
                    message = "Endpoint not found", 
                    endpointId = id 
                });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting endpoint: {id}");
            return StatusCode(500, new { 
                message = "Internal server error deleting endpoint",
                endpointId = id,
                errorDetails = ex.Message
            });
        }
    }
}