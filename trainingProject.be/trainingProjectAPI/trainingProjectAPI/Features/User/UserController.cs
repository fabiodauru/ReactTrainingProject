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
        public async Task<IActionResult> Me()
        {
            Guid userId = this.GetUserId();
            User me = await _userService.GetUserByIdAsync(userId);
            return Ok(me);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(Guid id)
        {
            User user = await _userService.GetUserByIdAsync(id);
            return Ok(user);
        }

        [HttpPatch("update")]
        public async Task<IActionResult> Replace([FromBody] ReplaceUserRequestDto userReplaceRequestDto)
        {
            Guid userId = this.GetUserId();
            User response = await _userService.ReplaceUserAsync(userId, userReplaceRequestDto);
            return Ok(response);
        }

        //TODO: Old Password in Service überprüfen und dann ändern 
        [HttpPatch("update/password")]
        public async Task<IActionResult> UpdatePassword([FromBody] UpdatePasswordRequestDto updatePasswordRequestDto)
        {
            string oldPassword = updatePasswordRequestDto.OldPassword;
            string newPassword = updatePasswordRequestDto.NewPassword;

            Guid userId = this.GetUserId();
            User response = await _userService.UpdateUserAsync(userId,"Password", newPassword);
            Response.Cookies.Delete("token");
            return Ok(response);
        }

        [HttpDelete("delete")]
        public async Task<IActionResult> DeleteUser()
        {
            Guid userId = this.GetUserId();
            await _userService.DeleteUserAsync(userId);
            Response.Cookies.Delete("token");
            return Ok();
        }

        [HttpGet("socialMedia/{username}")]
        public async Task<IActionResult> GetUserByUsername(string username)
        {
            User response = await _userService.GetUserByPropertyAsync("Username", username);
            return Ok(response);
        }

        //TODO: Implement FollowUser in Service
        /*
        [HttpGet("follow/{followUsername}")]
        public async Task<IActionResult> FollowUser(string followUsername)
        {
            Guid userId = this.GetUserId();
            var followUser = _userService.GetUserByPropertyAsync("Username", followUsername);
            var response = await _userService.FollowUser(userId, followUser.Id);
            return Ok(response);
        }
        

        [HttpGet("unfollow/{unfollowUsername}")]
        public async Task<UnfollowUserResponseDto> UnfollowUser(string unfollowUsername)
        {
            var user = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(user, out var userId);
            var unfollowUser = _userService.GetUserByUsernameAsync(unfollowUsername).Result;
            return await _userService.UnfollowUser(userId, unfollowUser.Id);
        }
        */
    }
}
