using Microsoft.AspNetCore.Mvc;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly DatabaseService _databaseService;
        private readonly ILogger<SetupController> _logger;

        public SetupController(DatabaseService databaseService, ILogger<SetupController> logger)
        {
            _databaseService = databaseService;
            _logger = logger;
        }

        [HttpGet("status")]
        public async Task<ActionResult<SetupStatusResponse>> GetSetupStatus()
        {
            try
            {
                _logger.LogInformation("Checking setup status");
                var hasUsers = await _databaseService.HasAnyUsersAsync();
                
                _logger.LogInformation("Setup status check completed. HasUsers: {HasUsers}", hasUsers);
                return Ok(new SetupStatusResponse
                {
                    IsSetupRequired = !hasUsers,
                    HasAdminUser = hasUsers
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking setup status");
                
                // Return safe fallback requiring setup
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
                _logger.LogInformation("Attempting to complete setup");
                var hasUsers = await _databaseService.HasAnyUsersAsync();
                
                if (hasUsers)
                {
                    _logger.LogInformation("Setup completion requested but setup already completed");
                    return Ok(new { message = "Setup already completed" });
                }
                
                _logger.LogWarning("Setup completion requested but no users exist");
                return BadRequest("Cannot complete setup without at least one user account");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred during setup completion");
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