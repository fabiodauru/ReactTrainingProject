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
        public Task<TokenResponseDto<User>> Login([FromBody] LoginRequestDto<User> request)
        {
            try
            {
                return _userService.CheckLogin(request.Username, request.Password);
            }
            catch (Exception e)
            {
                _logger.LogError($"Error by login user: {e.Message}");
                return Task.FromResult(new TokenResponseDto<User>
                {
                    Message = ServiceMessage.Error,
                    Result = null,
                    Token = string.Empty,
                    Expiration = DateTime.MinValue,
                    Username = request.Username
                });
            }
        }

        [HttpPost("register")]
        public async Task<TokenResponseDto<User>> Register([FromBody] RegisterRequestDto user)
        {
            try
            {
                var userToRegister = MapDtoToUser(user);
                return await _userService.Register(userToRegister);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error by registering user: {ex.Message}");
                return new TokenResponseDto<User>
                {
                    Message = ServiceMessage.Error,
                    Result = null,
                    Token = string.Empty,
                    Expiration = DateTime.MinValue,
                    Username = user.Username
                };
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
