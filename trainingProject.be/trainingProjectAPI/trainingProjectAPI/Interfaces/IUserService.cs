using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IUserService
{
    Task<ServiceResponse<AuthenticationResponseDto>> CheckLoginAsync(string username, string password);
    Task<ServiceResponse<AuthenticationResponseDto>> RegisterAsync(User user);
    Task<User> GetUserByIdAsync(Guid userId);
    Task<ServiceResponse<UpdateResponseDto<User>>> UpdateAsync(Guid id, User user);
    Task<bool> DeleteUserAsync(Guid userId);
    Task<bool> UpdatePasswordAsync(Guid userId, string oldPassword, string newPassword);
}