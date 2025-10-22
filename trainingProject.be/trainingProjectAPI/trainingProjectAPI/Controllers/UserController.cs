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
        
        [HttpPost("/update")]
        public async Task<UserResponseDto> UpdateUser([FromBody] UpdateUserRequestDto userUpdateRequestDto)
        {
            throw new NotImplementedException();
        }

        [HttpPost("/update/password")]
        public async Task<bool> UpdatePassword()
        {
            throw new NotImplementedException();
        }

        private User UserMapper(UpdateUserRequestDto dto)
        {
            var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(user, out var userId);
            
            var OldUser = _userService.GetUserByIdAsync(userId).Result;

            if (!string.IsNullOrEmpty(dto.Email))
            {
                OldUser.Email = dto.Email;
            }
        }
    }
}
