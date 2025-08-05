using Microsoft.AspNetCore.Mvc;
using BCrypt.Net;
using ThingConnect.Pulse.Server.Models;
using ThingConnect.Pulse.Server.Services;

namespace ThingConnect.Pulse.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DatabaseService _databaseService;
        private readonly JwtService _jwtService;

        public AuthController(DatabaseService databaseService, JwtService jwtService)
        {
            _databaseService = databaseService;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || 
                string.IsNullOrWhiteSpace(request.Email) || 
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Username, email, and password are required.");
            }

            if (request.Password.Length < 6)
            {
                return BadRequest("Password must be at least 6 characters long.");
            }

            var existingUserByUsername = await _databaseService.GetUserByUsernameAsync(request.Username);
            if (existingUserByUsername != null)
            {
                return BadRequest("Username already exists.");
            }

            var existingUserByEmail = await _databaseService.GetUserByEmailAsync(request.Email);
            if (existingUserByEmail != null)
            {
                return BadRequest("Email already exists.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };

            user.Id = await _databaseService.CreateUserAsync(user);

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Email = user.Email
            });
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest("Username and password are required.");
            }

            var user = await _databaseService.GetUserByUsernameAsync(request.Username);
            if (user == null)
            {
                return BadRequest("Invalid username or password.");
            }

            if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return BadRequest("Invalid username or password.");
            }

            var token = _jwtService.GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                Username = user.Username,
                Email = user.Email
            });
        }
    }
}