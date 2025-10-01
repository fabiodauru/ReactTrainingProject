using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity.Data;
using Microsoft.AspNetCore.Mvc;
using trainingProjectAPI.DTO_s;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Controller
{
    [Authorize]
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
        public Task<ServiceResponse<User>> Login([FromBody] LoginRequestDto<User> request)
        {
            return _userService.CheckLogin(request.Username, request.Password);
        }
        
        [HttpPost("register")]
        public async Task<ServiceResponse<User>> Register([FromBody] RegisterRequestDto user)
        {
            var userToRegister = MapDtoToUser(user);
            return await _userService.Register(userToRegister);
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
