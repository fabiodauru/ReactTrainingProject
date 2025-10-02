using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using trainingProjectAPI.DTO_s;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;
using trainingProjectAPI.Models.Enums;

namespace trainingProjectAPI.Controller
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
        public async Task<ActionResult<TokenResponseDto<User>>> Login([FromBody] LoginRequestDto<User> loginDto)
        {
            var response = await _userService.CheckLogin(loginDto.Username, loginDto.Password);

            if (response.Message == ServiceMessage.Success && response.Token != null)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpPost("register")]
        public async Task<ActionResult<TokenResponseDto<User>>> Register([FromBody] RegisterRequestDto<User> userDto)
        {
            var response = await _userService.Register(MapDtoToUser(userDto));

            if (response.Message == ServiceMessage.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        private User MapDtoToUser(RegisterRequestDto<User> dto)
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
