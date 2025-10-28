using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IUserService
{
    Task<ServiceResponse<AuthenticationResponseDto>> CheckLoginAsync(string username, string password);
    Task<ServiceResponse<AuthenticationResponseDto>> RegisterAsync(User user);
    Task<UserResponseDto> GetUserByIdAsync(Guid userId);
    Task<UserResponseDto> GetUserByUsernameAsync(string username);
    Task<FollowUserResponseDto> FollowUser(Guid userId, Guid followedUserId);
    Task<UnfollowUserResponseDto> UnfollowUser(Guid userId, Guid unfollowUserId);
}