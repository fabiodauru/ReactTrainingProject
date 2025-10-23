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
            var me = await _userService.GetUserByIdAsync(userId);
            return MapToDto(me);
        }

        [HttpGet("{id}")]
        public async Task<UserResponseDto> GetUserById(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            return MapToDto(user);
        }
        
        [HttpPatch("update")]
        public async Task<ServiceResponse<UpdateResponseDto<User>>> UpdateUser([FromBody] UpdateUserRequestDto userUpdateRequestDto)
        {
            var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(user, out var userId);
            var existingUser =  await _userService.GetUserByIdAsync(userId);
            var updatedUser = MapToModel(userUpdateRequestDto, existingUser);
            return await _userService.UpdateAsync(userId, updatedUser);
        }

        [HttpPatch("update/password")]
        public async Task<bool> UpdatePassword([FromBody] string newPassword)
        {
            string? user = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(user, out Guid userId);
            bool isSuccessful =  await _userService.UpdatePasswordAsync(userId, newPassword);
            return isSuccessful;
        }
        
        [HttpDelete("delete")]
        public async Task<bool> DeleteUser()
        {
            string? user = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(user, out Guid userId);
            return await _userService.DeleteUserAsync(userId);
        }

        private UserResponseDto MapToDto(User user)
        {
            return new UserResponseDto
            {
                Id = user.Id,
                Email = user.Email,
                Username = user.Username,
                UserFirstName = user.UserFirstName,
                UserLastName = user.UserLastName,
                ProfilePictureUrl = user.ProfilePictureUrl,
                JoiningDate = user.JoiningDate,
                Address = user.Address,
                Birthday = user.Birthday
            };
        }
        
        private User MapToModel(UpdateUserRequestDto dto, User user)
        {
            if (dto.Email != null)
            {
                user.Email = dto.Email;
            }
            if (dto.UserFirstName != null)
            {
                user.UserFirstName = dto.UserFirstName;
            }
            if (dto.UserLastName != null)
            {
                user.UserLastName = dto.UserLastName;
            }
            if (dto.ProfilePictureUrl != null)
            {
                user.ProfilePictureUrl = dto.ProfilePictureUrl;
            }
            if (dto.Address != null)
            {
                user.Address = dto.Address;
            }
            if (dto.Birthday != null)
            {
                user.Birthday = dto.Birthday.Value;
            }

            return user;
        }
    }
}
