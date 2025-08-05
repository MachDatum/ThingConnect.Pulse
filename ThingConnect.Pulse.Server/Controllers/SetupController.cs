using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly DatabaseService _databaseService;

        public SetupController(DatabaseService databaseService)
        {
            _databaseService = databaseService;
        }

        [HttpGet("status")]
        public async Task<ActionResult<SetupStatusResponse>> GetSetupStatus()
        {
            try
            {
                var hasUsers = await _databaseService.HasAnyUsersAsync();
                
                return Ok(new SetupStatusResponse
                {
                    IsSetupRequired = !hasUsers,
                    HasAdminUser = hasUsers
                });
            }
            catch
            {
                return Ok(new SetupStatusResponse
                {
                    IsSetupRequired = true,
                    HasAdminUser = false
                });
            }
        }

        [HttpPost("complete")]
        public async Task<ActionResult> CompleteSetup()
        {
            try
            {
                var hasUsers = await _databaseService.HasAnyUsersAsync();
                
                if (hasUsers)
                {
                    return Ok(new { message = "Setup already completed" });
                }
                
                return BadRequest("Cannot complete setup without at least one user account");
            }
            catch
            {
                return StatusCode(500, "An error occurred during setup completion");
            }
        }
    }

    public class SetupStatusResponse
    {
        public bool IsSetupRequired { get; set; }
        public bool HasAdminUser { get; set; }
    }
}