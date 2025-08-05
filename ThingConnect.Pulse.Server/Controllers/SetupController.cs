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
                _logger.LogInformation("Checking setup status - determining if initial setup is required");
                var hasUsers = await _databaseService.HasAnyUsersAsync();
                
                var response = new SetupStatusResponse
                {
                    IsSetupRequired = !hasUsers,
                    HasAdminUser = hasUsers
                };
                
                _logger.LogInformation("Setup status check completed. IsSetupRequired: {IsSetupRequired}, HasAdminUser: {HasAdminUser}", 
                    response.IsSetupRequired, response.HasAdminUser);
                
                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking setup status. Falling back to requiring setup for safety. Error: {ErrorMessage}", 
                    ex.Message);
                
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