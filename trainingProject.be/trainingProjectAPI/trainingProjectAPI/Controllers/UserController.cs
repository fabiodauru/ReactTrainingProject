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
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("me")]
        public async Task<UserResponseDto> Me()
        {
            var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(user, out var userId);
            return await _userService.GetUserByIdAsync(userId);
        }

        [HttpGet("{id}")]
        public async Task<UserResponseDto> GetUserById(Guid id)
        {
            return await _userService.GetUserByIdAsync(id);
        }

        [HttpGet("socialMedia/{username}")]
        public async Task<UserResponseDto> GetUserByUsername(string username)
        {
            return await _userService.GetUserByUsernameAsync(username);
        }
    }
}
