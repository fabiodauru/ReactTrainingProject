using Amazon.Runtime;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;
using trainingProjectAPI.Services;

namespace trainingProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticateController : ControllerBase
    {
        private readonly ILogger<AuthenticateController> _logger;
        private readonly IUserService _userService;
        private readonly AuthService _authService;
        private readonly IEmailService _emailService;

        public AuthenticateController(IUserService userService, ILogger<AuthenticateController> logger, AuthService authService, IEmailService emailService)
        {
            _userService = userService;
            _logger = logger;
            _authService = authService;
            _emailService = emailService;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthenticationResponseDto>> LoginAsync([FromBody] LoginRequestDto loginDto)
        {
            try
            {
                var response = await _userService.CheckLoginAsync(loginDto.Username, loginDto.Password);

                if (response.Message != ServiceMessage.Error && response.Result != null)
                {
                    // Cookie setzen
                    if (!string.IsNullOrEmpty(response.Result.Token))
                    {
                        Response.Cookies.Append("token", response.Result.Token, new CookieOptions
                        {
                            HttpOnly = true,
                            Secure = false,
                            SameSite = SameSiteMode.Strict,
                            Expires = response.Result.Expiration
                        });
                    }

                    response.Result.Message = response.Message.ToString();
                    _logger.LogInformation($"Successfully posted {nameof(LoginRequestDto)}.");

                    return response.Message switch
                    {
                        ServiceMessage.Success => Ok(response.Result),
                        ServiceMessage.Invalid => BadRequest(response.Result),
                        ServiceMessage.NotFound => NotFound(response.Result),
                        ServiceMessage.Error => StatusCode(500, response.Result),
                        _ => BadRequest(response.Result)
                    };
                }

                throw new Exception();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unsuccessfully posted {nameof(LoginRequestDto)}.");
                return BadRequest();
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthenticationResponseDto>> RegisterAsync([FromBody] RegisterRequestDto userDto)
        {
            try
            {
                var response = await _userService.RegisterAsync(MapDtoToUser(userDto));

                if (response.Message != ServiceMessage.Error && response.Result != null)
                {
                    response.Result.Message = response.Message.ToString();
                    _logger.LogInformation($"Successfully posted {nameof(RegisterRequestDto)}.");
                    return Ok(response.Result);
                }

                throw new Exception();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Unsuccessfully posted {nameof(RegisterRequestDto)}.");
                return BadRequest();
            }
        }

        [HttpGet("check-token")]
        public IActionResult CheckToken([FromQuery] string? token = null)
        {
            token ??= Request.Cookies["token"];
            if (string.IsNullOrEmpty(token))
                return BadRequest("No token provided");

            (bool isValid, string? purpose) response = _authService.Check(token);
            
            if (response.isValid)
            {
                return Ok(new { isValid = true, purpose = response.purpose });
            }
            else
            {
                return Unauthorized(new { isValid = false });
            } 
        }

        [HttpPatch("update/password")]
        public async Task<ServiceResponse<UpdateResponseDto<User>>> UpdatePassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            string password = forgotPasswordDto.Password;
            string? user = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(user, out Guid userId);
            User newUser = await _userService.GetUserByIdAsync(userId);
            newUser.Password = password;
            return await _userService.UpdateAsync(userId, newUser);
        }


        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("token");
            return Ok();
        }

        [HttpGet("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromQuery] string email)
        {
            try
            {
                var user = await _userService.GetUserByEmailAsync(email);
                if (user.Result == null)
                {
                    return NotFound("User with the provided email does not exist.");
                }

                string resetToken = _authService.CreateJwtToken(user.Result, TimeSpan.FromHours(1), "PasswordReset");
                _emailService.SendPasswordResetEmail(user.Result.Email, resetToken);
                return Ok("Password reset email sent.");
            }
            catch (Exception e)
            {
                _logger.LogError(e, "Error occurred while processing forgot password request.");
                return StatusCode(500, "An error occurred while processing your request.");
            }
        }
        
        private User MapDtoToUser(RegisterRequestDto dto)
        {
            return new User
            {
                Username = dto.Username,
                Password = dto.Password,
                Email = dto.Email,
                UserFirstName = dto.UserFirstName,
                UserLastName = dto.UserLastName,
                Address = dto.Address,
                Birthday = dto.Birthday,
                JoiningDate = DateTime.Now
            };
        }
    }
}
