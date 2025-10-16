using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using trainingProjectAPI.DTOs;
using trainingProjectAPI.Interfaces;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ILogger<UserController> _logger;
        private readonly IUserService _userService;

        public UserController(ILogger<UserController> logger, IUserService userService)
        {
            _logger = logger;
            _userService = userService;
        }

        [HttpGet("me")]
        public async Task<UserResponseDto<User>> Me()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _userService.GetUserByIdAsync(userId);
        }

        [HttpGet("{id}")]
        public async Task<UserResponseDto<User>> GetUserById(Guid id)
        {
            return await _userService.GetUserByIdAsync(id.ToString());
        }

        [HttpGet("user")]
        public async Task<ListResponseDto<TripReponseDto>> Trips()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _userService.GetUserTripsAsync(userId);
        }
    }
}
