using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IUserService
{
    Task<ServiceResponse<AuthenticationResponseDto>> CheckLoginAsync(string username, string password);
    Task<ServiceResponse<AuthenticationResponseDto>> RegisterAsync(User user);
    Task<User> GetUserByIdAsync(Guid userId);
    Task<ServiceResponse<UpdateResponseDto>> UpdateAsync(Guid id, User user);
    Task<bool> DeleteUserAsync(Guid userId);
    Task<bool> UpdatePasswordAsync(Guid userId, string oldPassword, string newPassword);
    Task<UserResponseDto> GetUserByUsernameAsync(string username);
    Task<FollowUserResponseDto> FollowUser(Guid userId, Guid followedUserId);
    Task<UnfollowUserResponseDto> UnfollowUser(Guid userId, Guid unfollowUserId);
    Task<ServiceResponse<User>> GetUserByEmailAsync(string email);
}