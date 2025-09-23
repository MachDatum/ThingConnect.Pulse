using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Only authenticated users can access
public sealed class GroupsController : ControllerBase
{
    private readonly IGroupService _groupService;
    private readonly ILogger<GroupsController> _logger;

    public GroupsController(IGroupService groupService, ILogger<GroupsController> logger)
    {
        _groupService = groupService;
        _logger = logger;
    }

    /// <summary>
    /// Get all master groups.
    /// </summary>
    /// <returns>List of groups</returns>
    [HttpGet]
    public async Task<ActionResult<List<GroupDto>>> GetGroupsAsync()
    {
        try
        {
            var groups = await _groupService.GetAllGroupsAsync();
            return Ok(groups);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching groups");
            return StatusCode(500, new { message = "Failed to retrieve groups", error = ex.Message });
        }
    }

    /// <summary>
    /// Get a single group by ID.
    /// </summary>
    /// <param name="id">Group ID</param>
    /// <returns>Group details</returns>
    [HttpGet("{id}")]
    public async Task<ActionResult<GroupDto>> GetGroupByIdAsync(string id)
    {
        try
        {
            var group = await _groupService.GetGroupByIdAsync(id);
            if (group == null)
            {
                return NotFound(new { message = "Group not found" });
            }

            return Ok(group);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching group with ID {GroupId}", id);
            return StatusCode(500, new { message = "Failed to retrieve group", error = ex.Message });
        }
    }
}
