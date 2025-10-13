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
        private readonly IPersistencyService _persistencyService;
        public UserController(ILogger<UserController> logger, IPersistencyService persistencyService)
        {
            _logger = logger;
            _persistencyService = persistencyService;
        }

        [HttpGet("me")]
        public async Task<UserResponseDto<User>> Me()
        {
            var response = new UserResponseDto<User>
            {
                Id = Guid.Empty,
                Username = string.Empty,
                UserFirstName = string.Empty,
                UserLastName = string.Empty
            };
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("No user ID found in claims.");
                    return response;
                }

                var user = await _persistencyService.FindByIdAsync<User>(Guid.Parse(userId));
                if (!user.Found || user.Result == null)
                {
                    _logger.LogWarning($"User with ID {userId} not found.");
                    return response;
                }

                _logger.LogInformation("Successfully retrieved user information.");
                return new UserResponseDto<User>
                {
                    Id = user.Result.Id,
                    Username = user.Result.Username,
                    UserFirstName = user.Result.UserFirstName,
                    UserLastName = user.Result.UserLastName,
                    ProfilePictureUrl = user.Result.ProfilePictureUrl,
                    Email = user.Result.Email,
                    Address = user.Result.Address,
                    Birthday = user.Result.Birthday,
                    JoiningDate = user.Result.JoiningDate
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user information.");
                return response;
            }
        }

        [HttpGet("{id}")]
        public async Task<UserResponseDto<User>> GetUserById(Guid id)
        {
            var response = new UserResponseDto<User>
            {
                Id = Guid.Empty,
                Username = string.Empty,
                UserFirstName = string.Empty,
                UserLastName = string.Empty
            };
            try
            {
                var user = await _persistencyService.FindByIdAsync<User>(id);
                if (!user.Found || user.Result == null)
                {
                    _logger.LogWarning($"User with ID {id} not found.");
                    return response;
                }
                _logger.LogInformation("Successfully retrieved user information.");
                return new UserResponseDto<User>
                {
                    Id = user.Result.Id,
                    Username = user.Result.Username,
                    ProfilePictureUrl = user.Result.ProfilePictureUrl,
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user information.");
                return response;
            }
        }
        
        [HttpGet("trips")]
        public async Task<ListResponseDto<Trip>> Trips()
        {
            var response = new ListResponseDto<Trip>
            {
                Items = new List<Trip>()
            };
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    _logger.LogWarning("No user ID found in claims.");
                    return response;
                }

                var user = await _persistencyService.FindByIdAsync<User>(Guid.Parse(userId));
                if (!user.Found || user.Result == null)
                {
                    _logger.LogWarning($"User with ID {userId} not found.");
                    return response;
                }

                _logger.LogInformation("Successfully retrieved user's trips.");
                return new ListResponseDto<Trip>
                {
                    Items = user.Result.Trips
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user's trips.");
                return response;
            }
        }
    }
}
