using trainingProjectAPI.Models.DTOs.UserRequestDTOs;

namespace trainingProjectAPI.Features.UserFeature;

public interface IUserService
{
    Task<Models.Domain.User> LoginAsync(LoginRequestDto loginDto);
    Task<Models.Domain.User> RegisterAsync(RegisterRequestDto userDto);
    Task<Models.Domain.User> ReplaceUserAsync(Guid id, ReplaceUserRequestDto userReplaceRequestDto);
    Task<Models.Domain.User> GetUserByIdAsync(Guid userId);
    Task DeleteUserAsync(Guid userId);
    Task<Models.Domain.User> UpdateUserAsync(Guid userId, string property, object value);
    Task<Models.Domain.User> GetUserByPropertyAsync(string property, object value);
    Task<Models.Domain.User> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto changePasswordRequestDto);
}