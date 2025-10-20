using trainingProjectAPI.DTOs;
using trainingProjectAPI.Models;

namespace trainingProjectAPI.Interfaces;

public interface IUserService
{
    Task<ServiceResponse<AuthenticationResponseDto>> CheckLoginAsync(string username, string password);
    Task<ServiceResponse<AuthenticationResponseDto>> RegisterAsync(User user);

    Task<UserResponseDto> GetUserByIdAsync(Guid userId);
}