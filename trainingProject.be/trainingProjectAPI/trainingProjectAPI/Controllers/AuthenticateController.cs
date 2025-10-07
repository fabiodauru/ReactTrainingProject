using Microsoft.AspNetCore.Mvc;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;
using trainingProjectAPI.Utilities;

namespace trainingProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticateController : ControllerBase
    {
        private readonly ILogger<AuthenticateController> _logger;
        private readonly IUserService _userService;
        private readonly CheckToken _checkToken;

        public AuthenticateController(IUserService userService, ILogger<AuthenticateController> logger, CheckToken checkToken)
        {
            _userService = userService;
            _logger = logger;
            _checkToken = checkToken;
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
                    return Ok(response.Result);
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

        [HttpGet("checkToken")]
        public IActionResult CheckToken()
        {
            var token = Request.Cookies["token"] ?? string.Empty;
            var response = _checkToken.Check(token);

            if (response)
            {
                return Ok(response);
            }

            return Unauthorized(response);
        }

        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("token");
            return Ok();
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
