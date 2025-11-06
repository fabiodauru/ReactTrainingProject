using trainingProjectAPI.Models.Domain;
using trainingProjectAPI.Models.DTOs.UserRequestDTOs;

namespace trainingProjectAPI.Features.UserFeature;

public interface IUserService
{
    Task<User> LoginAsync(LoginRequestDto loginDto);
    Task<User> RegisterAsync(RegisterRequestDto userDto);
    Task<User> ReplaceUserAsync(Guid id, ReplaceUserRequestDto userReplaceRequestDto);
    Task<User> GetUserByIdAsync(Guid userId);
    Task DeleteUserAsync(Guid userId);
    Task<User> UpdateUserAsync(Guid userId, string property, object value);
    Task<User> GetUserByPropertyAsync(string property, object value);
    Task<User> ChangePasswordAsync(Guid userId, ChangePasswordRequestDto changePasswordRequestDto);
    Task<User> ManageFollowingAsync(Guid userId, ManageFollowingRequestDto manageFollowingRequestDto);
}