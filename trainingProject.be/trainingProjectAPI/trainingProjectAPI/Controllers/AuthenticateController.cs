using Microsoft.AspNetCore.Mvc;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthenticateController : ControllerBase
    {

        private readonly ILogger<AuthenticateController> _logger;
        private readonly IUserService _userService;

        public AuthenticateController(IUserService userService, ILogger<AuthenticateController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthenticationResponseDto>> Login([FromBody] LoginRequestDto loginDto)
        {
            try
            {
                var response = await _userService.CheckLogin(loginDto.Username, loginDto.Password);

                if (response is { Message: ServiceMessage.Success, Result.Token: not null })
                {
                    _logger.LogInformation($"Successfully posted {nameof(LoginRequestDto)}.");
                    return Ok(response);
                }
                throw new Exception();
            }
            catch (Exception)
            {
                _logger.LogError($"Unsuccessfully posted {nameof(LoginRequestDto)}.");
                return BadRequest();   
            }
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthenticationResponseDto>> Register([FromBody] RegisterRequestDto userDto)
        {
            try
            {
                var response = await _userService.Register(MapDtoToUser(userDto));

                if (response.Message == ServiceMessage.Success)
                {
                    _logger.LogInformation($"Successfully posted {nameof(RegisterRequestDto)}.");
                    return Ok(response);
                }

                throw new Exception();
            }
            catch (Exception)
            {
                _logger.LogError($"Unsuccessfully posted {nameof(RegisterRequestDto)}.");
                return BadRequest();
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
