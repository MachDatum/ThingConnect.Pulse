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

            // Align with frontend password requirements
            const int MIN_PASSWORD_LENGTH = 8;
            var passwordRegex = new System.Text.RegularExpressions.Regex(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]");
            
            if (request.Password.Length < MIN_PASSWORD_LENGTH)
            {
                return BadRequest($"Password must be at least {MIN_PASSWORD_LENGTH} characters long.");
            }

            if (!passwordRegex.IsMatch(request.Password))
            {
                return BadRequest("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
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